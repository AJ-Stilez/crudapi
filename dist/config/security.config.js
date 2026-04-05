"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityConfig = exports.getSecurityConfigName = exports.getJwtSecret = void 0;
const config_1 = require("@nestjs/config");
const security_constant_1 = require("../constants/security.constant");
const { JWT_TOKEN, BASIC_USERNAME, BASIC_PASSWORD, TOKEN_ENCRYPTION_KEY, } = process.env;
const REFRESH_TOKEN_FRONTEND_SECRET = process.env.REFRESH_TOKEN_FRONTEND_SECRET;
console.log(process.env);
const getJwtSecret = () => JWT_TOKEN;
exports.getJwtSecret = getJwtSecret;
const getSecurityConfigName = () => 'security';
exports.getSecurityConfigName = getSecurityConfigName;
const getSecurityConfig = () => {
    const jwtSecret = process.env.JWT_TOKEN;
    const expiresIn = parseInt(security_constant_1.JWT_ACCESS_TOKEN_EXPIRATION, 10);
    const refreshTokenFrontendSecret = process.env.REFRESH_TOKEN_FRONTEND_SECRET;
    if (!jwtSecret)
        throw new Error('JWT_TOKEN is not set in environment variables');
    if (!expiresIn)
        throw new Error('JWT_ACCESS_TOKEN_EXPIRATION is not set in environment variables');
    if (isNaN(expiresIn))
        throw new Error('JWT_ACCESS_TOKEN_EXPIRATION is not a valid number');
    return {
        jwtSecret,
        expiresIn,
        basicUsername: BASIC_USERNAME,
        basicPassword: BASIC_PASSWORD,
        refreshTokenFrontendSecret,
        tokenEncryptionKey: TOKEN_ENCRYPTION_KEY,
    };
};
exports.getSecurityConfig = getSecurityConfig;
exports.default = (0, config_1.registerAs)((0, exports.getSecurityConfigName)(), exports.getSecurityConfig);
//# sourceMappingURL=security.config.js.map