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
exports.RedisCacheProvider = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const nestjs_pino_1 = require("nestjs-pino");
let RedisCacheProvider = class RedisCacheProvider {
    logger;
    redisClient;
    constructor(options, logger) {
        this.logger = logger;
        this.redisClient = new ioredis_1.default({
            host: options.host,
            port: options.port,
            password: options.password,
            db: options.db,
        });
        this.redisClient.on('connect', () => {
            this.logger.log('Connected to Redis server.');
        });
        this.redisClient.on('error', (err) => {
            this.logger.error('Redis Client Error:', err);
        });
    }
    async get(key) {
        try {
            const data = await this.redisClient.get(key);
            if (!data) {
                return null;
            }
            return JSON.parse(data);
        }
        catch (error) {
            this.logger.error(`Failed to get key ${key} from Redis: ${error.message}`);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const data = JSON.stringify(value);
            if (ttlSeconds && ttlSeconds > 0) {
                await this.redisClient.set(key, data, 'EX', ttlSeconds);
            }
            else {
                await this.redisClient.set(key, data);
            }
        }
        catch (error) {
            this.logger.error(`Failed to set key ${key} in Redis: ${error.message}`);
        }
    }
    async del(key) {
        try {
            await this.redisClient.del(key);
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key} from Redis: ${error.message}`);
        }
    }
    async has(key) {
        try {
            const exists = await this.redisClient.exists(key);
            return exists === 1;
        }
        catch (error) {
            this.logger.error(`Failed to check existence for key ${key} in Redis: ${error.message}`);
            return false;
        }
    }
    async clear() {
        try {
            await this.redisClient.flushdb();
            this.logger.warn('Redis cache cleared (flushdb command executed).');
        }
        catch (error) {
            this.logger.error(`Failed to clear Redis cache: ${error.message}`);
        }
    }
    async delPattern(pattern) {
        try {
            const stream = this.redisClient.scanStream({
                match: pattern,
                count: 100,
            });
            const keys = [];
            stream.on('data', (resultKeys) => {
                keys.push(...resultKeys);
            });
            await new Promise((resolve, reject) => {
                stream.on('end', resolve);
                stream.on('error', reject);
            });
            if (keys.length === 0) {
                return 0;
            }
            const batchSize = 100;
            let deletedCount = 0;
            for (let i = 0; i < keys.length; i += batchSize) {
                const batch = keys.slice(i, i + batchSize);
                const result = await this.redisClient.del(...batch);
                deletedCount += result;
            }
            this.logger.debug(`Deleted ${deletedCount} keys matching pattern: ${pattern}`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to delete keys matching pattern ${pattern}: ${error.message}`);
            return 0;
        }
    }
    onModuleDestroy() {
        this.redisClient.disconnect();
        this.logger.log('Redis client disconnected.');
    }
};
exports.RedisCacheProvider = RedisCacheProvider;
exports.RedisCacheProvider = RedisCacheProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, nestjs_pino_1.Logger])
], RedisCacheProvider);
//# sourceMappingURL=redis-cache.provider.js.map