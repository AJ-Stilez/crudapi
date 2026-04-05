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
exports.TokenMappingService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const uuid_1 = require("uuid");
const dayjs_1 = __importDefault(require("dayjs"));
const cache_services_1 = require("./cache.services");
const security_constant_1 = require("../../constants/security.constant");
let TokenMappingService = class TokenMappingService {
    cacheService;
    logger;
    CACHE_PREFIX = 'token_mapping:';
    MAPPING_TTL = security_constant_1.TOKEN_MAPPING_TTL_SECONDS;
    REVERSE_PREFIX = 'token_mapping_reverse:';
    constructor(cacheService, logger) {
        this.cacheService = cacheService;
        this.logger = logger;
    }
    getMappingKey(opaqueId) {
        return `${this.CACHE_PREFIX}${opaqueId}`;
    }
    getReverseKey(realId, type) {
        return `${this.REVERSE_PREFIX}${type}:${realId}`;
    }
    async createMappings(data) {
        const opaqueUserId = (0, uuid_1.v4)();
        const opaqueAuthId = (0, uuid_1.v4)();
        const mappingData = {
            userId: data.userId,
            authId: data.authId,
            accessType: data.accessType,
            createdAt: (0, dayjs_1.default)().valueOf(),
            jti: data.jti,
        };
        await Promise.all([
            this.cacheService.set(this.getMappingKey(opaqueUserId), mappingData, this.MAPPING_TTL),
            this.cacheService.set(this.getMappingKey(opaqueAuthId), mappingData, this.MAPPING_TTL),
        ]);
        const reverseKeys = [
            this.getReverseKey(data.userId, 'userId'),
            this.getReverseKey(data.authId, 'authId'),
        ];
        await Promise.all(reverseKeys.map(async (key) => {
            const existing = await this.cacheService.get(key);
            const opaqueIds = existing || [];
            const newOpaqueIds = [
                opaqueUserId,
                opaqueAuthId,
            ];
            const merged = Array.from(new Set([...opaqueIds, ...newOpaqueIds]));
            return this.cacheService.set(key, merged, this.MAPPING_TTL);
        }));
        this.logger.debug('Created token mappings', {
            opaqueUserId,
            realUserId: data.userId,
            accessType: data.accessType,
        });
        return {
            opaqueUserId,
            opaqueAuthId,
        };
    }
    async resolveMappings(opaqueIds) {
        const keysToTry = [
            opaqueIds.opaqueUserId && this.getMappingKey(opaqueIds.opaqueUserId),
            opaqueIds.opaqueAuthId && this.getMappingKey(opaqueIds.opaqueAuthId),
            opaqueIds.opaqueEstateId && this.getMappingKey(opaqueIds.opaqueEstateId),
            opaqueIds.opaqueAcpId && this.getMappingKey(opaqueIds.opaqueAcpId),
        ].filter(Boolean);
        if (keysToTry.length === 0) {
            return null;
        }
        for (const key of keysToTry) {
            const mapping = await this.cacheService.get(key);
            if (mapping) {
                return mapping;
            }
        }
        return null;
    }
    async revokeMappingsByRealId(realId, type) {
        const reverseKey = this.getReverseKey(realId, type);
        const opaqueIds = await this.cacheService.get(reverseKey);
        if (!opaqueIds || opaqueIds.length === 0) {
            this.logger.debug('No mappings found to revoke', { realId, type });
            return;
        }
        await Promise.all(opaqueIds.map((opaqueId) => this.cacheService.del(this.getMappingKey(opaqueId))));
        await this.cacheService.del(reverseKey);
        this.logger.log('Revoked token mappings', {
            realId,
            type,
            count: opaqueIds.length,
        });
    }
    async revokeMapping(opaqueId) {
        const mapping = await this.resolveMappings({ opaqueUserId: opaqueId });
        if (!mapping) {
            return;
        }
        await this.cacheService.del(this.getMappingKey(opaqueId));
        const reverseKeys = [
            this.getReverseKey(mapping.userId, 'userId'),
            this.getReverseKey(mapping.authId, 'authId'),
        ];
        if (mapping.estateId) {
            reverseKeys.push(this.getReverseKey(mapping.estateId, 'estateId'));
        }
        if (mapping.acpId) {
            reverseKeys.push(this.getReverseKey(mapping.acpId, 'acpId'));
        }
        await Promise.all(reverseKeys.map(async (key) => {
            const existing = await this.cacheService.get(key);
            if (existing) {
                const filtered = existing.filter((id) => id !== opaqueId);
                if (filtered.length > 0) {
                    await this.cacheService.set(key, filtered, this.MAPPING_TTL);
                }
                else {
                    await this.cacheService.del(key);
                }
            }
        }));
        this.logger.debug('Revoked token mapping', { opaqueId });
    }
    async extendMappingTTL(opaqueId, additionalSeconds = this.MAPPING_TTL) {
        const mapping = await this.resolveMappings({ opaqueUserId: opaqueId });
        if (!mapping) {
            return;
        }
        await this.cacheService.set(this.getMappingKey(opaqueId), mapping, additionalSeconds);
        this.logger.debug('Extended mapping TTL', { opaqueId, additionalSeconds });
    }
};
exports.TokenMappingService = TokenMappingService;
exports.TokenMappingService = TokenMappingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_services_1.CacheService,
        nestjs_pino_1.Logger])
], TokenMappingService);
//# sourceMappingURL=token-mapping.services.js.map