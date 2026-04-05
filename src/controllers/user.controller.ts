import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from 'src/services/user.service';
import { CreateUserValidator } from 'src/validators/create-user.validator';
import type { Request } from 'express';
import { AccessType } from 'src/enums/access_type';
import { AnyObject } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { handleAndThrowError } from 'src/utils/error.utils';
import { omit } from 'lodash';
import { AuthService } from 'src/services/auth.service';
import { encryptAccessToken } from 'src/utils/refresh-token-encryption.utils';
import {
  NEW_USER_CREATED_FOR_AUTH,
  NewUserCreatedEvent,
} from 'src/events/user.event';
import { Logger } from 'nestjs-pino';
import { ConditionalFilesInterceptor } from 'src/interceptors/conditional-files.interceptor';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: Logger,
  ) {}

  @UseInterceptors(ConditionalFilesInterceptor('selfie', 1))
  @Post('create-account')
  async createUser(
    @UploadedFiles() selfie: Array<Express.Multer.File> = [],
    @Body() data: CreateUserValidator,
    @Req() req: Request,
  ) {
    const deviceInfo = {
      userAgent: req.headers['user-agent'] || 'unknown',
      ipAddress:
        (req as Request & { ip?: string }).ip ||
        req.socket?.remoteAddress ||
        '',
    };
    return await this.processCreateUser(
      data,
      AccessType.USER,
      selfie ?? [],
      deviceInfo,
    );
  }

  private async processCreateUser(
    data: CreateUserValidator,
    userType: AccessType.USER,
    selfie: Array<Express.Multer.File> = [],
    deviceInfo?: { userAgent: string; ipAddress: string },
  ): Promise<AnyObject> {
    try {
      // const fullName = `${data.lastName} ${data.firstName}`;
      const userData = omit(data, 'tokenId', 'code');
      if (userData.email) {
        userData.email = userData.email.toLowerCase();
      }

      const { user, token } = await this.userService.createUser(
        {
          ...userData,
          userType,
        },
        userType,
        data?.tokenId,
        data?.code,
        selfie,
      );
      const jti = (await import('uuid')).v4();
      const accessToken = await this.authService.generateAccessToken(
        {
          userId: user.id,
          jti,
        },
        userType,
      );
      const encryptedAccessToken = accessToken
        ? encryptAccessToken(accessToken)
        : null;

      if (deviceInfo) {
        await this.authService.createDeviceSessionForNewUser(
          user.id,
          jti,
          deviceInfo,
        );
      }

     

      // COMMENT: We need to ensure the user data exists for the auth db to allow customer login
      this.eventEmitter.emit(
        NEW_USER_CREATED_FOR_AUTH,
        new NewUserCreatedEvent({
          identifier: user.email ?? user.phone!,
          userId: user.id,
          email: user.email,
          phone: user.phone,
          password: user.password,
          userType: userType,
          // assignedEstates: data.assignedEstates || [],
          // token,
          firstName: user.firstName,
        }),
      );

      return { accessToken: encryptedAccessToken };
    } catch (err) {
      handleAndThrowError(err, this.logger, 'Error Creating User');
    }
  }
}