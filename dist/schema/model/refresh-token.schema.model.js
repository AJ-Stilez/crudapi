"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSchemaModel = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const mongoose_schema_utils_1 = require("../../utils/mongoose-schema.utils");
const refresh_token_schema_class_1 = require("../class/refresh-token.schema.class");
const security_constant_1 = require("../../constants/security.constant");
exports.RefreshTokenSchemaModel = (0, mongoose_schema_utils_1.createSchema)({
    tokenId: {
        type: String,
        required: [true, 'Token ID is required'],
        unique: true,
        index: true,
    },
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        index: true,
    },
    authId: {
        type: String,
        required: [true, 'Auth ID is required'],
        index: true,
    },
    deviceId: {
        type: String,
        required: false,
        index: true,
    },
    userAgent: {
        type: String,
        required: false,
    },
    ipAddress: {
        type: String,
        required: false,
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required'],
        index: true,
        default: () => (0, dayjs_1.default)().add(security_constant_1.REFRESH_TOKEN_EXPIRATION_HOURS, 'hour').toDate(),
    },
    firstIssuedAt: {
        type: Date,
        required: [true, 'First issued date is required'],
        index: true,
        default: () => (0, dayjs_1.default)().toDate(),
    },
    lastUsedAt: {
        type: Date,
        required: false,
    },
    refreshCount: {
        type: Number,
        default: 0,
        required: true,
    },
    lastRefreshAt: {
        type: Date,
        required: false,
    },
    isRevoked: {
        type: Boolean,
        default: false,
        index: true,
    },
    revokedAt: {
        type: Date,
        required: false,
    },
    revokedReason: {
        type: String,
        required: false,
        enum: [
            'user_logout',
            'password_change',
            'security_incident',
            'expired',
            'max_lifetime_reached',
            'inactivity',
            'rate_limit',
            'token_reuse_detected',
            'device_mismatch',
            'ip_mismatch',
        ],
    },
}, {
    loadClass: refresh_token_schema_class_1.RefreshTokenSchemaClass,
    indexes: [
        { fields: { tokenId: 1 }, options: { unique: true } },
        { fields: { userId: 1, isRevoked: 1 } },
        { fields: { expiresAt: 1 } },
        { fields: { firstIssuedAt: 1 } },
        { fields: { lastUsedAt: 1 } },
        { fields: { deviceId: 1 } },
        { fields: { createdAt: -1 } },
    ],
});
//# sourceMappingURL=refresh-token.schema.model.js.map