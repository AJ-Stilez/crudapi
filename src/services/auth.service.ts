import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from '../dtos/create-user.dto';
import { UpdateAuthDto } from '../dtos/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AuthUser } from '../entities/auth.entity';
import { HydratedDocument, Model, Types } from 'mongoose';
import bcrypt from 'node_modules/bcryptjs';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';
import { AccessType } from 'src/enums/access_type';
import { Logger } from 'nestjs-pino';
import { CacheService } from './cache/cache.services';
import { TOKEN_MAPPING_TTL_SECONDS } from 'src/constants/security.constant';
import { UserResponse } from 'src/types/auth.types';
import { AuthCacheService } from './cache/auth-cache.service';
import { isValidEmail } from 'src/utils/helper.utils';
import { normalizePhoneNumber } from 'src/utils/phone.utils';
import { v4 as uuidv4 } from 'uuid';
import {
  InvalidPhoneCharactersException,
  InvalidPhoneFormatException,
  PhoneTooLongException,
  PhoneTooShortException,
  UnsupportedCountryException,
} from 'src/exception/phone.exception';
import {
  Auth,
  AuthDocument,
  AuthSchemaClass,
} from 'src/schema/class/auth.schema.class';
import { CrudService } from './core/crud.service';
import { handleAndThrowError } from 'src/utils/error.utils';
import { TokenMappingService } from './cache/token-mapping.services';
import { access } from 'fs';
import { DeviceSession } from 'src/schema/class/device-session.schema.class';
import { DeviceSessionService } from './device-session.service';
import { verifyPassword } from 'src/utils/password.utils';
import * as argon from 'argon2';
import { createUserLoginAuditConfig } from 'src/utils/audit-config.utils';
import { trackProcess } from 'src/utils/audit-trails.utils';
import { AuditTrailService } from './audit-trail.service';
import { UserService } from './user.service';
import { RefreshTokenService } from './refresh-token.service';

function toUserResponse(user: unknown): UserResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any;
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    roles: u.roles,
    // assignedEstates: u.assignedEstates?.map((e: unknown) => String(e)),
  };
}

@Injectable()
export class AuthService extends CrudService<AuthDocument> {
  private readonly MAPPING_TTL = TOKEN_MAPPING_TTL_SECONDS; // 1 hour, slightly longer than token expiration
   private readonly AUTH_CACHE_PREFIX = 'auth:info:';
  /** Must match JwtStrategy session cache so GET /auth/authenticated finds the session immediately after login */
  private readonly JWT_SESSION_CACHE_PREFIX = 'jwt_session:';
  private readonly JWT_SESSION_CACHE_TTL = 300;
  /** Must match JwtStrategy roles cache so role updates take effect without waiting for TTL */
  private readonly JWT_ROLES_CACHE_PREFIX = 'jwt_roles:';
  constructor(
    @InjectModel('Auth') private readonly authModel: Model<AuthDocument>,
    private cacheService: CacheService,
    private refreshTokenService: RefreshTokenService,
    private userService: UserService,
    private jwtService: JwtService,
    private auditTrailService: AuditTrailService,
    private authCacheService: AuthCacheService,
    private readonly logger: Logger,
    private tokenMappingService: TokenMappingService,
    private deviceSessionService: DeviceSessionService,
  ) {
    super(authModel);
  }

  async createUser(createUser: CreateAuthDto) {
    try {
      const { password, username, email } = createUser;

      const checkEmail = await this.authModel.findOne({ email });

      if (checkEmail) throw new BadRequestException('Email already exists');

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new this.authModel({
        username,
        email,
        password: hashedPassword,
        roles: [AccessType.USER],
      });

      const savedUser = await user.save();
      const { password: _, ...safeUser } = savedUser.toObject();

      return safeUser;
    } catch (error) {
      return error;
    }
  }

