/**
 * Reusable Audit Trail Configurations
 *
 * Pre-configured options for common audit trail patterns.
 * Reduces boilerplate by providing reusable configurations.
 *
 * @module AuditConfigs
 */

import { AuditAction } from 'src/enums/audit-actions.enums';
import { TrackProcessOptions } from './audit-trails.utils';
import {
  PaymentCategory,
  PaymentProvider,
  PaymentType,
} from 'src/schema/class/payment.schema.class';
import { PaymentResponse } from 'src/utils/payment.utils';

/**
 * Creates audit config for payment operations
 * Extracts common payment fields and transforms response data
 */
export function createPaymentAuditConfig(
  userId: string,
  action: AuditAction,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  return {
    userId,
    action,
    resource: 'Payment',
    resourceIdExtractor: (result: PaymentResponse) => result?.id,
    requestDataTransformer: (data?: {
      amount?: number;
      currency?: string;
      description?: string;
      provider?: PaymentProvider;
      type?: PaymentType;
      category?: PaymentCategory;
      estateId?: string;
      [key: string]: unknown;
    }) => ({
      amount: data?.amount,
      currency: data?.currency,
      description: data?.description,
      provider: data?.provider || PaymentProvider.MONNIFY,
      type: data?.type,
      category: data?.category,
      estateId: data?.estateId,
    }),
    responseDataTransformer: (result: PaymentResponse) => ({
      id: result?.id,
      paymentReference: result?.paymentReference,
      status: result?.status,
      checkoutUrl: result?.checkoutUrl,
    }),
    metadata: {
      ...metadata,
    },
  };
}

/**
 * Creates audit config for payment verification
 * Handles cases where userId needs to be extracted from payment
 */
export function createPaymentVerificationAuditConfig(
  userId?: string,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  return {
    userId,
    action: AuditAction.VERIFY_PAYMENT,
    resource: 'Payment',
    resourceIdExtractor: (result: PaymentResponse) => result?.id,
    requestDataTransformer: (paymentReference?: string, meta?: unknown) => ({
      paymentReference: paymentReference || 'unknown',
      metadata: meta ? { hasMetadata: true } : undefined,
    }),
    responseDataTransformer: (result: PaymentResponse) => ({
      id: result?.id,
      paymentReference: result?.paymentReference,
      status: result?.status,
    }),
    metadata: {
      ...metadata,
    },
  };
}

/**
 * Creates audit config for penalty payment operations
 */
export function createPenaltyPaymentAuditConfig(
  userId?: string,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  return {
    userId,
    action: AuditAction.CREATE_PENALTY_PAYMENT,
    resource: 'PenaltyPayment',
    resourceIdExtractor: (result: { id?: string }) => result?.id,
    requestDataTransformer: (
      penaltyId?: string,
      provider?: PaymentProvider,
      customerInfo?: { name?: string; email?: string; phone?: string },
    ) => ({
      penaltyId: penaltyId || 'unknown',
      provider: provider || PaymentProvider.MONNIFY,
      hasCustomerInfo: !!customerInfo,
    }),
    responseDataTransformer: (result: {
      id?: string;
      paymentReference?: string;
      status?: string;
    }) => ({
      id: result?.id,
      paymentReference: result?.paymentReference,
      status: result?.status,
    }),
    metadata: {
      ...metadata,
    },
  };
}

/**
 * Creates audit config for user creation operations
 */
export function createUserCreationAuditConfig(
  userId?: string,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  return {
    userId,
    action: AuditAction.USER_REGISTER,
    resource: 'User',
    resourceIdExtractor: (result: { user?: { id?: string | number } }) => {
      if (result?.user?.id) {
        return typeof result.user.id === 'string'
          ? result.user.id
          : String(result.user.id);
      }
      return undefined;
    },
    requestDataTransformer: (userData?: {
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      userType?: string;
      [key: string]: unknown;
    }) => ({
      email: userData?.email,
      //   phone: userData?.phone ? '***' : undefined, // Sanitize phone
      phone: userData?.phone,
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      userType: userData?.userType,
    }),
    responseDataTransformer: (result: {
      user?: { id?: string; email?: string; userType?: string };
    }) => ({
      userId: result?.user?.id,
      email: result?.user?.email,
      userType: result?.user?.userType,
    }),
    metadata: {
      ...metadata,
    },
  };
}

/**
 * Creates audit config for user login/authentication operations
 */
