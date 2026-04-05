"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth.service");
const auth_controller_1 = require("../controllers/auth.controller");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("../strategies/jwt.strategy");
const performance_module_1 = require("./performance.module");
const auth_cache_service_1 = require("../services/cache/auth-cache.service");
const mongoose_loader_module_1 = require("../loader/mongoose.loader.module");
const device_session_module_1 = require("./device-session.module");
const user_events_listener_1 = require("../events/listeners/user-events.listener");
const refresh_token_module_1 = require("./refresh-token.module");
const user_module_1 = require("./user.module");
const audit_trail_module_1 = require("./audit-trail.module");
const jwt_loader_module_1 = require("../loader/jwt.loader.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_loader_module_1.AuthMongooseFactoriesLoader,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            audit_trail_module_1.AuditTrailModule,
            refresh_token_module_1.RefreshTokenModule,
            performance_module_1.PerformanceModule,
            passport_1.PassportModule,
            device_session_module_1.DeviceSessionModule,
            jwt_loader_module_1.JwtModuleLoader,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, auth_cache_service_1.AuthCacheService, user_events_listener_1.UserEventsListener],
        exports: [auth_service_1.AuthService, jwt_loader_module_1.JwtModuleLoader],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map