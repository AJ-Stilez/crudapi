"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceModule = void 0;
const common_1 = require("@nestjs/common");
const cache_services_1 = require("../services/cache/cache.services");
const in_memory_cache_provider_1 = require("../services/cache/providers/in-memory-cache.provider");
const token_mapping_services_1 = require("../services/cache/token-mapping.services");
const cache_provider_types_1 = require("../types/cache-provider.types");
let PerformanceModule = class PerformanceModule {
};
exports.PerformanceModule = PerformanceModule;
exports.PerformanceModule = PerformanceModule = __decorate([
    (0, common_1.Module)({
        providers: [
            { provide: cache_provider_types_1.CACHE_PROVIDER, useClass: in_memory_cache_provider_1.InMemoryCacheProvider },
            in_memory_cache_provider_1.InMemoryCacheProvider,
            cache_services_1.CacheService,
            token_mapping_services_1.TokenMappingService
        ],
        exports: [cache_services_1.CacheService, token_mapping_services_1.TokenMappingService],
    })
], PerformanceModule);
//# sourceMappingURL=performance.module.js.map