  async authenticate(
    userType: AccessType,
    identifier: string,
    password: string,
    deviceInfo?: {
      deviceId?: string;
      userAgent: string;
      ipAddress: string;
      deviceName?: string;
      osVersion?: string;
      location?: { country?: string; city?: string; region?: string };
    },
  ): Promise<{
    user: UserResponse;
    accessToken: string | null;
    refreshToken?: string | null;
    deviceSession?: DeviceSession;
  }> {
    this.logger.log('Login attempt', {
      userType,
      identifier: identifier?.includes('@')
        ? identifier
        : `${identifier?.slice(0, 4)}***`,
      // hasAcpToken: !! ,
    });

    // Setup audit configuration
    const auditConfig = this.setupAuditConfig(identifier, userType, deviceInfo);

    return trackProcess(this.auditTrailService, auditConfig, async () => {
      try {
        const cached = await this.authCacheService.getUserData(identifier);
        // if (cached) {
          const key =
            userType === AccessType.SUPER_ADMIN
              ? 'userId'
              : isValidEmail(identifier)
                ? 'email'
                : 'phone';

          // Normalize phone number if needed
          let normalizedIdentifier = this.normalizeIdentifier(identifier, key);

          // Validate credentials and get auth record
          const authRecord = await this.validateAndGetAuthRecord(
            key,
            normalizedIdentifier,
            userType,
            password,
            identifier,
          );

          this.logger.log('Auth record validated', {
            userType,
            userId: authRecord.userId?.toString?.(),
            authId: authRecord._id?.toString?.(),
          });

          // Fetch user data (user, partner, guard, occupant, or admin)
          const userData = await this.fetchUserData(
            authRecord.userId,
            userType,
          );

          this.logger.log('User data loaded for login', {
            userType,
            userId: authRecord.userId?.toString?.(),
            hasUserData: !!userData,
          });

          // Generate tokens and device session
          const jti = uuidv4();
          const { accessToken, refreshToken, deviceSession } =
            await this.generateTokensAndSession(
              authRecord.userId,
              authRecord._id.toString(),
              userType, // Use actual user type (may be OCCUPANT)
              jti,
              // estateId,
              // accessControlPoint,
              deviceInfo,
              // isFirstTimeGuardLogin || isFirstTimeOccupantLogin, // Handle first-time occupant login
              // occupantData, // Pass occupant data for metadata
            );

          // Prepare result
          const result = {
            user: {
              ...toUserResponse(userData),
              // photoUrl:
              //   isGuard && typeof userData?.photoUrl === 'string'
              //     ? userData.photoUrl
              //     : undefined,
            },
            accessToken,
            // estateAccessToken,
            refreshToken: refreshToken || undefined, // Optional - only if deviceInfo provided
            // firstTimeVerificationToken,
            deviceSession: deviceSession || undefined,
          };

          this.logger.log('Login successful', {
            userType: userType,
            userId: authRecord.userId?.toString?.(),
            userEmail: result.user?.email ?? '(none)',
          });

          return result;
        // }
      } catch (error) {
        const errMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error('Login failed', {
          userType,
          identifier: identifier?.includes('@')
            ? identifier
            : `${identifier?.slice(0, 4)}***`,
          error: errMessage,
          isHttpException: error instanceof HttpException,
        });
        if (error instanceof HttpException) {
          throw error;
        }
        handleAndThrowError(
          error,
          this.logger,
          'Failed to authenticate user',
          undefined,
          undefined,
          `Failed to authenticate user; check credentials and try again; identifier: ${identifier}, userType: ${userType}`,
        );
      }
    });
  }

