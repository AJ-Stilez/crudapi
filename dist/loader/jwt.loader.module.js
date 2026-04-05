"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtModuleLoader = void 0;
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const security_config_1 = require("../config/security.config");
exports.JwtModuleLoader = jwt_1.JwtModule.registerAsync({
    imports: [config_1.ConfigModule],
    useFactory: async () => {
        const security = (0, security_config_1.getSecurityConfig)();
        return {
            secret: security.jwtSecret,
            signOptions: { expiresIn: security.expiresIn },
        };
    },
    inject: [config_1.ConfigService],
});
//# sourceMappingURL=jwt.loader.module.js.map