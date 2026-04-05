"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailSchemaModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_schema_utils_1 = require("../../utils/mongoose-schema.utils");
const audit_trail_schema_class_1 = require("../class/audit-trail.schema.class");
exports.AuditTrailSchemaModel = (0, mongoose_schema_utils_1.createSchema)({
    processType: {
        type: String,
        enum: Object.values(audit_trail_schema_class_1.AuditTrailProcessType),
        required: [true, 'Process type is required'],
        index: true,
    },
    userId: {
        type: String,
        index: true,
    },
    action: {
        type: String,
        required: [true, 'Action is required'],
        index: true,
    },
    resource: {
        type: String,
        required: [true, 'Resource is required'],
        index: true,
    },
    resourceId: {
        type: String,
        index: true,
    },
    method: {
        type: String,
        index: true,
    },
    path: {
        type: String,
        index: true,
    },
    externalUrl: {
        type: String,
        index: true,
    },
    ipAddress: {
        type: String,
        index: true,
    },
    userAgent: {
        type: String,
    },
    requestData: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    responseData: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    statusCode: {
        type: Number,
        index: true,
    },
    errorMessage: {
        type: String,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    loadClass: true,
    softDelete: false,
    auditFields: false,
    indexes: [
        { fields: { processType: 1, createdAt: -1 } },
        { fields: { userId: 1, createdAt: -1 } },
        { fields: { resource: 1, resourceId: 1 } },
        { fields: { action: 1, createdAt: -1 } },
        { fields: { path: 1, createdAt: -1 } },
        { fields: { externalUrl: 1, createdAt: -1 } },
        { fields: { createdAt: -1 } },
        { fields: { method: 1, path: 1 } },
    ],
});
//# sourceMappingURL=audit-trail.schema.model.js.map