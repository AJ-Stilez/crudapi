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
exports.AuthCacheService = void 0;
const common_1 = require("@nestjs/common");
const dayjs_1 = __importDefault(require("dayjs"));
const nestjs_pino_1 = require("nestjs-pino");
const cache_services_1 = require("./cache.services");
let AuthCacheService = class AuthCacheService {
    cacheService;
    logger;
    CACHE_PREFIX = 'auth:';
    DEFAULT_TTL = 3600;
    constructor(cacheService, logger) {
        this.cacheService = cacheService;
        this.logger = logger;
    }
    generateCacheKey(userId) {
        return `${this.CACHE_PREFIX}${userId}`;
    }
    async getUserData(userId) {
        try {
            const key = this.generateCacheKey(userId);
            const cached = await this.cacheService.get(key);
            if (!cached) {
                return null;
            }
            if (cached.expiresAt && (0, dayjs_1.default)().valueOf() > cached.expiresAt) {
                await this.invalidateUserData(userId);
                return null;
            }
            return cached;
        }
        catch (error) {
            this.logger.error(`Error retrieving user data from cache for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }
    async setUserData(userId, userData, ttl = this.DEFAULT_TTL) {
        try {
            const key = this.generateCacheKey(userId);
            const now = (0, dayjs_1.default)().valueOf();
            const cacheData = {
                ...userData,
                cachedAt: now,
                expiresAt: now + ttl * 1000,
            };
            await this.cacheService.set(key, cacheData, ttl);
            return true;
        }
        catch (error) {
            this.logger.error(`Error setting user data in cache for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
    async invalidateUserData(userId) {
        try {
            const key = this.generateCacheKey(userId);
            await this.cacheService.del(key);
            return true;
        }
        catch (error) {
            this.logger.error(`Error invalidating user data from cache for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
    async invalidateMultipleUsers(userIds) {
        try {
            const keys = userIds.map((userId) => this.generateCacheKey(userId));
            const results = await Promise.allSettled(keys.map((key) => this.cacheService.del(key)));
            return results.filter((result) => result.status === 'fulfilled').length;
        }
        catch (error) {
            this.logger.error(`Error invalidating multiple users from cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return 0;
        }
    }
    async hasUserData(userId) {
        try {
            const key = this.generateCacheKey(userId);
            return await this.cacheService.has(key);
        }
        catch (error) {
            this.logger.error(`Error checking user data in cache for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
    async updateUserData(userId, updates) {
        try {
            const existing = await this.getUserData(userId);
            if (!existing) {
                return false;
            }
            const updatedData = {
                ...existing,
                ...updates,
                cachedAt: (0, dayjs_1.default)().valueOf(),
            };
            const key = this.generateCacheKey(userId);
            const remainingTtl = Math.max(0, Math.floor((existing.expiresAt - (0, dayjs_1.default)().valueOf()) / 1000));
            await this.cacheService.set(key, updatedData, remainingTtl);
            return true;
        }
        catch (error) {
            this.logger.error(`Error updating user data in cache for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
    async getStats() {
        try {
            return {
                service: 'AuthCacheService',
                timestamp: (0, dayjs_1.default)().valueOf(),
                note: 'Detailed stats not available in current implementation',
            };
        }
        catch (error) {
            this.logger.error(`Error getting cache stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {};
        }
    }
};
exports.AuthCacheService = AuthCacheService;
exports.AuthCacheService = AuthCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_services_1.CacheService,
        nestjs_pino_1.Logger])
], AuthCacheService);
//# sourceMappingURL=auth-cache.service.js.map