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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupArrayData = exports.formatValidationErrors = exports.getDurationInMilliseconds = exports.formatRequestBody = exports.randomCharacters = exports.randomNumbers = exports.generateRandomNumber = exports.GLOBAL_CHARACTERS = exports.multerDefaultConfig = void 0;
exports.encryptQrData = encryptQrData;
exports.decryptQrData = decryptQrData;
exports.encryptAuditLogData = encryptAuditLogData;
exports.decryptAuditLogData = decryptAuditLogData;
exports.pickRandomArrayItem = pickRandomArrayItem;
exports.retryWithBackoffAdvanced = retryWithBackoffAdvanced;
exports.retryWithBackoff = retryWithBackoff;
exports.getNestedValue = getNestedValue;
exports.omitFields = omitFields;
exports.IsEmailOrPhone = IsEmailOrPhone;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const path_1 = require("path");
const CryptoJS = __importStar(require("crypto-js"));
const class_validator_1 = require("class-validator");
const helper_utils_1 = require("./helper.utils");
const error_utils_1 = require("./error.utils");
const dayjs_1 = __importDefault(require("dayjs"));
const AES_SECRET_KEY = process.env.QR_AES_SECRET || 'super-secure-key';
const AUDIT_LOG_SECRET_KEY = process.env.AUDIT_LOG_AES_SECRET ||
    process.env.QR_AES_SECRET ||
    'super-secure-key';
function encryptQrData(data) {
    return CryptoJS.AES.encrypt(data, AES_SECRET_KEY).toString();
}
function decryptQrData(encrypted) {
    const bytes = CryptoJS.AES.decrypt(encrypted, AES_SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}
function encryptAuditLogData(data) {
    return CryptoJS.AES.encrypt(data, AUDIT_LOG_SECRET_KEY).toString();
}
function decryptAuditLogData(encrypted) {
    const bytes = CryptoJS.AES.decrypt(encrypted, AUDIT_LOG_SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
        (0, error_utils_1.handleAndThrowError)(new Error('Failed to decrypt audit log data - invalid encrypted format'), null, 'Failed to decrypt audit log data - invalid encrypted format');
    }
    return decrypted;
}
exports.multerDefaultConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads',
        filename: (req, file, cb) => {
            const uniqueSuffix = (0, dayjs_1.default)().valueOf() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv)$/)) {
            return cb(new common_1.BadRequestException('Only CSV files are allowed!'), false);
        }
        cb(null, true);
    },
};
exports.GLOBAL_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateRandomNumber = (min, max) => {
    const difference = max - min;
    let rand = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
};
exports.generateRandomNumber = generateRandomNumber;
function pickRandomArrayItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
const randomNumbers = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randomNumbers = randomNumbers;
const randomCharacters = (length, chars) => {
    let result = '';
    for (let i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};
exports.randomCharacters = randomCharacters;
const formatRequestBody = (body) => {
    const body_proc = { ...body };
    if (body_proc.password)
        body_proc.password = body_proc.password.replace(/./g, '*');
    if (body_proc.confirmPassword)
        body_proc.confirmPassword = body_proc.confirmPassword.replace(/./g, '*');
    return body_proc;
};
exports.formatRequestBody = formatRequestBody;
const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};
exports.getDurationInMilliseconds = getDurationInMilliseconds;
const formatValidationErrors = (errors) => {
    return errors.map((error) => {
        if (error.children && error.children.length > 0) {
            const nestedErrors = (0, exports.formatValidationErrors)(error.children);
            if (Array.isArray(error.value)) {
                return nestedErrors.map((nestedError) => ({
                    error: `${error.property} contains invalid elements`,
                    children: nestedError.children,
                }));
            }
            else {
                return {
                    error: `${error.property} has wrong value`,
                    children: nestedErrors,
                };
            }
        }
        else {
            const valueDisplay = typeof error.value === 'object'
                ? JSON.stringify(error.value)
                : String(error.value);
            return {
                error: `${error.property} has wrong value ${valueDisplay}`,
                message: Object.values(error.constraints || {}).join(', '),
            };
        }
    });
};
exports.formatValidationErrors = formatValidationErrors;
const cleanupArrayData = (arr) => {
    return arr.map((dto) => {
        return Object.fromEntries(Object.entries(dto).filter(([key, value]) => key !== '' && value !== ''));
    });
};
exports.cleanupArrayData = cleanupArrayData;
async function retryWithBackoffAdvanced(fn, options = {}) {
    const { retries = 3, delay = 500, maxDelay = 10_000, jitter = true, timeoutPerAttempt, retryable = () => true, onRetry, fallback, signal, } = options;
    let attempt = 0;
    const run = async (currentDelay) => {
        if (signal?.aborted) {
            return (0, error_utils_1.handleAndThrowError)(new Error('Retry aborted'), null, 'Retry aborted');
        }
        attempt++;
        try {
            return timeoutPerAttempt
                ? await Promise.race([
                    fn(attempt),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Attempt timed out')), timeoutPerAttempt)),
                ])
                : await fn(attempt);
        }
        catch (error) {
            if (attempt > retries || !retryable(error, attempt)) {
                if (fallback)
                    return fallback();
                throw error;
            }
            const nextDelay = jitter
                ? Math.min(maxDelay, currentDelay * (0.5 + Math.random()))
                : Math.min(maxDelay, currentDelay);
            onRetry?.(error, attempt, nextDelay);
            await new Promise((resolve, reject) => {
                const timer = setTimeout(resolve, nextDelay);
                if (signal) {
                    signal.addEventListener('abort', () => {
                        clearTimeout(timer);
                        reject(new Error('Retry aborted'));
                    }, { once: true });
                }
            });
            return run(currentDelay * 2);
        }
    };
    return run(delay);
}
async function retryWithBackoff(fn, retries = 3, delay = 500) {
    try {
        return await fn();
    }
    catch (error) {
        if (retries <= 0)
            throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
}
function getNestedValue(obj, path) {
    return path
        .split('.')
        .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}
function omitFields(payload, keysToOmit) {
    const result = { ...payload };
    for (const key of keysToOmit) {
        delete result[key];
    }
    return result;
}
function IsEmailOrPhone(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.Validate)((value) => {
            if (!value)
                return false;
            return (0, helper_utils_1.isValidEmail)(value) || /^\+?[\d\s\-\(\)]+$/.test(value);
        }, {
            message: 'Identifier must be a valid email address or phone number',
            ...validationOptions,
        })(object, propertyName);
    };
}
//# sourceMappingURL=global.utils.js.map