"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function transformResponse(data, cached) {
    return {
        count: Array.isArray(data) ? data.length : 1,
        responseData: data,
        cached,
    };
}
let AdminCacheInterceptor = class AdminCacheInterceptor {
    cache = new Map();
    TTL = 30_000;
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, user } = request;
        if (method !== 'GET') {
            return next.handle();
        }
        const key = `admin:${user.userId}:${url}`;
        const cached = this.cache.get(key);
        if (cached && cached.expiresAt > Date.now()) {
            return (0, rxjs_1.of)(transformResponse(cached.value, true));
        }
        return next.handle().pipe((0, operators_1.tap)((response) => {
            this.cache.set(key, {
                value: response,
                expiresAt: Date.now() + this.TTL,
            });
        }), (0, operators_1.map)((data) => transformResponse(data, false)));
    }
};
exports.AdminCacheInterceptor = AdminCacheInterceptor;
exports.AdminCacheInterceptor = AdminCacheInterceptor = __decorate([
    (0, common_1.Injectable)()
], AdminCacheInterceptor);
//# sourceMappingURL=admin-cache.interceptor.js.map