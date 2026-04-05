"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppTokenSchemaClass = exports.NonDocumentAppToken = void 0;
class NonDocumentAppToken {
    identifierId;
    identifierType;
    purpose;
    code;
    expiresBy;
    token;
    name;
    description;
    permissions;
    isActive;
    expiresAt;
    lastUsedAt;
}
exports.NonDocumentAppToken = NonDocumentAppToken;
class AppTokenSchemaClass extends NonDocumentAppToken {
    id;
}
exports.AppTokenSchemaClass = AppTokenSchemaClass;
//# sourceMappingURL=app-token.schema.class.js.map