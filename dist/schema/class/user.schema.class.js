"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchemaClass = exports.NonDocumentUser = exports.UserStatus = void 0;
var UserStatus;
(function (UserStatus) {
})(UserStatus || (exports.UserStatus = UserStatus = {}));
class NonDocumentUser {
    firstName;
    lastName;
    userName;
    email;
    phone;
    countryCode;
    password;
    phoneConfirmedAt;
    emailConfirmedAt;
    roles;
    position;
    permissions;
    userType;
    selfiePhotoId;
    faceImageId;
    selfiePhotoUrl;
    faceImageUrl;
    hasVerifiedIdentity;
    identityVerifiedAt;
    createdAt;
    updatedAt;
    deletedAt;
}
exports.NonDocumentUser = NonDocumentUser;
class UserSchemaClass extends NonDocumentUser {
    id;
    createdBy;
    updatedBy;
    deletedBy;
}
exports.UserSchemaClass = UserSchemaClass;
//# sourceMappingURL=user.schema.class.js.map