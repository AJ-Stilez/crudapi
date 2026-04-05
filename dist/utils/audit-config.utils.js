"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentAuditConfig = createPaymentAuditConfig;
exports.createPaymentVerificationAuditConfig = createPaymentVerificationAuditConfig;
exports.createPenaltyPaymentAuditConfig = createPenaltyPaymentAuditConfig;
exports.createUserCreationAuditConfig = createUserCreationAuditConfig;
exports.createUserLoginAuditConfig = createUserLoginAuditConfig;
exports.createEstateCreationAuditConfig = createEstateCreationAuditConfig;
exports.createMessagingAuditConfig = createMessagingAuditConfig;
exports.createCloudinaryAuditConfig = createCloudinaryAuditConfig;
exports.createCrudAuditConfig = createCrudAuditConfig;
const audit_actions_enums_1 = require("../enums/audit-actions.enums");
const payment_schema_class_1 = require("../schema/class/payment.schema.class");
function createPaymentAuditConfig(userId, action, metadata) {
    return {
        userId,
        action,
        resource: 'Payment',
        resourceIdExtractor: (result) => result?.id,
        requestDataTransformer: (data) => ({
            amount: data?.amount,
            currency: data?.currency,
            description: data?.description,
            provider: data?.provider || payment_schema_class_1.PaymentProvider.MONNIFY,
            type: data?.type,
            category: data?.category,
            estateId: data?.estateId,
        }),
        responseDataTransformer: (result) => ({
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
function createPaymentVerificationAuditConfig(userId, metadata) {
    return {
        userId,
        action: audit_actions_enums_1.AuditAction.VERIFY_PAYMENT,
        resource: 'Payment',
        resourceIdExtractor: (result) => result?.id,
        requestDataTransformer: (paymentReference, meta) => ({
            paymentReference: paymentReference || 'unknown',
            metadata: meta ? { hasMetadata: true } : undefined,
        }),
        responseDataTransformer: (result) => ({
            id: result?.id,
            paymentReference: result?.paymentReference,
            status: result?.status,
        }),
        metadata: {
            ...metadata,
        },
    };
}
function createPenaltyPaymentAuditConfig(userId, metadata) {
    return {
        userId,
        action: audit_actions_enums_1.AuditAction.CREATE_PENALTY_PAYMENT,
        resource: 'PenaltyPayment',
        resourceIdExtractor: (result) => result?.id,
        requestDataTransformer: (penaltyId, provider, customerInfo) => ({
            penaltyId: penaltyId || 'unknown',
            provider: provider || payment_schema_class_1.PaymentProvider.MONNIFY,
            hasCustomerInfo: !!customerInfo,
        }),
        responseDataTransformer: (result) => ({
            id: result?.id,
            paymentReference: result?.paymentReference,
            status: result?.status,
        }),
        metadata: {
            ...metadata,
        },
    };
}
function createUserCreationAuditConfig(userId, metadata) {
    return {
        userId,
        action: audit_actions_enums_1.AuditAction.USER_REGISTER,
        resource: 'User',
        resourceIdExtractor: (result) => {
            if (result?.user?.id) {
                return typeof result.user.id === 'string'
                    ? result.user.id
                    : String(result.user.id);
            }
            return undefined;
        },
        requestDataTransformer: (userData) => ({
            email: userData?.email,
            phone: userData?.phone,
            firstName: userData?.firstName,
            lastName: userData?.lastName,
            userType: userData?.userType,
        }),
        responseDataTransformer: (result) => ({
            userId: result?.user?.id,
            email: result?.user?.email,
            userType: result?.user?.userType,
        }),
        metadata: {
            ...metadata,
        },
    };
}
function createUserLoginAuditConfig(userId, metadata) {
    return {
        userId,
        action: audit_actions_enums_1.AuditAction.USER_LOGIN,
        resource: 'User',
        resourceIdExtractor: (result) => {
            if (result?.user?.id) {
                return typeof result.user.id === 'string'
                    ? result.user.id
                    : String(result.user.id);
            }
            return undefined;
        },
        requestDataTransformer: (userType, identifier) => ({
            userType: userType || 'unknown',
            identifier: identifier && typeof identifier === 'string'
                ? identifier.includes('@')
                    ? identifier
                    : '***'
                : '***',
        }),
        responseDataTransformer: (result) => ({
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
function createEstateCreationAuditConfig(userId, metadata) {
    return {
        userId,
        action: audit_actions_enums_1.AuditAction.CREATE_ESTATE,
        resource: 'Estate',
        resourceIdExtractor: (result) => result?.estateId,
        requestDataTransformer: (estateData) => ({
            name: estateData?.name,
            type: estateData?.type,
            countryName: estateData?.countryName,
            stateName: estateData?.stateName,
        }),
        responseDataTransformer: (result) => ({
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
function createMessagingAuditConfig(provider, action = audit_actions_enums_1.AuditAction.SEND_EMAIL, userId, metadata) {
    return {
        userId,
        action,
        resource: provider,
        resourceIdExtractor: (result) => result?.id,
        requestDataTransformer: (messagingData, additionalData) => ({
            to: additionalData?.to || messagingData?.email,
            phone: messagingData?.phone,
            recipients: additionalData?.recipients,
            from: additionalData?.from,
            subject: messagingData?.subject,
            message: messagingData?.message,
            hasHtml: !!messagingData?.html,
            hasText: !!messagingData?.text,
        }),
        responseDataTransformer: (result) => ({
            id: result?.id,
            success: !!result?.id && !result?.error,
            hasError: !!result?.error,
        }),
        trackMemory: true,
        trackCpu: true,
        metadata: {
            provider,
            ...metadata,
        },
    };
}
function createCloudinaryAuditConfig(operation, userId, metadata) {
    const action = operation === 'upload' ? audit_actions_enums_1.AuditAction.CREATE : audit_actions_enums_1.AuditAction.DELETE;
    return {
        userId,
        action,
        resource: 'Cloudinary',
        resourceIdExtractor: (result) => result?.public_id,
        requestDataTransformer: (firstArg, resourceTypeArg) => {
            if (operation === 'upload') {
                const file = firstArg;
                return {
                    filename: file?.originalname,
                    mimetype: file?.mimetype,
                    size: file?.size,
                    resourceType: resourceTypeArg,
                };
            }
            else {
                return {
                    publicId: firstArg,
                    resourceType: resourceTypeArg,
                };
            }
        },
        responseDataTransformer: (result) => {
            if (operation === 'upload') {
                return {
                    public_id: result?.public_id,
                    hasUrl: !!result?.secure_url,
                };
            }
            else {
                return {
                    success: result?.success,
                };
            }
        },
        trackMemory: true,
        trackCpu: true,
        metadata: {
            provider: 'Cloudinary',
            operation,
            ...metadata,
        },
    };
}
function createCrudAuditConfig(action, resource, userId, metadata) {
    return {
        userId,
        action,
        resource,
        resourceIdExtractor: (result) => {
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
//# sourceMappingURL=audit-config.utils.js.map