"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSessionSchemaModel = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const mongoose_schema_utils_1 = require("../../utils/mongoose-schema.utils");
const device_session_schema_class_1 = require("../class/device-session.schema.class");
exports.DeviceSessionSchemaModel = (0, mongoose_schema_utils_1.createSchema)({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        index: true,
    },
    deviceId: {
        type: String,
        required: [true, 'Device ID is required'],
        index: true,
    },
    deviceName: {
        type: String,
        required: [true, 'Device name is required'],
    },
    deviceType: {
        type: String,
        enum: ['mobile', 'desktop', 'tablet', 'unknown'],
        default: 'unknown',
    },
    osVersion: {
        type: String,
        required: false,
    },
    userAgent: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    location: {
        country: String,
        city: String,
        region: String,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    lastActivityAt: {
        type: Date,
        default: () => (0, dayjs_1.default)().toDate(),
        index: true,
    },
    loginAt: {
        type: Date,
        default: () => (0, dayjs_1.default)().toDate(),
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    jti: {
        type: String,
        unique: true,
        sparse: true,
    },
}, {
    loadClass: device_session_schema_class_1.DeviceSessionSchemaClass,
    softDelete: true,
    auditFields: true,
    indexes: [
        { fields: { userId: 1, isActive: 1 } },
        { fields: { deviceId: 1 } },
        { fields: { jti: 1 } },
        { fields: { expiresAt: 1 } },
        { fields: { lastActivityAt: -1 } },
        { fields: { createdAt: -1 } },
        { fields: { userId: 1, isCurrentSession: 1 } },
    ],
});
//# sourceMappingURL=device-session.schema.model.js.map