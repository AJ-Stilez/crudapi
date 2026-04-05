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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth.service");
const authenticate_dto_1 = require("../dtos/authenticate.dto");
const nestjs_pino_1 = require("nestjs-pino");
const access_type_1 = require("../enums/access_type");
const refresh_token_encryption_utils_1 = require("../utils/refresh-token-encryption.utils");
const refresh_token_header_decorator_1 = require("../decorators/refresh-token-header.decorator");
const error_utils_1 = require("../utils/error.utils");
let AuthController = class AuthController {
    authService;
    logger;
    constructor(authService, logger) {
        this.authService = authService;
        this.logger = logger;
    }
    async authenticate(data, req, ip) {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const location = await this.getLocationFromIP(ip);
        const deviceInfo = {
            deviceId: data.deviceId,
            userAgent,
            ipAddress: ip,
            deviceName: data.deviceName,
            osVersion: data.osVersion,
            deviceType: data.deviceType,
            location,
        };
        const { user, accessToken, refreshToken, deviceSession } = await this.authService.authenticate(data.userType, data.identifier, data.password, deviceInfo);
        const encryptedAccessToken = accessToken
            ? (0, refresh_token_encryption_utils_1.encryptAccessToken)(accessToken)
            : null;
        return {
            accessToken: encryptedAccessToken,
            refreshToken: refreshToken || undefined,
            user,
            deviceSession,
        };
    }
    async getLocationFromIP(ip) {
        try {
            if (ip === '127.0.0.1' ||
                ip === '::1' ||
                ip.startsWith('192.168.') ||
                ip.startsWith('10.') ||
                ip.startsWith('172.')) {
                return undefined;
            }
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            if (response.ok) {
                const data = await response.json();
                return {
                    country: data.country_name,
                    city: data.city,
                    region: data.region,
                };
            }
            return undefined;
        }
        catch (error) {
            this.logger.warn(`Failed to get location for IP ${ip}: ${error.message}`);
            return undefined;
        }
    }
    async refreshToken(encryptedRefreshToken, req, ip) {
        const deviceInfo = {
            deviceId: req.headers['x-device-id'] || undefined,
            userAgent: req.headers['user-agent'] || '',
            ipAddress: ip,
        };
        try {
            const { userId, authId, newRefreshToken } = await this.authService.refreshAccessToken(encryptedRefreshToken, deviceInfo);
            const accessToken = await this.authService.generateAccessToken({
                userId,
                authId,
                jti: undefined,
            }, access_type_1.AccessType.USER);
            const encryptedAccessToken = (0, refresh_token_encryption_utils_1.encryptAccessToken)(accessToken);
            return {
                accessToken: encryptedAccessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Failed to refresh token. Please sign in again.', common_1.HttpStatus.UNAUTHORIZED), this.logger, 'Failed to refresh token');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('authenticate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticate_dto_1.AuthenticateValidator,
        Request, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "authenticate", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, refresh_token_header_decorator_1.RefreshTokenHeader)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Request, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        nestjs_pino_1.Logger])
], AuthController);
//# sourceMappingURL=auth.controller.js.map