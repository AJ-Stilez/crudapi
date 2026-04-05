import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateUserAttributes,
  User,
  UserDocument,
} from 'src/schema/class/user.schema.class';
import { CrudService } from './core/crud.service';
import { AuthService } from './auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessType } from 'src/enums/access_type';
import { RecordId } from 'src/types/types';
import { createUserCreationAuditConfig } from 'src/utils/audit-config.utils';
import { trackProcess } from 'src/utils/audit-trails.utils';
import { AuditTrailService } from './audit-trail.service';
import { handleAndThrowError } from 'src/utils/error.utils';
import { Logger } from 'nestjs-pino';
import { hashPassword } from 'src/utils/password.utils';
import {
  extractCountryCode,
  validateLocalPhoneNumber,
  validatePhoneNumber,
} from 'src/utils/phone.utils';
import dayjs from 'dayjs';
import { AppToken } from 'src/schema/class/app-token.schema.class';
import * as argon from 'argon2';
import { CacheService } from './cache/cache.services';
import crypto from 'crypto';
import { getSecurityConfig } from 'src/config/security.config';

@Injectable()
export class UserService extends CrudService<UserDocument> {
  private readonly USER_CACHE_PREFIX = 'user:info:';

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly cacheService: CacheService,
    private readonly auditTrailService: AuditTrailService,
    private readonly logger: Logger,
  ) {
    super(userModel);
  }

  /**
   * Gets the cache TTL from environment variable or defaults to 300 seconds (5 minutes)
   */
  private getUserCacheTtl(): number {
    return parseInt(process.env.USER_CACHE_TTL || '300', 10) || 300;
  }

  async createUser(
    userData: CreateUserAttributes,
    userType: AccessType = AccessType.USER,
    tokenId?: RecordId,
    otpCode?: string,
    selfie: Array<Express.Multer.File> = [],
  ): Promise<{ user: User; token?: AppToken | null }> {
    // Implement the logic to create a user, handle the selfie upload, and log device info
    const auditConfig = createUserCreationAuditConfig(undefined, {
      userType,
      hasToken: !!tokenId,
      hasSelfie: selfie.length > 0,
    });

    // Override userIdExtractor to get userId from creation result
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
    return trackProcess(
      this.auditTrailService,
      auditConfig,
      async (userDataArg: CreateUserAttributes) => {
        try {
          // let token: AppToken | null = null;
          // if (tokenId) {
          //   token = await this.appTokenService.validateAppToken(
          //     tokenId,
          //     otpCode,
          //     null,
          //     {
          //       tokenNotFoundErrorMessage:
          //         'Your code has expired or is invalid',
          //       codeDoesNotMatchErrorMessage:
          //         'Your code is expired or is invalid',
          //     },
          //   );
          // }

          const key = userData.email ? 'email' : 'phone';
          const value = userData.email ? userData.email : userData.phone;

          const account = await this.findOne(
            { [key]: value, userType: userType },
            { select: 'id' },
          );

          if (account) {
            return handleAndThrowError(
              new HttpException(
                'Account already exists',
                HttpStatus.BAD_REQUEST,
              ),
              this.logger,
              'Account already exists',
            );
          }

          const password = await hashPassword(userData.password);
          // const password = await argon.hash(userData.password);

          // Enhanced phone number validation and country code extraction
          let countryCode = userData.countryCode;
          let normalizedPhone = userData.phone;

          if (userData.phone) {
            // Validate phone number first
            let validation;
            if (countryCode) {
              // If country code is provided, validate as local number
              validation = validateLocalPhoneNumber(
                userData.phone,
                countryCode,
              );
            } else {
              // Otherwise, try to extract country code from the number
              validation = validatePhoneNumber(userData.phone);
            }

            if (!validation.isValid) {
              const errorMessage =
                validation.error || 'Invalid phone number format';
              return handleAndThrowError(
                new HttpException(
                  `Invalid phone number: ${errorMessage}`,
                  HttpStatus.BAD_REQUEST,
                ),
                this.logger,
                `Phone validation failed: ${errorMessage}`,
              );
            }

            // Extract country code if not provided
            if (!countryCode) {
              const { countryCode: extractedCode } = extractCountryCode(
                userData.phone,
              );
              countryCode = extractedCode;
            }

            // Normalize phone number to international format
            const startTime = dayjs().valueOf();
            //   try {
            //     normalizedPhone = normalizePhoneNumber(userData.phone);
            //     const duration = dayjs().valueOf() - startTime;
            //     await this.phoneMonitor.trackNormalization(
            //       userData.phone,
            //       {
            //         success: true,
            //         originalPhone: userData.phone,
            //         normalizedPhone: normalizedPhone,
            //         metadata: {
            //           normalizationStrategy: 'standard',
            //           duration,
            //           attempts: 1,
            //         },
            //       },
            //       duration,
            //     );
            //   } catch (error) {
            //     const duration = dayjs().valueOf() - startTime;
            //     await this.phoneMonitor.trackNormalization(
            //       userData.phone,
            //       {
            //         success: false,
            //         originalPhone: userData.phone,
            //         error:
            //           error instanceof Error
            //             ? {
            //                 code: PhoneErrorCode.NORMALIZATION_FAILED,
            //                 message: error.message,
            //                 suggestion: 'Please check the phone number format',
            //               }
            //             : {
            //                 code: PhoneErrorCode.CONFIGURATION_ERROR,
            //                 message: 'Unknown error during normalization',
            //                 suggestion: 'Please try again',
            //               },
            //         metadata: {
            //           normalizationStrategy: 'standard',
            //           duration,
            //           attempts: 1,
            //         },
            //       },
            //       duration,
            //     );

            //     this.logger.warn(
            //       `Failed to normalize phone number: ${error.message}`,
            //     );
            //     normalizedPhone = userData.phone; // Use original if normalization fails
            //   }
            // }
          }
          let selfiePhotoId: string | null = null;
          let selfiePhotoUrl: string | null = null;

          // if (selfie.length > 0) {
          //   const uploadResponse = await this.uploadService.processFileUpload(
          //     selfie,
          //     null,
          //   );
          //   selfiePhotoId = uploadResponse[0].uploadId;
          //   selfiePhotoUrl = uploadResponse[0].externalPath;
          // }

          const user = await this.create({
            ...userData,
            phone: normalizedPhone,
            countryCode,
            // email:
            //   userData.email ||
            // `${normalizedPhone}${RESIDENTIAL_APP_EMAIL_DOMAIN}`,
            password,
            // testUser,
            // phoneConfirmedAt:
            //   token &&
            //   token?.identifierType == 'phone' &&
            //   token?.purpose === AppTokenPurpose.INITIATE_NEW_ACCOUNT
            //     ? dayjs().format('YYYY-MM-DD HH:mm:ss')
            //     : null,
            // emailConfirmedAt:
            //   token &&
            //   token?.identifierType == 'email' &&
            //   token?.purpose === AppTokenPurpose.INITIATE_NEW_ACCOUNT
            //     ? dayjs().format('YYYY-MM-DD HH:mm:ss')
            //     : null,
            selfiePhotoId,
            selfiePhotoUrl,
          });

          // if (token) {
          //   await this.appTokenService.validateUserRelated(token);
          // }

          // if (selfie.length > 0 && selfiePhotoId && selfiePhotoUrl) {
          //   await this.uploadService.finalizeUpload(selfiePhotoId, user.id);
          // }

          return { user, token: null };
        } catch (error) {
          handleAndThrowError(error, this.logger, 'Error Creating User');
        }
      },
      userData,
    );

    // This is a placeholder for the actual implementation
  }

  /**
   * Gets user info with caching
   * This method provides a cached way to fetch user information,
   * reducing database load for frequently accessed user data.
   *
   * @param userId - The user ID to fetch details for
   * @returns The user document
   */
  async getUserInfo(userId: RecordId): Promise<User> {
    const cacheKey = `${this.USER_CACHE_PREFIX}${userId}`;

    return await this.cacheService.getOrSet<User>(
      cacheKey,
      async () => {
        return await this.findOneOrThrowException(
          {
            _id: userId,
          },
          HttpStatus.EXPECTATION_FAILED,
          'Unable find user',
          {
            select:
              'id firstName lastName email phone countryCode selfiePhotoUrl emailConfirmedAt phoneConfirmedAt userType',
          },
        );
      },
      this.getUserCacheTtl(),
    );
  }
}
