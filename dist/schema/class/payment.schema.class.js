"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSchemaClass = exports.NonDocumentPayment = exports.BillingFrequency = exports.PaymentCategory = exports.PaymentType = exports.PaymentProvider = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["MONNIFY"] = "MONNIFY";
    PaymentProvider["DOT_AI"] = "DOT_AI";
    PaymentProvider["MOCK"] = "MOCK";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["ONE_TIME"] = "ONE_TIME";
    PaymentType["RECURRING"] = "RECURRING";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var PaymentCategory;
(function (PaymentCategory) {
    PaymentCategory["ESTATE_CREATION"] = "ESTATE_CREATION";
    PaymentCategory["SUBSCRIPTION"] = "SUBSCRIPTION";
    PaymentCategory["SERVICE"] = "SERVICE";
    PaymentCategory["OTHER"] = "OTHER";
    PaymentCategory["RENT"] = "RENT";
    PaymentCategory["MAINTENANCE"] = "MAINTENANCE";
    PaymentCategory["SECURITY"] = "SECURITY";
    PaymentCategory["DAMAGES"] = "DAMAGES";
    PaymentCategory["DUES"] = "DUES";
    PaymentCategory["FINE"] = "FINE";
})(PaymentCategory || (exports.PaymentCategory = PaymentCategory = {}));
var BillingFrequency;
(function (BillingFrequency) {
    BillingFrequency["DAILY"] = "DAILY";
    BillingFrequency["WEEKLY"] = "WEEKLY";
    BillingFrequency["MONTHLY"] = "MONTHLY";
    BillingFrequency["QUARTERLY"] = "QUARTERLY";
    BillingFrequency["BIANNUALLY"] = "BIANNUALLY";
    BillingFrequency["ANNUALLY"] = "ANNUALLY";
})(BillingFrequency || (exports.BillingFrequency = BillingFrequency = {}));
class NonDocumentPayment {
    userId;
    estateId;
    subscriptionId;
    paymentConfigurationId;
    amount;
    currency;
    description;
    paymentReference;
    provider;
    providerReference;
    status;
    type;
    category;
    customerName;
    customerEmail;
    checkoutUrl;
    providerData;
    paidAt;
    cancelledAt;
    failedAt;
    failureReason;
    metadata;
    deletedAt;
    createdAt;
    updatedAt;
}
exports.NonDocumentPayment = NonDocumentPayment;
class PaymentSchemaClass extends NonDocumentPayment {
    id;
    isSuccessful() {
        return this.status === PaymentStatus.PAID;
    }
    isFailed() {
        return this.status === PaymentStatus.FAILED;
    }
    isCancelled() {
        return this.status === PaymentStatus.CANCELLED;
    }
    isPending() {
        return this.status === PaymentStatus.PENDING;
    }
}
exports.PaymentSchemaClass = PaymentSchemaClass;
//# sourceMappingURL=payment.schema.class.js.map