export function createUserLoginAuditConfig(
  userId?: string,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  return {
    userId,
    action: AuditAction.USER_LOGIN,
    resource: 'User',
    resourceIdExtractor: (result: { user?: { id?: string | number } }) => {
      if (result?.user?.id) {
        return typeof result.user.id === 'string'
          ? result.user.id
          : String(result.user.id);
      }
      return undefined;
    },
    requestDataTransformer: (userType?: string, identifier?: string) => ({
      userType: userType || 'unknown',
      identifier:
        identifier && typeof identifier === 'string'
          ? identifier.includes('@')
            ? identifier
            : '***'
          : '***', // Sanitize non-email identifiers
    }),
    responseDataTransformer: (result: {
      user?: { id?: string; email?: string; userType?: string };
      accessToken?: string;
    }) => ({
      userId: result?.user?.id,
      email: result?.user?.email,
      userType: result?.user?.userType,
      hasAccessToken: !!result?.accessToken,
    }),
    metadata: {
      ...metadata,
    },
  };
}

/**
 * Creates audit config for estate creation operations
 */
export function createEstateCreationAuditConfig(
  userId: string,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  return {
    userId,
    action: AuditAction.CREATE_ESTATE,
    resource: 'Estate',
    resourceIdExtractor: (result: { estateId?: string }) => result?.estateId,
    requestDataTransformer: (estateData?: {
      name?: string;
      type?: string;
      countryName?: string;
      stateName?: string;
      [key: string]: unknown;
    }) => ({
      name: estateData?.name,
      type: estateData?.type,
      countryName: estateData?.countryName,
      stateName: estateData?.stateName,
    }),
    responseDataTransformer: (result: {
      estateId?: string;
      paymentReference?: string;
      amountPayable?: number;
      estateStatus?: string;
    }) => ({
      estateId: result?.estateId,
      paymentReference: result?.paymentReference,
      amountPayable: result?.amountPayable,
      estateStatus: result?.estateStatus,
    }),
    metadata: {
      ...metadata,
    },
  };
}

/**
 * Creates audit config for messaging operations (email, SMS, etc.)
 * Generic config that works with any messaging provider
 */
export function createMessagingAuditConfig(
  provider: string,
  action: AuditAction = AuditAction.SEND_EMAIL,
  userId?: string,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  return {
    userId,
    action,
    resource: provider,
    resourceIdExtractor: (result: { id?: string }) => result?.id,
    requestDataTransformer: (
      messagingData?: {
        email?: string;
        phone?: string;
        subject?: string;
        html?: string;
        text?: string;
        message?: string;
      },
      additionalData?: { to?: string; from?: string; recipients?: string[] },
    ) => ({
      to: additionalData?.to || messagingData?.email,
      phone: messagingData?.phone,
      recipients: additionalData?.recipients,
      from: additionalData?.from,
      subject: messagingData?.subject,
      message: messagingData?.message,
      hasHtml: !!messagingData?.html,
      hasText: !!messagingData?.text,
    }),
    responseDataTransformer: (result: { id?: string; error?: unknown }) => ({
      id: result?.id,
      success: !!result?.id && !result?.error,
      hasError: !!result?.error,
    }),
    trackMemory: true, // Track memory usage for external API calls
    trackCpu: true, // Track CPU usage for external API calls
    metadata: {
      provider,
      ...metadata,
    },
  };
}

/**
 * Creates audit config for Cloudinary file operations (upload, delete)
 */
export function createCloudinaryAuditConfig(
  operation: 'upload' | 'delete',
  userId?: string,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  const action =
    operation === 'upload' ? AuditAction.CREATE : AuditAction.DELETE;

  return {
    userId,
    action,
    resource: 'Cloudinary',
    resourceIdExtractor: (result: { public_id?: string }) => result?.public_id,
    requestDataTransformer: (
      firstArg?: Express.Multer.File | string,
      resourceTypeArg?: string,
    ) => {
      if (operation === 'upload') {
        const file = firstArg as Express.Multer.File | undefined;
        return {
          filename: file?.originalname,
          mimetype: file?.mimetype,
          size: file?.size,
          resourceType: resourceTypeArg,
        };
      } else {
        return {
          publicId: firstArg as string | undefined,
          resourceType: resourceTypeArg,
        };
      }
    },
    responseDataTransformer: (result: {
      secure_url?: string;
      public_id?: string;
      success?: boolean;
    }) => {
      if (operation === 'upload') {
        return {
          public_id: result?.public_id,
          hasUrl: !!result?.secure_url,
        };
      } else {
        return {
          success: result?.success,
        };
      }
    },
    trackMemory: true, // Track memory usage for file operations
    trackCpu: true, // Track CPU usage for file operations
    metadata: {
      provider: 'Cloudinary',
      operation,
      ...metadata,
    },
  };
}

/**
 * Generic audit config factory for common CRUD operations
 */
export function createCrudAuditConfig(
  action: AuditAction,
  resource: string,
  userId?: string,
  metadata?: Record<string, unknown>,
): TrackProcessOptions {
  return {
    userId,
    action,
    resource,
    resourceIdExtractor: (result: { id?: string | number }) => {
      if (result?.id) {
        return typeof result.id === 'string' ? result.id : String(result.id);
      }
      return undefined;
    },
    metadata: {
      ...metadata,
    },
  };
}
