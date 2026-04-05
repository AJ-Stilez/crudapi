"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailSchemaClass = exports.NonDocumentAuditTrail = exports.AuditTrailProcessType = void 0;
var AuditTrailProcessType;
(function (AuditTrailProcessType) {
    AuditTrailProcessType["INCOMING_REQUEST"] = "INCOMING_REQUEST";
    AuditTrailProcessType["OUTGOING_REQUEST"] = "OUTGOING_REQUEST";
    AuditTrailProcessType["INTERNAL_PROCESS"] = "INTERNAL_PROCESS";
})(AuditTrailProcessType || (exports.AuditTrailProcessType = AuditTrailProcessType = {}));
class NonDocumentAuditTrail {
    processType;
    userId;
    action;
    resource;
    resourceId;
    method;
    path;
    externalUrl;
    ipAddress;
    userAgent;
    requestData;
    responseData;
    statusCode;
    errorMessage;
    metadata;
    createdAt;
    updatedAt;
}
exports.NonDocumentAuditTrail = NonDocumentAuditTrail;
class AuditTrailSchemaClass extends NonDocumentAuditTrail {
    id;
}
exports.AuditTrailSchemaClass = AuditTrailSchemaClass;
//# sourceMappingURL=audit-trail.schema.class.js.map