  /**
   * Generates access tokens, refresh token, and device session
   * Uses opaque identifiers in tokens to prevent exposing real IDs
   * Refresh token is optional - only generated if deviceInfo is provided
   */
  private async generateTokensAndSession(
    userId: string,
    authId: string,
    userType: AccessType,
    jti: string,
    // estateId: string | null,
    // accessControlPoint: AccessControlPoint | null,
    deviceInfo?: {
      deviceId?: string;
      userAgent: string;
      ipAddress: string;
      deviceName?: string;
      osVersion?: string;
      location?: { country?: string; city?: string; region?: string };
    },
    // isFirstTimeGuardLogin = false,
    // occupantData?: { occupantId: string; estateId: string } | null,
  ): Promise<{
    accessToken: string | null;
    // estateAccessToken: string | null;
    refreshToken: string | null;
    deviceSession: DeviceSession | null;
  }> {
    let accessToken: string | null = null;
    let deviceSession: DeviceSession | null = null;

    // For first-time guard/occupant login, don't generate access token until verification is complete
    // if (!isFirstTimeGuardLogin) {
    accessToken = await this.generateAccessToken(
      {
        userId,
        authId,
        jti,
        // Store ACP ID in metadata for easy access control point lookup
        // metadata: accessControlPoint
        //   ? { acpId: accessControlPoint.id }
        //   : undefined,
      },
      userType,
    );

      // Always create a device session when issuing an access token so JWT validation can find it.
      // Use provided deviceInfo or minimal defaults so session exists for all user types (including admin).
      const sessionDeviceInfo = deviceInfo ?? {
        userAgent: 'unknown',
        ipAddress: 'unknown',
      };
      deviceSession = await this.deviceSessionService.createDeviceSession(
        userId,
        sessionDeviceInfo,
        jti,
      );
      // Warn session cache so the very next request (e.g. GET /auth/authenticated) finds the
      // session without hitting the DB — avoids replica lag or in-memory/DB timing issues.
      await this.cacheService.set(
        `${this.JWT_SESSION_CACHE_PREFIX}${jti}`,
        { isValid: true, jti },
        this.JWT_SESSION_CACHE_TTL,
      );
      this.logger.debug('Device session created for access token', {
        jti,
        userId,
        userType,
        sessionId: deviceSession?.id,
      });

    // Generate estate access token for estate users, regular users, and occupants
    // let estateAccessToken: string | null = null;
    // if (
    //   (userType === AccessType.ESTATE ||
    //     userType === AccessType.USER ||
    //     userType === AccessType.OCCUPANT) &&
    //   estateId
    // ) {
    //   // Build metadata based on user type
    //   const metadata: Record<string, unknown> = { estateId };
    //   if (userType === AccessType.OCCUPANT && occupantData) {
    //     metadata.isOccupant = true;
    //     metadata.occupantId = occupantData.occupantId;
    //   }

    //   estateAccessToken = await this.generateAccessToken(
    //     {
    //       userId,
    //       authId,
    //       jti,
    //       metadata,
    //     },
    //     userType === AccessType.OCCUPANT
    //       ? AccessType.OCCUPANT
    //       : AccessType.ESTATE,
    //   );
    // }

    // Generate refresh token (optional - only if device info is provided)
    // Don't generate for first-time guard/occupant login
    let refreshToken: string | null = null;
    // if (deviceInfo && !isFirstTimeGuardLogin) {
    if (deviceInfo) {
      refreshToken = await this.refreshTokenService.createRefreshToken(
        userId,
        authId,
        {
          deviceId: deviceInfo.deviceId,
          userAgent: deviceInfo.userAgent,
          ipAddress: deviceInfo.ipAddress,
        },
      );
        }
  
    return {
      accessToken,
      // estateAccessToken,
      refreshToken,
      deviceSession,
    };
  }

  private async fetchUserData(userId: string, userType: AccessType) {
    let userData;
    userData = await this.userService.getUserInfo(userId);
    if (!userData) {
      this.logger.warn('User data not found after auth validation', {
        userType,
        userId,
        message:
          userType === AccessType.ADMIN
            ? 'Admin record missing (check Admin collection and seed)'
            : userType === AccessType.GUARD
              ? 'Guard record missing'
              : 'User/Partner record missing',
      });
      return handleAndThrowError(
        new HttpException('User data not found', HttpStatus.NOT_FOUND),
        this.logger,
        'User data not found',
      );
    }

    // Convert to plain object if needed (for lean compatibility)
    return userData.toObject ? userData.toObject() : userData;
  }

