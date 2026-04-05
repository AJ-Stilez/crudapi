"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSchemaClass = exports.NonDocumentAuth = void 0;
class NonDocumentAuth {
    userId;
    identifier;
    email;
    phone;
    password;
    phoneConfirmedAt;
    emailConfirmedAt;
    roles;
    permissions;
    userType;
}
exports.NonDocumentAuth = NonDocumentAuth;
class AuthSchemaClass extends NonDocumentAuth {
    id;
}
exports.AuthSchemaClass = AuthSchemaClass;
//# sourceMappingURL=auth.schema.class.js.map