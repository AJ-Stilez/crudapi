"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCacheProvider = void 0;
const common_1 = require("@nestjs/common");
const dayjs_1 = __importDefault(require("dayjs"));
let InMemoryCacheProvider = class InMemoryCacheProvider {
    cache = new Map();
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (entry.expiry && entry.expiry < (0, dayjs_1.default)().valueOf()) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        const entry = { value };
        if (ttlSeconds && ttlSeconds > 0) {
            entry.expiry = (0, dayjs_1.default)().valueOf() + ttlSeconds * 1000;
        }
        this.cache.set(key, entry);
    }
    async del(key) {
        this.cache.delete(key);
    }
    async has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        if (entry.expiry && entry.expiry < (0, dayjs_1.default)().valueOf()) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    async clear() {
        this.cache.clear();
    }
    async delPattern(pattern) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        let deletedCount = 0;
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        return deletedCount;
    }
};
exports.InMemoryCacheProvider = InMemoryCacheProvider;
exports.InMemoryCacheProvider = InMemoryCacheProvider = __decorate([
    (0, common_1.Injectable)()
], InMemoryCacheProvider);
//# sourceMappingURL=in-memory-cache.provider.js.map