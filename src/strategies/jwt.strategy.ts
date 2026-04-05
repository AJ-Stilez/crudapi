import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Permission } from 'src/enums/permissions.enum';
import { AccessType, AuthData } from 'src/enums/access_type';
import { getSecurityConfig } from 'src/config/security.config';
import { decryptAccessToken } from 'src/utils/refresh-token-encryption.utils';
import { Logger } from 'nestjs-pino';
import { handleAndThrowError } from 'src/utils/error.utils';
import { TokenMappingService } from 'src/services/cache/token-mapping.services';
import { CacheService } from 'src/services/cache/cache.services';
import { DeviceSessionService } from 'src/services/device-session.service';
import dayjs from 'dayjs';
import { AuthService } from 'src/services/auth.service';
import { UserRole } from 'src/utils/app/role.util';

/** Request user shape: AuthData plus id and roles for role-based guards */
export type JwtUser = AuthData & { id: string; roles: string[] };


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   private readonly cacheKeyPrefix = 'jwt_session:';
  private readonly rolesCacheKeyPrefix = 'jwt_roles:';
  private readonly cacheTTL = 300; // 5 minutes cache
  private readonly negativeCacheTTL = 60; // 1 minute for failed validations
  private readonly rolesCacheTTL = 300; // 5 minutes - avoid intermittent empty roles from flaky Auth findOne

  constructor(
    private readonly logger: Logger,
    private readonly tokenMappingService: TokenMappingService,
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
    private readonly deviceSessionService: DeviceSessionService,
  ) {
    super({
        secretOrKey: getSecurityConfig().jwtSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Custom extractor that decrypts the access token
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request: any) => {
          const authHeader = request.headers?.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
          }

          try {
            const encryptedToken = authHeader.substring(7);
            // Store encrypted token in request for blacklist check
            request._encryptedToken = encryptedToken;
            // Decrypt the access token before validation
            return decryptAccessToken(encryptedToken);
          } catch (error) {
            this.logger.warn('Failed to decrypt access token', {
              error: error.message,
            });
            return null;
          }
        },
      ]),
      ignoreExpiration: false,
    });
  }

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(payload: any): Promise<JwtUser> {
    if (!payload) {
      return handleAndThrowError(
        new HttpException('Unauthenticated', HttpStatus.UNAUTHORIZED),
        null,
        'Unauthenticated',
      );
    }

    
    // Resolve opaque IDs to real IDs using token mapping service
    const mapping = await this.tokenMappingService.resolveMappings({
      opaqueUserId: payload.userId,
      opaqueAuthId: payload.authId,
      opaqueAcpId: payload.metadata?.acpId,
    });

     if (!mapping) {
      this.logger.warn('Token mapping not found for opaque IDs', {
        opaqueUserId: payload.userId,
        opaqueAuthId: payload.authId,
      });
      return handleAndThrowError(
        new HttpException(
          'Invalid token: mapping not found',
          HttpStatus.UNAUTHORIZED,
        ),
        null,
        'Token mapping not found',
      );
    }

    // If JTI is present, validate session (with caching)
    if (payload.jti) {
      const sessionCacheKey = `${this.cacheKeyPrefix}${payload.jti}`;

      // Try to get from cache first
      const cachedSession = await this.cacheService.get<{
        isValid: boolean;
        jti: string;
      }>(sessionCacheKey);

      if (cachedSession !== null) {
        if (!cachedSession.isValid) {
          return handleAndThrowError(
            new HttpException(
              'Session expired or invalid',
              HttpStatus.UNAUTHORIZED,
            ),
            null,
            'Invalid session (cached)',
          );
        }

        // Session is valid from cache, update activity asynchronously
        this.deviceSessionService.updateActivity(payload.jti).catch((error) => {
          this.logger.warn('Failed to update session activity', {
            jti: payload.jti,
            error: error.message,
          });
        });

        // Return real IDs from mapping and attach roles for RolesGuard
        return this.attachRoles(mapping, payload);
      }

      // Cache miss - validate session from database using real user ID
      const session = await this.deviceSessionService.findOne({
        jti: payload.jti,
        isActive: true,
        expiresAt: { $gt: dayjs().toDate() },
      });

      if (!session) {
        // Cache negative result
        await this.cacheService.set(
          sessionCacheKey,
          { isValid: false, jti: payload.jti },
          this.negativeCacheTTL,
        );

        this.logger.warn(
          'No device session found for token jti; client may be using an old token',
          {
            jti: payload.jti,
            userId: mapping.userId,
            accessType: payload.accessType,
          },
        );

        return handleAndThrowError(
          new HttpException(
            'Session expired or invalid',
            HttpStatus.UNAUTHORIZED,
          ),
          null,
          'Invalid session',
        );
      }

      // Cache positive result
      await this.cacheService.set(
        sessionCacheKey,
        { isValid: true, jti: payload.jti },
        this.cacheTTL,
      );

      // Update last activity and mark as current session
      await this.deviceSessionService.updateActivity(payload.jti);
    }

    // Return real IDs from mapping and attach roles for RolesGuard
    return this.attachRoles(mapping, payload);
}


  /**
   * Load roles from Auth document and attach to user for role-based guards (e.g. Administrator).
   * Uses a short-lived cache so intermittent Auth findOne failures or replica lag don't yield empty roles.
   * On DB failure, derives admin role from JWT accessType so transient DB/replica issues don't cause 403.
   */
  private async attachRoles(
    mapping: { userId: string; authId: string; acpId?: string },
    payload: { accessType?: string },
  ): Promise<JwtUser> {
    const rolesCacheKey = `${this.rolesCacheKeyPrefix}${mapping.authId}`;
    const cachedRoles = await this.cacheService.get<string[]>(rolesCacheKey);
    if (cachedRoles !== null) {
      return {
        userId: mapping.userId,
        authId: mapping.authId,
        accessType: (payload.accessType as AccessType) ?? AccessType.USER,
        metadata: mapping.acpId ? { acpId: mapping.acpId } : undefined,
        id: mapping.userId,
        roles: cachedRoles,
      };
    }

    const accessType = (payload.accessType as AccessType) ?? AccessType.USER;
    let roles: string[] = [];
    let lastErr: Error | undefined;
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const authDoc = await this.authService.findOne(
          { _id: mapping.authId },
          { select: 'roles' },
        );
        roles = Array.isArray((authDoc as { roles?: string[] })?.roles)
          ? (authDoc as { roles: string[] }).roles
          : [];
        await this.cacheService.set(rolesCacheKey, roles, this.rolesCacheTTL);
        lastErr = undefined;
        break;
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        this.logger.warn('Failed to load roles for JWT user', {
          authId: mapping.authId,
          attempt: attempt + 1,
          error: lastErr.message,
        });
      }
    }
    if (lastErr && roles.length === 0) {
      // Fallback: derive admin role from JWT accessType so transient DB/replica/cache-miss
      // (e.g. in-memory cache on another instance) does not strip admin access.
      if (accessType === AccessType.ADMIN) {
        roles = [UserRole.Administrator];
      }
    }
    return {
      userId: mapping.userId,
      authId: mapping.authId,
      accessType,
      metadata: mapping.acpId ? { acpId: mapping.acpId } : undefined,
      id: mapping.userId,
      roles,
    };
  }}