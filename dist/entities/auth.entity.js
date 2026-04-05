"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSchema = exports.AuthUser = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const permissions_enum_1 = require("../enums/permissions.enum");
const access_type_1 = require("../enums/access_type");
let AuthUser = class AuthUser extends mongoose_2.Document {
    username;
    email;
    password;
    roles;
    permissions;
};
exports.AuthUser = AuthUser;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
    }),
    __metadata("design:type", String)
], AuthUser.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
    }),
    __metadata("design:type", String)
], AuthUser.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        select: false,
    }),
    __metadata("design:type", String)
], AuthUser.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: access_type_1.AccessType, default: [access_type_1.AccessType.USER] }),
    __metadata("design:type", Array)
], AuthUser.prototype, "roles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: permissions_enum_1.Permission, default: [permissions_enum_1.Permission.GET_USER] }),
    __metadata("design:type", Array)
], AuthUser.prototype, "permissions", void 0);
exports.AuthUser = AuthUser = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
    })
], AuthUser);
exports.AuthSchema = mongoose_1.SchemaFactory.createForClass(AuthUser);
//# sourceMappingURL=auth.entity.js.map