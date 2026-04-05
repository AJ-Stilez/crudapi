import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Ip,
  Req,
  HttpException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UpdateAuthDto } from '../dtos/update-auth.dto';
import { AuthenticateValidator } from '../dtos/authenticate.dto';
import { CreateAuthDto } from 'src/dtos/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Permission } from 'src/enums/permissions.enum';
import { PermissionGuard } from 'src/guards/permission.guard';
import { AuthUser } from 'src/entities/auth.entity';
import { AdminInterceptor } from 'src/interceptors/admin.interceptor';
import { AdminCacheInterceptor } from 'src/interceptors/admin-cache.interceptor';
import { HeaderInterceptor } from 'src/interceptors/header-metadata-interceptor';
import { User } from 'src/decorators/params/user.decorator';
import { Logger } from 'nestjs-pino';
import { AccessType } from 'src/enums/access_type';
import { encryptAccessToken } from 'src/utils/refresh-token-encryption.utils';
import { RefreshTokenHeader } from 'src/decorators/refresh-token-header.decorator';
import { handleAndThrowError } from 'src/utils/error.utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  @Post('authenticate')
  async authenticate(
    @Body() data: AuthenticateValidator,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';

    // You can add IP geolocation service here to get location
    const location = await this.getLocationFromIP(ip);

    const deviceInfo = {
      deviceId: data.deviceId, // Optional deviceId from frontend
      userAgent,
      ipAddress: ip,
      deviceName: data.deviceName,
      osVersion: data.osVersion,
      deviceType: data.deviceType,
      location,
    };

    const { user, accessToken, refreshToken, deviceSession } =
      await this.authService.authenticate(
        data.userType as AccessType,
        data.identifier,
        data.password,
        deviceInfo,
      );

    // Encrypt access tokens before returning
    const encryptedAccessToken = accessToken
      ? encryptAccessToken(accessToken)
      : null;
    // const encryptedEstateAccessToken = estateAccessToken
    // ? encryptAccessToken(estateAccessToken)
    // : null;

    return {
      accessToken: encryptedAccessToken,
      // estateAccessToken: encryptedEstateAccessToken,
      refreshToken: refreshToken || undefined, // Encrypted refresh token (optional)
      // firstTimeVerificationToken,
      user,
      deviceSession,
    };
  }

  /**
   * Get location from IP address using IP geolocation service
   */
  private async getLocationFromIP(
    ip: string,
  ): Promise<{ country?: string; city?: string; region?: string } | undefined> {
    try {
      // Skip private/local IPs
      if (
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.')
      ) {
        return undefined;
      }

      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name,
          city: data.city,
          region: data.region,
        };
      }

      return undefined;
    } catch (error) {
      this.logger.warn(`Failed to get location for IP ${ip}: ${error.message}`);
      return undefined;
    }
  }

  @Post('refresh-token')
  async refreshToken(
    @RefreshTokenHeader() encryptedRefreshToken: string,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    const deviceInfo = {
      deviceId: (req.headers['x-device-id'] as string) || undefined, // Optional deviceId from header
      userAgent: req.headers['user-agent'] || '',
      ipAddress: ip,
    };
    try {
      // decrypt and validate the refresh token, then issue new tokens
      const { userId, authId, newRefreshToken } =
        await this.authService.refreshAccessToken(
          encryptedRefreshToken,
          deviceInfo,
        );

      // Generate new access token
      const accessToken = await this.authService.generateAccessToken(
        {
          userId,
          authId,
          jti: undefined, // No JTI needed for refresh token flow
        },
        AccessType.USER, // Default - can be enhanced to detect from refresh token
      );

      // Encrypt access token before returning
      const encryptedAccessToken = encryptAccessToken(accessToken);
      return {
        accessToken: encryptedAccessToken, // Encrypted access token
        refreshToken: newRefreshToken, // Rotated refresh token (encrypted with frontend secret)
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return handleAndThrowError(
        new HttpException(
          'Failed to refresh token. Please sign in again.',
          HttpStatus.UNAUTHORIZED,
        ),
        this.logger,
        'Failed to refresh token',
      );
    }
  }
}