  /**
   * Creates a device session for a newly created user so the returned access token
   * passes JWT strategy validation (session check by jti).
   * @param userId - The new user's ID
   * @param jti - The JTI used in the access token
   * @param deviceInfo - Minimal device info (userAgent, ipAddress) from the request
   * @publicApi
   */
  async createDeviceSessionForNewUser(
    userId: string,
    jti: string,
    deviceInfo: { userAgent: string; ipAddress: string },
  ): Promise<DeviceSession> {
    return this.deviceSessionService.createDeviceSession(
      userId,
      {
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
      },
      jti,
    );
  }

  
  /**
   * Refreshes access token using refresh token
   * @param encryptedRefreshToken - Encrypted refresh token from header (with prefix/suffix)
   * @param deviceInfo - Device information for security checks
   * @returns User ID, auth ID, and new refresh token (rotated, encrypted)
   * @publicApi
   */
  async refreshAccessToken(
    encryptedRefreshToken: string,
    deviceInfo?: {
      deviceId?: string;
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<{
    userId: string;
    authId: string;
    newRefreshToken: string;
  }> {
    return this.refreshTokenService.refreshAccessToken(
      encryptedRefreshToken,
      deviceInfo,
    );
  }


  /**
   * Sets up audit configuration for authentication
   */
  private setupAuditConfig(
    identifier: string,
    userType: AccessType,
    deviceInfo?: {
      deviceId?: string;
      userAgent: string;
      ipAddress: string;
      deviceName?: string;
      osVersion?: string;
      location?: { country?: string; city?: string; region?: string };
    },
  ) {
    const auditConfig = createUserLoginAuditConfig(undefined, {
      userType,
      identifier: identifier.includes('@') ? identifier : '***',
      hasDeviceInfo: !!deviceInfo,
    });

    auditConfig.userIdExtractor = (result: {
      user?: { id?: string | number };
    }) => {
      if (result?.user?.id) {
        return typeof result.user.id === 'string'
          ? result.user.id
          : String(result.user.id);
      }
      return undefined;
    };

    return auditConfig;
  }

  /**
   * Normalizes identifier (phone number) for authentication
   */
  private normalizeIdentifier(identifier: string, key: string): string {
    if (key !== 'phone') {
      return identifier;
    }

    try {
      return normalizePhoneNumber(identifier);
    } catch (error) {
      // Handle specific phone exceptions
      if (
        error instanceof InvalidPhoneFormatException ||
        error instanceof UnsupportedCountryException ||
        error instanceof PhoneTooShortException ||
        error instanceof PhoneTooLongException ||
        error instanceof InvalidPhoneCharactersException
      ) {
        this.logger.warn(
          `Phone validation failed during authentication: ${identifier}, error: ${error.message}`,
          {
            phone: identifier,
            errorCode: error.code,
            suggestion: error.suggestion,
          },
        );
      } else {
        this.logger.warn(
          `Failed to normalize phone number during authentication: ${identifier}, error: ${error.message}`,
        );
      }
      // Keep original identifier if normalization fails
      return identifier;
    }
  }

  async setImmediate(): Promise<String> {
    console.log('Trying to set immediate');
    setImmediate(() => console.log('Set Immediate'));
    console.log('I returned before the set immediate response');
    const response = 'Return response';
    return response;
  }

  async authenticateUser(
    identifier: string,
    password: string,
    userType: AccessType,
  ) {
    try {
      const key = isValidEmail(identifier) ? 'email' : 'phone';
      const value = identifier;
      console.log('Key:', key, identifier);
      const user = await this.validateAndGetAuthRecord(
        key,
        identifier,
        userType,
        password,
        identifier,
      );

      if (!user) {
        this.logger.error(
          `[Auth Service] User with ${isValidEmail(identifier) ? 'email' : 'phone number'} ${identifier} not found`,
        );
        throw new BadRequestException('User not found');
      }

      // const { password: hashedPassword } = user;

      // console.log('hasher:', hashedPassword);

      // const isValid = await verifyPassword(hashedPassword, password);
      // // const isValid = await argon.verify(password, hashedPassword);
      // console.log('IsValid:', isValid);

      // if (!isValid) throw new BadRequestException('Invalid Credentials');

      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
      };

      // remove password before returning
      //    return {
      //   access_token: this.jwtService.sign(payload),
      //   user: { email: user.email, username: user.username },
      // };
      const accessToken = await this.generateAccessToken(
        payload,
        userType,
        this.MAPPING_TTL,
      );

      const { password: _, __v: _v, ...safeUser } = user;
      return {
        ...safeUser,
        accessToken,
      };
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Login failed', {
        //   userType,
        //   identifier: identifier?.includes('@')
        //     ? identifier
        //     : `${identifier?.slice(0, 4)}***`,
        error: errMessage,
        isHttpException: error instanceof HttpException,
      });
      if (error instanceof HttpException) {
        throw error;
      }
      handleAndThrowError(
        error,
        this.logger,
        'Failed to authenticate user',
        undefined,
        undefined,
        'Falied to authenticate user check credentials and try again',
        // `Failed to authenticate user; check credentials and try again; identifier:  ${identifier}, userType: ${userType}`,
      );
    }
  }

  /**
   * Validates credentials and retrieves auth record
   */
  private async validateAndGetAuthRecord(
    key: string,
    normalizedIdentifier: string,
    userType: AccessType,
    password: string,
    identifier: string,
  ) {
    // Debug: Check if user exists before throwing exception
    const existingAuth = await this.findOne(
      { [key]: normalizedIdentifier, userType },
      { select: 'id userId phone email userType' },
    );

    if (!existingAuth) {
      this.logger.warn(
        `Authentication failed: No auth record found for ${key}=${normalizedIdentifier}, userType=${userType}`,
      );

      // Check if user exists with different phone formats
      if (key === 'phone') {
        const alternativeFormats = [
          identifier, // Original format
          identifier.startsWith('+')
            ? identifier.substring(1)
            : `+${identifier}`, // Opposite format
        ];

        for (const format of alternativeFormats) {
          const altAuth = await this.findOne(
            { phone: format, userType },
            { select: 'id userId phone email userType' },
          );
          if (altAuth) {
            this.logger.warn(
              `Found user with alternative phone format: ${format} (original: ${identifier}, normalized: ${normalizedIdentifier})`,
            );
            break;
          }
        }
      }
    }
    console.log('Hey', key, normalizedIdentifier);
    const authRecord = await this.findOneOrThrowException(
      { [key]: normalizedIdentifier, userType },
      HttpStatus.UNAUTHORIZED,
      'Invalid credentials',
      {
        select:
          'id userId password userType assignedEstates lastSignedInEstate',
        lean: true,
      },
    );

    console.log('AuthRecord:', authRecord);

    // Verify password
    const valid = await verifyPassword(authRecord.password, password);
    console.log('IsValllllid:', valid);
    if (!valid) {
      return handleAndThrowError(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
        this.logger,
        'Invalid credentials',
      );
    }

    return authRecord;
  }

  async generateAccessToken(
    payload: Record<string, any>,
    accessType: AccessType,
    expires?: string | number,
  ): Promise<string> {
    const userId = payload.userId;
    const authId = payload.authId || payload.userId;
    const jti = payload.jti || uuidv4();

    // create opaque token mapping in cache
    const mappings = await this.tokenMappingService.createMappings({
      userId,
      authId,
      accessType,
      jti,
    });
    const tokenPayload = {
      ...payload,
      userId: mappings.opaqueUserId,
      authId: mappings.opaqueAuthId,
      jti,
      metadata: accessType,
    };

    const expiresInSeconds =
      typeof expires === 'string' ? parseInt(expires, 10) : (expires ?? 3600);

    const options: JwtSignOptions = {
      algorithm: 'HS256' as Algorithm,
      expiresIn: expiresInSeconds,
    };
    const token = this.jwtService.sign(tokenPayload, options);
    return token;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // async update(id: string, updateAuthDto: UpdateAuthDto) {
  //   try {
  //     const isValid = Types.ObjectId.isValid(id);
  //     if (!isValid) throw new BadRequestException('Invalid user ID');

  //     const user = await this.authUserModel.findById(id);

  //     if (!user) throw new BadRequestException('User not found');
  //     const updatedUser = await this.authModel
  //       .findByIdAndUpdate(
  //         id,
  //         { $set: updateAuthDto },
  //         { new: true, runValidators: true },
  //       )
  //       .select('-password');

  //     if (!updatedUser) {
  //       throw new NotFoundException('User not found');
  //     }

  //     return updatedUser;
  //   } catch (error) {
  //     return error;
  //   }
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
