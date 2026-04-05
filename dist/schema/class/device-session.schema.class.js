"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSessionSchemaClass = exports.NonDocumentDeviceSession = void 0;
class NonDocumentDeviceSession {
    userId;
    deviceId;
    deviceName;
    deviceType;
    osVersion;
    userAgent;
    ipAddress;
    location;
    isActive;
    lastActivityAt;
    loginAt;
    expiresAt;
    jti;
}
exports.NonDocumentDeviceSession = NonDocumentDeviceSession;
class DeviceSessionSchemaClass extends NonDocumentDeviceSession {
    id;
}
exports.DeviceSessionSchemaClass = DeviceSessionSchemaClass;
//# sourceMappingURL=device-session.schema.class.js.map