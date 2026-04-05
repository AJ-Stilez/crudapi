// import {
//   BadRequestException,
//   forwardRef,
//   HttpException,
//   HttpStatus,
//   Inject,
//   Injectable,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Logger } from 'nestjs-pino';
// import {
//   AppToken,
//   AppTokenDocument,
//   AppTokenSchemaClass,
//   CreateAppTokenAttributes,
// } from 'src/schema/class/app-token.schema.class';

// import { RecordId } from 'src/types/types';


// import dayjs from 'dayjs';

// import {
//   normalizePhoneNumber,
//   validatePhoneNumber,
// } from 'src/utils/phone.utils';
// import { handleAndThrowError } from 'src/utils/error.utils';
// import { CrudService } from './core/crud.service';
// import { UserService } from './user.service';
// import { AppTokenPurpose, AppTokenPurpose } from 'src/utils/app-token.utils';
// ';

// @Injectable()
// export class AppTokenService extends CrudService<
//   AppToken & AppTokenSchemaClass,
//   AppToken
// > {
//   constructor(
//     @InjectModel('AppToken')
//     appTokenModel: Model<AppTokenDocument>,
//     protected readonly logger: Logger,
//     private readonly messagingService: MessagingService,
//     private readonly authenticationNotificationService: AuthenticationNotificationService,
//     @Inject(forwardRef(() => UserService))
//     private readonly userService: UserService,
//   ) {
//     super(appTokenModel);
//   }

//   /**
//    * Determines if a message should be sent based on the token purpose.
//    *
//    * @param purpose - The purpose of the app token
//    * @returns boolean indicating if a message should be sent
//    */
//   private shouldSendMessage(purpose: AppTokenPurpose): boolean {
//     return (
//       purpose === AppTokenPurpose.INITIATE_NEW_ACCOUNT ||
//       purpose === AppTokenPurpose.RESET_ACCOUNT_REQUEST ||
//       purpose === AppTokenPurpose.ACP_OTP_REQUEST ||
//       purpose === AppTokenPurpose.UPDATE_USER_IDENTIFIER
//     );
//   }

