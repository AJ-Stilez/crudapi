"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const cacheProviderTypes = __importStar(require("../../types/cache-provider.types"));
let CacheService = class CacheService {
    cacheProvider;
    logger;
    constructor(cacheProvider, logger) {
        this.cacheProvider = cacheProvider;
        this.logger = logger;
    }
    async get(key) {
        this.logger.log(`CacheService: Attempting to get key: ${key}`);
        return this.cacheProvider.get(key);
    }
    async set(key, value, ttlSeconds) {
        this.logger.log(`CacheService: Setting key: ${key} with TTL: ${ttlSeconds || 'none'}s`);
        return this.cacheProvider.set(key, value, ttlSeconds);
    }
    async getOrSet(key, factory, ttlSeconds) {
        this.logger.log(`CacheService: Attempting to get or set key: ${key}`);
        const cachedValue = await this.cacheProvider.get(key);
        if (cachedValue !== null) {
            this.logger.log(`CacheService: Cache hit for key: ${key}`);
            return cachedValue;
        }
        this.logger.log(`CacheService: Cache miss for key: ${key}, generating value`);
        const newValue = await factory();
        await this.cacheProvider.set(key, newValue, ttlSeconds);
        this.logger.log(`CacheService: Stored new value for key: ${key}`);
        return newValue;
    }
    async del(key) {
        this.logger.log(`CacheService: Deleting key: ${key}`);
        return this.cacheProvider.del(key);
    }
    async has(key) {
        this.logger.log(`CacheService: Checking if key exists: ${key}`);
        return this.cacheProvider.has(key);
    }
    async clear() {
        this.logger.log('CacheService: Clearing all cache entries.');
        return this.cacheProvider.clear();
    }
    async delPattern(pattern) {
        this.logger.log(`CacheService: Deleting keys matching pattern: ${pattern}`);
        return this.cacheProvider.delPattern(pattern);
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cacheProviderTypes.CACHE_PROVIDER)),
    __metadata("design:paramtypes", [Object, nestjs_pino_1.Logger])
], CacheService);
//# sourceMappingURL=cache.services.js.map