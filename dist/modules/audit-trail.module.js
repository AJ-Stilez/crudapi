"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const audit_trail_interceptor_1 = require("../interceptors/audit-trail.interceptor");
const mongoose_loader_module_1 = require("../loader/mongoose.loader.module");
const audit_trail_service_1 = require("../services/audit-trail.service");
let AuditTrailModule = class AuditTrailModule {
};
exports.AuditTrailModule = AuditTrailModule;
exports.AuditTrailModule = AuditTrailModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_loader_module_1.AuditTrailMongooseFactoriesLoader],
        providers: [
            audit_trail_service_1.AuditTrailService,
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_trail_interceptor_1.AuditTrailInterceptor },
        ],
        exports: [audit_trail_service_1.AuditTrailService],
    })
], AuditTrailModule);
//# sourceMappingURL=audit-trail.module.js.map