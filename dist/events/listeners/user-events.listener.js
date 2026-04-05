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
exports.UserEventsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const nestjs_pino_1 = require("nestjs-pino");
const auth_service_1 = require("../../services/auth.service");
const user_event_1 = require("../user.event");
let UserEventsListener = class UserEventsListener {
    authService;
    logger;
    constructor(authService, logger) {
        this.authService = authService;
        this.logger = logger;
    }
    async onboardedAndSetupUserAuthEventListener(payload) {
        const plainPayload = JSON.parse(JSON.stringify(payload));
        let roles = [];
        let permissions = [];
        switch (plainPayload.userType) {
            case 'user':
                roles = ['user'];
                permissions = ['view_profile', 'update_profile', 'edit_profile'];
                break;
            default:
                roles = ['user'];
                permissions = ['view_profile'];
        }
        const authUserObject = {
            identifier: plainPayload.identifier,
            userId: plainPayload.userId,
            email: plainPayload.email,
            phone: plainPayload.phone,
            password: plainPayload.password,
            userType: plainPayload.userType,
            roles: plainPayload.roles || roles,
            permissions: plainPayload.permissions || permissions,
            assignedEstates: plainPayload.assignedEstates || [],
            emailConfirmedAt: plainPayload.emailConfirmedAt,
            phoneConfirmedAt: plainPayload.phoneConfirmedAt,
        };
        await this.authService.create(authUserObject);
    }
};
exports.UserEventsListener = UserEventsListener;
__decorate([
    (0, event_emitter_1.OnEvent)(user_event_1.NEW_USER_CREATED_FOR_AUTH),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserEventsListener.prototype, "onboardedAndSetupUserAuthEventListener", null);
exports.UserEventsListener = UserEventsListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        nestjs_pino_1.Logger])
], UserEventsListener);
//# sourceMappingURL=user-events.listener.js.map