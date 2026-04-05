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
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptRefreshToken = encryptRefreshToken;
exports.decryptRefreshToken = decryptRefreshToken;
exports.encryptAccessToken = encryptAccessToken;
exports.decryptAccessToken = decryptAccessToken;
const crypto = __importStar(require("crypto"));
const common_1 = require("@nestjs/common");
const security_config_1 = require("../config/security.config");
const REFRESH_TOKEN_PREFIX = 'RT_';
const REFRESH_TOKEN_SUFFIX = '_CRUDAPI';
function getFrontendSecret() {
    const config = (0, security_config_1.getSecurityConfig)();
    const secret = config.refreshTokenFrontendSecret;
    if (!secret) {
        throw new common_1.BadRequestException('REFRESH_TOKEN_FRONTEND_SECRET environment variable is required');
    }
    return secret;
}
function getTokenEncryptionKey() {
    const config = (0, security_config_1.getSecurityConfig)();
    let key = config.tokenEncryptionKey || config.jwtSecret || '';
    if (key.length !== 64 || !/^[0-9a-fA-F]+$/.test(key)) {
        key = crypto.createHash('sha256').update(key).digest('hex');
    }
    return key;
}
function getRefreshTokenEncryptionKey() {
    return getTokenEncryptionKey();
}
function encryptRefreshToken(tokenId) {
    try {
        const key = getRefreshTokenEncryptionKey();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(tokenId, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const encryptedData = iv.toString('hex') + ':' + encrypted.toString('hex');
        return `${REFRESH_TOKEN_PREFIX}${encryptedData}${REFRESH_TOKEN_SUFFIX}`;
    }
    catch (error) {
        throw new common_1.BadRequestException('Failed to encrypt refresh token');
    }
}
function decryptRefreshToken(encryptedToken) {
    try {
        const frontendSecret = getFrontendSecret();
        if (!encryptedToken.endsWith(frontendSecret)) {
            throw new common_1.BadRequestException('Invalid refresh token format: missing or invalid frontend secret');
        }
        const tokenWithoutSecret = encryptedToken.slice(0, encryptedToken.length - frontendSecret.length);
        if (!tokenWithoutSecret.startsWith(REFRESH_TOKEN_PREFIX)) {
            throw new common_1.BadRequestException('Invalid refresh token format: missing prefix');
        }
        if (!tokenWithoutSecret.endsWith(REFRESH_TOKEN_SUFFIX)) {
            throw new common_1.BadRequestException('Invalid refresh token format: missing suffix');
        }
        const encryptedData = tokenWithoutSecret.slice(REFRESH_TOKEN_PREFIX.length, tokenWithoutSecret.length - REFRESH_TOKEN_SUFFIX.length);
        const key = getRefreshTokenEncryptionKey();
        const textParts = encryptedData.split(':');
        if (textParts.length !== 2) {
            throw new common_1.BadRequestException('Invalid refresh token format: invalid encryption');
        }
        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(key, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    }
    catch (error) {
        if (error instanceof common_1.BadRequestException) {
            throw error;
        }
        throw new common_1.BadRequestException('Failed to decrypt refresh token');
    }
}
function encryptAccessToken(accessToken) {
    try {
        const key = getTokenEncryptionKey();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(accessToken, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    catch (error) {
        throw new common_1.BadRequestException('Failed to encrypt access token');
    }
}
function decryptAccessToken(encryptedToken) {
    try {
        const key = getTokenEncryptionKey();
        const textParts = encryptedToken.split(':');
        if (textParts.length !== 2) {
            throw new common_1.BadRequestException('Invalid access token format: invalid encryption');
        }
        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(key, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    }
    catch (error) {
        if (error instanceof common_1.BadRequestException) {
            throw error;
        }
        throw new common_1.BadRequestException('Failed to decrypt access token');
    }
}
//# sourceMappingURL=refresh-token-encryption.utils.js.map