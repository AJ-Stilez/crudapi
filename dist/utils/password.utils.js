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
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.isPasswordStrong = isPasswordStrong;
exports.generateRandomPassword = generateRandomPassword;
exports.validatePasswordPolicy = validatePasswordPolicy;
exports.hashPasswordWithSalt = hashPasswordWithSalt;
exports.generatePasswordResetToken = generatePasswordResetToken;
exports.generateSalt = generateSalt;
const argon = __importStar(require("argon2"));
const worker_threads_1 = require("worker_threads");
const path_1 = require("path");
async function hashPassword(password) {
    return await argon.hash(password);
}
async function verifyPassword(hash, password) {
    return new Promise((resolve, reject) => {
        const workerPath = (0, path_1.join)(__dirname, '../workers/argon-worker.js');
        const worker = new worker_threads_1.Worker(workerPath, {
            workerData: { hash, password },
        });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker exited with code ${code}`));
            }
        });
    });
}
function isPasswordStrong(password) {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
}
function generateRandomPassword(length = 12, includeSpecialChars = true) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let chars = lowercase + uppercase + numbers;
    if (includeSpecialChars) {
        chars += special;
    }
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSpecialChars) {
        password += special[Math.floor(Math.random() * special.length)];
    }
    for (let i = password.length; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}
function validatePasswordPolicy(password, policy) {
    const errors = [];
    if (password.length < policy.minLength) {
        errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    if (policy.maxLength && password.length > policy.maxLength) {
        errors.push(`Password must be no more than ${policy.maxLength} characters long`);
    }
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (policy.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (policy.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    if (policy.disallowedWords) {
        const lowerPassword = password.toLowerCase();
        for (const word of policy.disallowedWords) {
            if (lowerPassword.includes(word.toLowerCase())) {
                errors.push(`Password cannot contain the word "${word}"`);
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
async function hashPasswordWithSalt(password, salt) {
    const combinedPassword = password + salt;
    return await argon.hash(combinedPassword);
}
function generatePasswordResetToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}
function generateSalt(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    for (let i = 0; i < length; i++) {
        salt += chars[Math.floor(Math.random() * chars.length)];
    }
    return salt;
}
//# sourceMappingURL=password.utils.js.map