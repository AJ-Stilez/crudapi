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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../services/user.service");
const create_user_validator_1 = require("../validators/create-user.validator");
const access_type_1 = require("../enums/access_type");
const event_emitter_1 = require("@nestjs/event-emitter");
const error_utils_1 = require("../utils/error.utils");
const lodash_1 = require("lodash");
const auth_service_1 = require("../services/auth.service");
const refresh_token_encryption_utils_1 = require("../utils/refresh-token-encryption.utils");
const user_event_1 = require("../events/user.event");
const nestjs_pino_1 = require("nestjs-pino");
const conditional_files_interceptor_1 = require("../interceptors/conditional-files.interceptor");
let UserController = class UserController {
    userService;
    authService;
    eventEmitter;
    logger;
    constructor(userService, authService, eventEmitter, logger) {
        this.userService = userService;
        this.authService = authService;
        this.eventEmitter = eventEmitter;
        this.logger = logger;
    }
    async createUser(selfie = [], data, req) {
        const deviceInfo = {
            userAgent: req.headers['user-agent'] || 'unknown',
            ipAddress: req.ip ||
                req.socket?.remoteAddress ||
                '',
        };
        return await this.processCreateUser(data, access_type_1.AccessType.USER, selfie ?? [], deviceInfo);
    }
    async processCreateUser(data, userType, selfie = [], deviceInfo) {
        try {
            const userData = (0, lodash_1.omit)(data, 'tokenId', 'code');
            if (userData.email) {
                userData.email = userData.email.toLowerCase();
            }
            const { user, token } = await this.userService.createUser({
                ...userData,
                userType,
            }, userType, data?.tokenId, data?.code, selfie);
            const jti = (await import('uuid')).v4();
            const accessToken = await this.authService.generateAccessToken({
                userId: user.id,
                jti,
            }, userType);
            const encryptedAccessToken = accessToken
                ? (0, refresh_token_encryption_utils_1.encryptAccessToken)(accessToken)
                : null;
            if (deviceInfo) {
                await this.authService.createDeviceSessionForNewUser(user.id, jti, deviceInfo);
            }
            this.eventEmitter.emit(user_event_1.NEW_USER_CREATED_FOR_AUTH, new user_event_1.NewUserCreatedEvent({
                identifier: user.email ?? user.phone,
                userId: user.id,
                email: user.email,
                phone: user.phone,
                password: user.password,
                userType: userType,
                firstName: user.firstName,
            }));
            return { accessToken: encryptedAccessToken };
        }
        catch (err) {
            (0, error_utils_1.handleAndThrowError)(err, this.logger, 'Error Creating User');
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.UseInterceptors)((0, conditional_files_interceptor_1.ConditionalFilesInterceptor)('selfie', 1)),
    (0, common_1.Post)('create-account'),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array,
        create_user_validator_1.CreateUserValidator, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService,
        event_emitter_1.EventEmitter2,
        nestjs_pino_1.Logger])
], UserController);
//# sourceMappingURL=user.controller.js.map