//   /**
//    * Gets the messaging configuration for a given token purpose.
//    *
//    * @param purpose - The purpose of the app token
//    * @returns Messaging configuration object
//    */
//   private getMessagingConfig(purpose: AppTokenPurpose): MessagingConfig {
//     const configs: Record<AppTokenPurpose, MessagingConfig> = {
//       [AppTokenPurpose.INITIATE_NEW_ACCOUNT]: {
//         shouldSendImmediately: true,
//         messagingMethod: 'sendInitiateAccount',
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.RESET_ACCOUNT_REQUEST]: {
//         shouldSendImmediately: false,
//         messagingMethod: 'sendRequestResetMessage',
//         requiresFullName: true,
//       },
//       [AppTokenPurpose.NEW_ACCOUNT_CREATED]: {
//         shouldSendImmediately: false,
//         messagingMethod: 'sendNewUserMessage',
//         requiresFullName: true,
//       },
//       [AppTokenPurpose.REQUEST_PHONE_VALIDATION]: {
//         shouldSendImmediately: false,
//         messagingMethod: null,
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.RESET_ACCOUNT_PIN]: {
//         shouldSendImmediately: false,
//         messagingMethod: null,
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.ESTATE_ACCESS_CODE]: {
//         shouldSendImmediately: false,
//         messagingMethod: null,
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.GUARD_REGISTRATION]: {
//         shouldSendImmediately: false,
//         messagingMethod: null,
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.GUARD_FIRST_TIME_VERIFICATION]: {
//         shouldSendImmediately: false,
//         messagingMethod: null,
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.ACP_OTP_REQUEST]: {
//         shouldSendImmediately: true,
//         messagingMethod: 'sendVerificationCode',
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.ACP_AUTH]: {
//         shouldSendImmediately: false,
//         messagingMethod: null,
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.UPDATE_USER_IDENTIFIER]: {
//         shouldSendImmediately: true,
//         messagingMethod: 'sendVerificationCode',
//         requiresFullName: false,
//       },
//       [AppTokenPurpose.CHANGE_ACCOUNT_PASSWORD]: {
//         shouldSendImmediately: false,
//         messagingMethod: null,
//         requiresFullName: false,
//       },
//     };

//     return (
//       configs[purpose] || {
//         shouldSendImmediately: false,
//         messagingMethod: null,
//         requiresFullName: false,
//       }
//     );
//   }

//   /**
//    * Async method that actually sends the message.
//    * This is called in a fire-and-forget manner from sendMessage.
//    */
//   private async sendMessageAsync(
//     messagingMethod: string | null,
//     messagingPayload: Partial<InitiateAccountMessagingType>,
//     fullName?: string,
//     code?: string,
//     identifierType?: string,
//     identifierId?: RecordId,
//   ) {
//     if (!messagingMethod) {
//       return;
//     }

//     switch (messagingMethod) {
//       case 'sendInitiateAccount':
//         await this.authenticationNotificationService.sendInitiateAccount(
//           messagingPayload as InitiateAccountMessagingType,
//         );
//         break;

//       case 'sendRequestResetMessage':
//         await this.authenticationNotificationService.sendRequestResetMessage(
//           fullName,
//           code,
//           identifierType === 'email' ? identifierId?.toString() : undefined,
//           identifierType === 'phone' ? identifierId?.toString() : undefined,
//         );
//         break;

//       case 'sendNewUserMessage':
//         await this.authenticationNotificationService.sendNewUserMessage(
//           fullName,
//           identifierType === 'email' ? identifierId?.toString() : undefined,
//           identifierType === 'phone' ? identifierId?.toString() : undefined,
//         );
//         break;

//       case 'sendVerificationCode':
//         // Use email/phone from identifierId if identifierType matches, otherwise use messagingPayload
//         const emailForVerification =
//           identifierType === 'email'
//             ? identifierId?.toString()
//             : messagingPayload.email?.toString();
//         const phoneForVerification =
//           identifierType === 'phone'
//             ? identifierId?.toString()
//             : messagingPayload.phone?.toString();
//         await this.authenticationNotificationService.sendVerificationCode(
//           code,
//           emailForVerification,
//           phoneForVerification,
//         );
//         break;

//       default:
//         this.logger.warn(`Unknown messaging method: ${messagingMethod}`);
//     }
//   }

//   /**
//    * Sends a message based on the token purpose and configuration.
//    * Uses fire-and-forget pattern to avoid blocking the response.
//    *
//    * @param purpose - The purpose of the app token
//    * @param messagingPayload - The messaging payload
//    * @param fullName - User's full name (if required)
//    * @param code - The generated code
//    * @param identifierType - Type of identifier
//    * @param identifierId - The identifier value
//    */
//   private sendMessage(
//     purpose: AppTokenPurpose,
//     messagingPayload: Partial<InitiateAccountMessagingType>,
//     fullName?: string,
//     code?: string,
//     identifierType?: string,
//     identifierId?: RecordId,
//   ) {
//     const config = this.getMessagingConfig(purpose);

//     if (!config.messagingMethod) {
//       return; // No messaging required for this purpose
//     }

//     if (config.requiresFullName && !fullName) {
//       this.logger.warn(`Full name required for ${purpose} but not provided`);
//       return;
//     }

//     // Fire-and-forget: Don't await to avoid blocking the response
//     // Errors are caught and logged but don't affect token creation
//     this.sendMessageAsync(
//       config.messagingMethod,
//       messagingPayload,
//       fullName,
//       code,
//       identifierType,
//       identifierId,
//     ).catch((error) => {
//       this.logger.error(
//         {
//           purpose,
//           error: error instanceof Error ? error.message : JSON.stringify(error),
//           identifierType,
//           identifierId,
//         },
//         `Failed to send message for ${purpose}`,
//       );
//     });
//   }

//   async createAppToken(
//     data: CreateAppTokenAttributes & { email?: string; fullName?: string },
//     codeGenLength = 6,
//   ) {
//     const {
//       identifierType,
//       identifierId,
//       purpose,
//       email,
//       fullName,
//       ...tokenData
//     } = data;

//     // Generate code (for OTP) only if codeGenLength > 0
//     // For long-lived tokens, codeGenLength should be 0 to skip code generation
//     const code =
//       codeGenLength > 0 ? randomNumbersByLength(codeGenLength) : undefined;
//     const token = this.generateUniqueToken();

//     // Hash the code before storing (if code exists)
//     const hashedCode = code ? await hashAccessCode(code.toString()) : undefined;

//     // Create the app token with hashed code and token
//     const appToken = await this.create({
//       ...tokenData,
//       identifierType,
//       identifierId,
//       purpose,
//       code: hashedCode, // Store hashed code
//       token,
//     });

//     this.logger.log({
//       code,
//       token,
//       identifierId,
//       tokenId: appToken.id,
//     });

//     const shouldSendMessage =
//       codeGenLength > 0 && this.shouldSendMessage(purpose as AppTokenPurpose);

//     if (shouldSendMessage) {
//       const messagingPayload: Partial<InitiateAccountMessagingType> = {
//         code: `${code}`,
//       };

//       // Build messaging payload based on identifier type
//       if (identifierType === 'email') {
//         messagingPayload.email = identifierId;
//       } else if (identifierType === 'phone') {
//         messagingPayload.phone = identifierId;
//       } else if (identifierType === 'userId' && email) {
//         messagingPayload.email = email;
//       } else if (email) {
//         // For other identifier types (e.g., estateGateId), use provided email
//         // This is used for ACP authentication where gateId is identifier but email is needed for OTP
//         messagingPayload.email = email;
//       }

//       // Send message if we have valid contact information
//       if (messagingPayload.email || messagingPayload.phone) {
//         await this.sendMessage(
//           purpose as AppTokenPurpose,
//           messagingPayload,
//           fullName,
//           code.toString(),
//           identifierType,
//           identifierId,
//         );
//       }
//     }

//     return {
//       tokenId: appToken.id,
//       code,
//       token: appToken.token,
//     };
//   }

//   private generateUniqueToken(): string {
//     const timestamp = dayjs().valueOf().toString(36);
//     const random = Math.random().toString(36).substring(2, 15);
//     return `token_${timestamp}_${random}`.toUpperCase();
//   }

//   async validateAppToken(
//     tokenId: RecordId,
//     code: string,
//     purpose?: AppTokenPurpose,
//     errorGen?: AppTokenErrorGen,
//   ) {
//     const criteria: { _id: RecordId; purpose?: AppTokenPurpose } = {
//       _id: tokenId,
//     };
//     if (purpose) {
//       criteria.purpose = purpose;
//     }
//     const token = await this.findOneOrThrowException(
//       criteria,
//       HttpStatus.NOT_FOUND,
//       errorGen?.codeDoesNotMatchErrorMessage ??
//         `Unable to validate token | token not found`,
//       { select: 'id code token identifierId purpose' },
//     );
//     this.logger.log({ message: 'Validating token', token, criteria });

//     // Verify code using hash comparison (codes are now hashed in DB)
//     if (token.code) {
//       const isValid = await verifyAccessCode(token.code, code);
//       if (!isValid) {
//         const errorMessage =
//           errorGen?.codeDoesNotMatchErrorMessage ??
//           'Unable to validate token | invalid code provided';
//         this.logger.error(errorMessage, { tokenId, providedCode: code });
//         throw new BadRequestException(errorMessage);
//       }
//     } else if (code) {
//       // Token has no code but code was provided
//       const errorMessage =
//         errorGen?.codeDoesNotMatchErrorMessage ??
//         'Unable to validate token | invalid code provided';
//       this.logger.error(errorMessage, { tokenId, providedCode: code });
//       throw new BadRequestException(errorMessage);
//     }

//     // await this.validateUserRelated(token);
//     return token;
//   }

//   async validateUserRelated(token: AppToken) {
//     if (
//       token.purpose === AppTokenPurpose.INITIATE_NEW_ACCOUNT &&
//       (token.identifierType == 'email' || isValidEmail(token.identifierId))
//     ) {
//       // Validation for email-based initiation
//       const user = await this.userService.findOneOrThrowException({
//         email: token.identifierId,
//       });

//       // Mark email as confirmed if not already confirmed
//       if (!user.emailConfirmedAt) {
//         await this.userService.findByIdAndUpdate(user.id, {
//           emailConfirmedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
//         });
//       }
//     }

//     if (
//       token.purpose === AppTokenPurpose.INITIATE_NEW_ACCOUNT &&
//       token.identifierType == 'phone'
//     ) {
//       try {
//         const phoneValidation = validatePhoneNumber(token.identifierId);

//         if (!phoneValidation.isValid) {
//           const errorMessage =
//             phoneValidation.error || 'Invalid phone number format';
//           return handleAndThrowError(
//             new HttpException(
//               `Invalid phone number: ${errorMessage}`,
//               HttpStatus.BAD_REQUEST,
//             ),
//             this.logger,
//             `Phone validation failed: ${errorMessage}`,
//           );
//         }

//         const normalizedPhone = normalizePhoneNumber(token.identifierId);
//         // Validation for phone-based initiation
//         const user = await this.userService.findOneOrThrowException({
//           phone: normalizedPhone,
//         });

//         // Mark phone as confirmed if not already confirmed
//         if (!user.phoneConfirmedAt) {
//           await this.userService.findByIdAndUpdate(user.id, {
//             phoneConfirmedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
//           });
//         }
//       } catch (error) {
//         const errorMessage =
//           error instanceof Error
//             ? error.message
//             : 'Unknown error during phone validation';
//         return handleAndThrowError(
//           new HttpException(
//             `Phone validation error: ${errorMessage}`,
//             HttpStatus.BAD_REQUEST,
//           ),
//           this.logger,
//           `Phone validation exception: ${errorMessage}`,
//         );
//       }
//     }
//   }

//   async validateAppTokenByToken(token: string, errorGen?: AppTokenErrorGen) {
//     const appToken = await this.findOneOrThrowException(
//       { token },
//       HttpStatus.NOT_FOUND,
//       errorGen?.tokenNotFoundErrorMessage ??
//         `Unable to validate token | token not found`,
//       {
//         select:
//           'id token name permissions purpose isActive identifierId expiresBy expiresAt',
//       },
//     );

//     this.logger.log({
//       message: 'Validating token by token',
//       tokenId: appToken.id,
//     });

//     if (!appToken.isActive) {
//       const errorMessage = 'Token is inactive';
//       this.logger.error(errorMessage, { token });
//       throw new BadRequestException(errorMessage);
//     }

//     if (appToken.expiresAt && dayjs().isAfter(dayjs(appToken.expiresAt))) {
//       const errorMessage = 'Token has expired';
//       this.logger.error(errorMessage, { token });
//       throw new BadRequestException(errorMessage);
//     }

//     return appToken;
//   }
// }
