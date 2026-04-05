"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let AdminInterceptor = class AdminInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const start = Date.now();
        console.log(`Admin ${request.user?.userId} requested ${request.method} ${request.url}`);
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - start;
            console.log(`Handled in ${duration}ms`);
        }), (0, operators_1.map)(data => ({
            success: true,
            count: Array.isArray(data) ? data.length : undefined,
            data,
        })));
    }
};
exports.AdminInterceptor = AdminInterceptor;
exports.AdminInterceptor = AdminInterceptor = __decorate([
    (0, common_1.Injectable)()
], AdminInterceptor);
//# sourceMappingURL=admin.interceptor.js.map