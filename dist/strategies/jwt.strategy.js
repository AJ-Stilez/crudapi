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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const access_type_1 = require("../enums/access_type");
const security_config_1 = require("../config/security.config");
const refresh_token_encryption_utils_1 = require("../utils/refresh-token-encryption.utils");
const nestjs_pino_1 = require("nestjs-pino");
const error_utils_1 = require("../utils/error.utils");
const token_mapping_services_1 = require("../services/cache/token-mapping.services");
const cache_services_1 = require("../services/cache/cache.services");
const device_session_service_1 = require("../services/device-session.service");
const dayjs_1 = __importDefault(require("dayjs"));
const auth_service_1 = require("../services/auth.service");
const role_util_1 = require("../utils/app/role.util");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    logger;
    tokenMappingService;
    authService;
    cacheService;
    deviceSessionService;
    cacheKeyPrefix = 'jwt_session:';
    rolesCacheKeyPrefix = 'jwt_roles:';
    cacheTTL = 300;
    negativeCacheTTL = 60;
    rolesCacheTTL = 300;
    constructor(logger, tokenMappingService, authService, cacheService, deviceSessionService) {
        super({
            secretOrKey: (0, security_config_1.getSecurityConfig)().jwtSecret,
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                (request) => {
                    const authHeader = request.headers?.authorization;
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return null;
                    }
                    try {
                        const encryptedToken = authHeader.substring(7);
                        request._encryptedToken = encryptedToken;
                        return (0, refresh_token_encryption_utils_1.decryptAccessToken)(encryptedToken);
                    }
                    catch (error) {
                        this.logger.warn('Failed to decrypt access token', {
                            error: error.message,
                        });
                        return null;
                    }
                },
            ]),
            ignoreExpiration: false,
        });
        this.logger = logger;
        this.tokenMappingService = tokenMappingService;
        this.authService = authService;
        this.cacheService = cacheService;
        this.deviceSessionService = deviceSessionService;
    }
    async validate(payload) {
        if (!payload) {
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Unauthenticated', common_1.HttpStatus.UNAUTHORIZED), null, 'Unauthenticated');
        }
        const mapping = await this.tokenMappingService.resolveMappings({
            opaqueUserId: payload.userId,
            opaqueAuthId: payload.authId,
            opaqueAcpId: payload.metadata?.acpId,
        });
        if (!mapping) {
            this.logger.warn('Token mapping not found for opaque IDs', {
                opaqueUserId: payload.userId,
                opaqueAuthId: payload.authId,
            });
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Invalid token: mapping not found', common_1.HttpStatus.UNAUTHORIZED), null, 'Token mapping not found');
        }
        if (payload.jti) {
            const sessionCacheKey = `${this.cacheKeyPrefix}${payload.jti}`;
            const cachedSession = await this.cacheService.get(sessionCacheKey);
            if (cachedSession !== null) {
                if (!cachedSession.isValid) {
                    return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Session expired or invalid', common_1.HttpStatus.UNAUTHORIZED), null, 'Invalid session (cached)');
                }
                this.deviceSessionService.updateActivity(payload.jti).catch((error) => {
                    this.logger.warn('Failed to update session activity', {
                        jti: payload.jti,
                        error: error.message,
                    });
                });
                return this.attachRoles(mapping, payload);
            }
            const session = await this.deviceSessionService.findOne({
                jti: payload.jti,
                isActive: true,
                expiresAt: { $gt: (0, dayjs_1.default)().toDate() },
            });
            if (!session) {
                await this.cacheService.set(sessionCacheKey, { isValid: false, jti: payload.jti }, this.negativeCacheTTL);
                this.logger.warn('No device session found for token jti; client may be using an old token', {
                    jti: payload.jti,
                    userId: mapping.userId,
                    accessType: payload.accessType,
                });
                return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Session expired or invalid', common_1.HttpStatus.UNAUTHORIZED), null, 'Invalid session');
            }
            await this.cacheService.set(sessionCacheKey, { isValid: true, jti: payload.jti }, this.cacheTTL);
            await this.deviceSessionService.updateActivity(payload.jti);
        }
        return this.attachRoles(mapping, payload);
    }
    async attachRoles(mapping, payload) {
        const rolesCacheKey = `${this.rolesCacheKeyPrefix}${mapping.authId}`;
        const cachedRoles = await this.cacheService.get(rolesCacheKey);
        if (cachedRoles !== null) {
            return {
                userId: mapping.userId,
                authId: mapping.authId,
                accessType: payload.accessType ?? access_type_1.AccessType.USER,
                metadata: mapping.acpId ? { acpId: mapping.acpId } : undefined,
                id: mapping.userId,
                roles: cachedRoles,
            };
        }
        const accessType = payload.accessType ?? access_type_1.AccessType.USER;
        let roles = [];
        let lastErr;
        for (let attempt = 0; attempt <= 1; attempt++) {
            try {
                const authDoc = await this.authService.findOne({ _id: mapping.authId }, { select: 'roles' });
                roles = Array.isArray(authDoc?.roles)
                    ? authDoc.roles
                    : [];
                await this.cacheService.set(rolesCacheKey, roles, this.rolesCacheTTL);
                lastErr = undefined;
                break;
            }
            catch (err) {
                lastErr = err instanceof Error ? err : new Error(String(err));
                this.logger.warn('Failed to load roles for JWT user', {
                    authId: mapping.authId,
                    attempt: attempt + 1,
                    error: lastErr.message,
                });
            }
        }
        if (lastErr && roles.length === 0) {
            if (accessType === access_type_1.AccessType.ADMIN) {
                roles = [role_util_1.UserRole.Administrator];
            }
        }
        return {
            userId: mapping.userId,
            authId: mapping.authId,
            accessType,
            metadata: mapping.acpId ? { acpId: mapping.acpId } : undefined,
            id: mapping.userId,
            roles,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.Logger,
        token_mapping_services_1.TokenMappingService,
        auth_service_1.AuthService,
        cache_services_1.CacheService,
        device_session_service_1.DeviceSessionService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map