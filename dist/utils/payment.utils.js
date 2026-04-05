"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformResidentDuePayments = exports.formatPaymentResponse = exports.generateTransactionReference = exports.generatePaymentReference = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const generatePaymentReference = () => {
    const timestamp = (0, dayjs_1.default)().valueOf().toString();
    const random = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');
    return `PAY-${timestamp}-${random}`;
};
exports.generatePaymentReference = generatePaymentReference;
const generateTransactionReference = () => {
    const timestamp = (0, dayjs_1.default)().valueOf().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN-${timestamp}-${random}`.toUpperCase();
};
exports.generateTransactionReference = generateTransactionReference;
const formatPaymentResponse = (payment) => {
    const p = payment?.toObject ? payment.toObject() : payment;
    const paymentMethod = p?.providerData?.paymentMethod ||
        p?.metadata?.paymentMethod ||
        p?.metadata?.methodUsed ||
        p?.metadata?.method ||
        (Array.isArray(p?.providerData?.paymentMethods) &&
            String(p.providerData.paymentMethods.at(0))) ||
        p?.provider;
    const userId = p?.userId;
    const fullName = userId && (userId.firstName || userId.lastName)
        ? `${userId.firstName || ''} ${userId.lastName || ''}`.trim()
        : p?.customerName;
    const phone = userId?.phone || undefined;
    return {
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        description: p.description,
        status: p.status,
        paymentReference: p.paymentReference,
        checkoutUrl: p.checkoutUrl,
        type: p.type,
        category: p.category,
        paymentMethod,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        fullName,
        phone,
    };
};
exports.formatPaymentResponse = formatPaymentResponse;
const transformResidentDuePayments = (payments) => {
    return payments.map((payment) => {
        const paymentObj = payment.toObject ? payment.toObject() : payment;
        const { paymentConfigurationId, ...rest } = paymentObj;
        return {
            ...rest,
            paymentConfiguration: paymentConfigurationId,
        };
    });
};
exports.transformResidentDuePayments = transformResidentDuePayments;
//# sourceMappingURL=payment.utils.js.map