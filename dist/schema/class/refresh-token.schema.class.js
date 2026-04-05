"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSchemaClass = exports.NonDocumentRefreshToken = void 0;
class NonDocumentRefreshToken {
    tokenId;
    userId;
    authId;
    deviceId;
    userAgent;
    ipAddress;
    expiresAt;
    firstIssuedAt;
    lastUsedAt;
    refreshCount;
    lastRefreshAt;
    isRevoked;
    revokedAt;
    revokedReason;
}
exports.NonDocumentRefreshToken = NonDocumentRefreshToken;
class RefreshTokenSchemaClass extends NonDocumentRefreshToken {
    id;
}
exports.RefreshTokenSchemaClass = RefreshTokenSchemaClass;
//# sourceMappingURL=refresh-token.schema.class.js.map