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
var AdminOnlyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOnlyGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
let AdminOnlyGuard = AdminOnlyGuard_1 = class AdminOnlyGuard {
    reflector;
    configService;
    logger = new common_1.Logger(AdminOnlyGuard_1.name);
    constructor(reflector, configService) {
        this.reflector = reflector;
        this.configService = configService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        this.logger.log(`Incoming request to ${request.originalUrl}`);
        if (!apiKey) {
            this.logger.warn(`Missing API key from IP: ${request.ip}`);
            throw new common_1.UnauthorizedException('X-API-KEY missing');
        }
        const apiKeyConfig = this.configService.get('API_KEY');
        if (!apiKeyConfig) {
            this.logger.error('API_KEY is not configured');
            throw new Error('API_KEY is not configured');
        }
        this.logger.log('Admin access granted');
        return apiKey === apiKeyConfig;
    }
};
exports.AdminOnlyGuard = AdminOnlyGuard;
exports.AdminOnlyGuard = AdminOnlyGuard = AdminOnlyGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        config_1.ConfigService])
], AdminOnlyGuard);
//# sourceMappingURL=admin-only.guard.js.map