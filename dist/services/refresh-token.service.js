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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenService = void 0;
const common_1 = require("@nestjs/common");
const crud_service_1 = require("./core/crud.service");
const mongoose_1 = require("@nestjs/mongoose");
const security_constant_1 = require("../constants/security.constant");
const nestjs_pino_1 = require("nestjs-pino");
const uuid_1 = require("uuid");
const dayjs_1 = __importDefault(require("dayjs"));
const refresh_token_encryption_utils_1 = require("../utils/refresh-token-encryption.utils");
const mongoose_2 = require("mongoose");
const error_utils_1 = require("../utils/error.utils");
const audit_trail_schema_class_1 = require("../schema/class/audit-trail.schema.class");
const audit_actions_enums_1 = require("../enums/audit-actions.enums");
const audit_trail_service_1 = require("./audit-trail.service");
let RefreshTokenService = class RefreshTokenService extends crud_service_1.CrudService {
    refreshTokenModel;
    logger;
    auditTrailService;
    constructor(refreshTokenModel, logger, auditTrailService) {
        super(refreshTokenModel);
        this.refreshTokenModel = refreshTokenModel;
        this.logger = logger;
        this.auditTrailService = auditTrailService;
    }
    async createRefreshToken(userId, authId, deviceInfo, firstIssuedAt) {
        const tokenId = (0, uuid_1.v4)();
        const now = (0, dayjs_1.default)();
        const issuedAt = firstIssuedAt ? (0, dayjs_1.default)(firstIssuedAt) : now;
        await this.create({
            tokenId,
            userId,
            authId,
            deviceId: deviceInfo?.deviceId,
            userAgent: deviceInfo?.userAgent,
            ipAddress: deviceInfo?.ipAddress,
            expiresAt: now.add(security_constant_1.REFRESH_TOKEN_EXPIRATION_HOURS, 'hour'),
            firstIssuedAt: issuedAt.toDate(),
            refreshCount: 0,
            isRevoked: false,
        });
        this.logger.debug('Created refresh token', {
            tokenId,
            userId,
            expiresAt: now.add(security_constant_1.REFRESH_TOKEN_EXPIRATION_HOURS, 'hour').toISOString(),
        });
        return (0, refresh_token_encryption_utils_1.encryptRefreshToken)(tokenId);
    }
    async refreshAccessToken(encryptedRefreshToken, deviceInfo) {
        const refreshTokenId = (0, refresh_token_encryption_utils_1.decryptRefreshToken)(encryptedRefreshToken);
        const token = await this.validateRefreshToken(refreshTokenId, deviceInfo);
        const now = (0, dayjs_1.default)();
        const tokenDoc = token;
        await this.findByIdAndUpdate(tokenDoc.id, {
            lastUsedAt: now.toDate(),
            refreshCount: token.refreshCount + 1,
            lastRefreshAt: now.toDate(),
        });
        const firstIssuedDate = tokenDoc.firstIssuedAt instanceof Date
            ? tokenDoc.firstIssuedAt
            : (0, dayjs_1.default)(tokenDoc.firstIssuedAt).toDate();
        const newRefreshTokenId = await this.createRefreshToken(token.userId, token.authId, deviceInfo, firstIssuedDate);
        await this.revokeRefreshToken(token.tokenId, 'rotated');
        this.auditTrailService.createAuditEntryAsync({
            processType: audit_trail_schema_class_1.AuditTrailProcessType.INTERNAL_PROCESS,
            userId: token.userId,
            action: audit_actions_enums_1.AuditAction.TOKEN_REFRESHED,
            resource: 'RefreshToken',
            resourceId: token.tokenId,
            ipAddress: deviceInfo?.ipAddress,
            userAgent: deviceInfo?.userAgent,
            metadata: {
                oldTokenId: token.tokenId,
                newTokenId: newRefreshTokenId,
                refreshCount: token.refreshCount + 1,
                operation: 'token_rotation',
            },
        });
        this.logger.debug('Refreshed access token', {
            userId: token.userId,
            oldTokenId: token.tokenId,
            newTokenId: newRefreshTokenId,
        });
        return {
            userId: token.userId,
            authId: token.authId,
            newRefreshToken: newRefreshTokenId,
        };
    }
    async validateRefreshTokenExpiration(token) {
        const now = (0, dayjs_1.default)();
        if ((0, dayjs_1.default)(token.expiresAt).isBefore(now)) {
            return { valid: false, reason: 'expired' };
        }
        const hoursSinceFirstIssued = now.diff((0, dayjs_1.default)(token.firstIssuedAt), 'hour');
        if (hoursSinceFirstIssued > security_constant_1.MAX_SESSION_LIFETIME_HOURS) {
            return { valid: false, reason: 'max_lifetime_reached' };
        }
        if (token.lastUsedAt) {
            const hoursSinceLastUse = now.diff((0, dayjs_1.default)(token.lastUsedAt), 'hour');
            if (hoursSinceLastUse > security_constant_1.REFRESH_TOKEN_INACTIVITY_HOURS) {
                return { valid: false, reason: 'inactivity' };
            }
        }
        if (token.lastRefreshAt) {
            const lastRefreshDate = (0, dayjs_1.default)(token.lastRefreshAt).startOf('day');
            const today = now.startOf('day');
            if (lastRefreshDate.isSame(today)) {
                if (token.refreshCount >= security_constant_1.MAX_REFRESH_ATTEMPTS_PER_DAY) {
                    return { valid: false, reason: 'rate_limit' };
                }
            }
        }
        return { valid: true };
    }
    async revokeRefreshToken(tokenId, reason) {
        const token = await this.findOne({ tokenId });
        const userId = token?.userId;
        await this.updateMany({ tokenId, isRevoked: false }, {
            isRevoked: true,
            revokedAt: (0, dayjs_1.default)().toDate(),
            revokedReason: reason,
        });
        if (userId) {
            this.auditTrailService.createAuditEntryAsync({
                processType: audit_trail_schema_class_1.AuditTrailProcessType.INTERNAL_PROCESS,
                userId,
                action: audit_actions_enums_1.AuditAction.TOKEN_REVOKED,
                resource: 'RefreshToken',
                resourceId: tokenId,
                metadata: {
                    reason: reason || 'revoked',
                    operation: 'single_token_revocation',
                },
            });
        }
        this.logger.debug('Revoked refresh token', { tokenId, reason });
    }
    async revokeAllUserTokens(userId, reason) {
        const result = await this.updateMany({ userId, isRevoked: false }, {
            isRevoked: true,
            revokedAt: (0, dayjs_1.default)().toDate(),
            revokedReason: reason,
        });
        this.auditTrailService.createAuditEntryAsync({
            processType: audit_trail_schema_class_1.AuditTrailProcessType.INTERNAL_PROCESS,
            userId,
            action: audit_actions_enums_1.AuditAction.TOKEN_REVOKED,
            resource: 'User',
            resourceId: userId,
            metadata: {
                reason: reason || 'bulk_revocation',
                operation: 'revoke_all_user_tokens',
                tokensRevoked: result.modifiedCount,
            },
        });
        this.logger.log('Revoked all refresh tokens for user', {
            userId,
            count: result.modifiedCount,
            reason,
        });
    }
    validateIpAddress(originalIp, currentIp) {
        if (originalIp === '127.0.0.1' ||
            originalIp === '::1' ||
            currentIp === '127.0.0.1' ||
            currentIp === '::1' ||
            originalIp.startsWith('192.168.') ||
            originalIp.startsWith('10.') ||
            originalIp.startsWith('172.') ||
            currentIp.startsWith('192.168.') ||
            currentIp.startsWith('10.') ||
            currentIp.startsWith('172.')) {
            return { valid: true, severity: 'low' };
        }
        if (originalIp === currentIp) {
            return { valid: true, severity: 'low' };
        }
        const getIpComponents = (ip) => {
            const parts = ip.split('.');
            if (parts.length === 4) {
                return {
                    type: 'ipv4',
                    parts: parts.map((p) => parseInt(p, 10)),
                };
            }
            return { type: 'ipv6', address: ip };
        };
        const original = getIpComponents(originalIp);
        const current = getIpComponents(currentIp);
        if (original.type !== current.type) {
            return {
                valid: false,
                severity: 'high',
                reason: 'IP type mismatch (IPv4 vs IPv6)',
            };
        }
        if (original.type === 'ipv4' && current.type === 'ipv4') {
            return {
                valid: true,
                severity: 'low',
                reason: 'Different subnet, same network class',
            };
        }
        if (original.type === 'ipv6' && current.type === 'ipv6') {
            return {
                valid: true,
                severity: 'low',
                reason: 'IPv6 address change',
            };
        }
        return { valid: true, severity: 'low' };
    }
    async validateRefreshToken(tokenId, deviceInfo) {
        const token = await this.findOne({
            tokenId,
            isRevoked: false,
        });
        if (!token) {
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Invalid or revoked refresh token', common_1.HttpStatus.UNAUTHORIZED), this.logger, 'Refresh token not found or revoked');
        }
        const expirationCheck = await this.validateRefreshTokenExpiration(token);
        if (!expirationCheck.valid) {
            await this.revokeRefreshToken(tokenId, expirationCheck.reason);
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Refresh token expired. Please sign in again.', common_1.HttpStatus.UNAUTHORIZED), this.logger, `Refresh token expired: ${expirationCheck.reason}`);
        }
        if (token.lastUsedAt) {
            this.auditTrailService.createAuditEntryAsync({
                processType: audit_trail_schema_class_1.AuditTrailProcessType.INTERNAL_PROCESS,
                userId: token.userId,
                action: audit_actions_enums_1.AuditAction.TOKEN_REUSE_DETECTED,
                resource: 'RefreshToken',
                resourceId: token.tokenId,
                metadata: {
                    reason: 'token_reuse_detected',
                    lastUsedAt: token.lastUsedAt,
                    severity: 'high',
                },
            });
            await this.revokeAllUserTokens(token.userId, 'token_reuse_detected');
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Token reuse detected. All sessions have been revoked for security.', common_1.HttpStatus.UNAUTHORIZED), this.logger, 'Token reuse detected - security breach');
        }
        if (deviceInfo?.deviceId && token.deviceId) {
            if (deviceInfo.deviceId !== token.deviceId) {
                this.auditTrailService.createAuditEntryAsync({
                    processType: audit_trail_schema_class_1.AuditTrailProcessType.INTERNAL_PROCESS,
                    userId: token.userId,
                    action: audit_actions_enums_1.AuditAction.DEVICE_MISMATCH_DETECTED,
                    resource: 'RefreshToken',
                    resourceId: token.tokenId,
                    metadata: {
                        reason: 'device_mismatch',
                        originalDeviceId: token.deviceId,
                        attemptedDeviceId: deviceInfo.deviceId,
                    },
                });
                await this.revokeRefreshToken(tokenId, 'device_mismatch');
                return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Device mismatch detected. Please sign in again.', common_1.HttpStatus.UNAUTHORIZED), this.logger, 'Device mismatch detected');
            }
        }
        if (deviceInfo?.ipAddress && token.ipAddress) {
            const ipValidation = this.validateIpAddress(token.ipAddress, deviceInfo.ipAddress);
            if (!ipValidation.valid) {
                if (ipValidation.severity === 'high') {
                    this.auditTrailService.createAuditEntryAsync({
                        processType: audit_trail_schema_class_1.AuditTrailProcessType.INTERNAL_PROCESS,
                        userId: token.userId,
                        action: audit_actions_enums_1.AuditAction.IP_VALIDATION_FAILED,
                        resource: 'RefreshToken',
                        resourceId: token.tokenId,
                        ipAddress: deviceInfo.ipAddress,
                        metadata: {
                            reason: ipValidation.reason,
                            severity: 'high',
                            originalIp: token.ipAddress,
                            newIp: deviceInfo.ipAddress,
                            action: 'token_revoked',
                        },
                    });
                    await this.revokeRefreshToken(tokenId, 'suspicious_ip_change');
                    this.logger.warn('Suspicious IP change detected - token revoked', {
                        userId: token.userId,
                        originalIp: token.ipAddress,
                        newIp: deviceInfo.ipAddress,
                        reason: ipValidation.reason,
                    });
                    return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Suspicious activity detected. Please sign in again.', common_1.HttpStatus.UNAUTHORIZED), this.logger, 'Suspicious IP change');
                }
                else {
                    this.auditTrailService.createAuditEntryAsync({
                        processType: audit_trail_schema_class_1.AuditTrailProcessType.INTERNAL_PROCESS,
                        userId: token.userId,
                        action: audit_actions_enums_1.AuditAction.IP_VALIDATION_FAILED,
                        resource: 'RefreshToken',
                        resourceId: token.tokenId,
                        ipAddress: deviceInfo.ipAddress,
                        metadata: {
                            reason: ipValidation.reason,
                            severity: 'low',
                            originalIp: token.ipAddress,
                            newIp: deviceInfo.ipAddress,
                            action: 'logged_allowed',
                        },
                    });
                    this.logger.warn('IP address change detected', {
                        userId: token.userId,
                        originalIp: token.ipAddress,
                        newIp: deviceInfo.ipAddress,
                        reason: ipValidation.reason,
                    });
                }
            }
        }
        if (token.refreshCount > 0 && token.lastRefreshAt) {
            const minutesSinceLastRefresh = (0, dayjs_1.default)().diff((0, dayjs_1.default)(token.lastRefreshAt), 'minute');
        }
        return token;
    }
};
exports.RefreshTokenService = RefreshTokenService;
exports.RefreshTokenService = RefreshTokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('RefreshToken')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        nestjs_pino_1.Logger,
        audit_trail_service_1.AuditTrailService])
], RefreshTokenService);
//# sourceMappingURL=refresh-token.service.js.map