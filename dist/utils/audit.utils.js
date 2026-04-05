"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENSITIVE_FIELDS = void 0;
exports.sanitizeData = sanitizeData;
exports.extractIpAddress = extractIpAddress;
exports.normalizeRequestBodyForDedup = normalizeRequestBodyForDedup;
exports.extractResourceInfo = extractResourceInfo;
exports.determineAction = determineAction;
const helper_utils_1 = require("./helper.utils");
const phone_utils_1 = require("./phone.utils");
const global_utils_1 = require("./global.utils");
exports.SENSITIVE_FIELDS = [
    'password',
    'currentPassword',
    'newPassword',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'authorization',
    'creditCard',
    'cvv',
    'pin',
    'estateGateId',
    'estateGateIdEncrypted',
    'estateGateIdHash',
    'gateId',
    'gateIdEncrypted',
    'gateIdHash',
];
function sanitizeData(data, visited = new WeakSet(), depth = 0) {
    const MAX_DEPTH = 10;
    if (depth > MAX_DEPTH) {
        return { '[MAX_DEPTH_REACHED]': true };
    }
    if (!data || typeof data !== 'object') {
        return undefined;
    }
    if (visited.has(data)) {
        return { '[CIRCULAR_REFERENCE]': true };
    }
    let plainData = data;
    if (data &&
        typeof data === 'object' &&
        'toObject' in data &&
        typeof data.toObject === 'function') {
        try {
            const converted = data.toObject();
            if (converted && typeof converted === 'object' && converted !== data) {
                plainData = converted;
                visited.add(converted);
            }
        }
        catch {
            plainData = data;
        }
    }
    if (plainData && typeof plainData === 'object' && !Array.isArray(plainData)) {
        const obj = plainData;
        if ('password' in obj || 'currentPassword' in obj || 'newPassword' in obj) {
            const sanitized = (0, global_utils_1.formatRequestBody)(obj);
            return sanitized;
        }
    }
    visited.add(data);
    const sanitized = {};
    const obj = plainData;
    try {
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            const isSensitive = exports.SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()));
            if (isSensitive) {
                sanitized[key] = '[REDACTED]';
            }
            else if (value && typeof value === 'object') {
                if (Array.isArray(value)) {
                    sanitized[key] = value.map((item) => {
                        if (item && typeof item === 'object') {
                            return sanitizeData(item, visited, depth + 1);
                        }
                        return item;
                    });
                }
                else {
                    if (visited.has(value)) {
                        sanitized[key] = { '[CIRCULAR_REFERENCE]': true };
                    }
                    else {
                        sanitized[key] = sanitizeData(value, visited, depth + 1);
                    }
                }
            }
            else {
                sanitized[key] = value;
            }
        }
    }
    catch (error) {
        return { '[SANITIZATION_ERROR]': true };
    }
    return sanitized;
}
function extractIpAddress(headers, ip, remoteAddress) {
    const forwardedFor = headers['x-forwarded-for'];
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim();
    }
    return ip || remoteAddress;
}
async function normalizeRequestBodyForDedup(body, path) {
    if (!path.includes('/auth/') && !path.includes('/authenticate')) {
        return body;
    }
    if (!body || typeof body !== 'object') {
        return body;
    }
    const normalized = { ...body };
    const identifierFields = ['identifier', 'email', 'phone', 'username'];
    for (const field of identifierFields) {
        if (normalized[field] && typeof normalized[field] === 'string') {
            const value = normalized[field];
            if (!(0, helper_utils_1.isValidEmail)(value) && /^\+?[\d\s\-\(\)]+$/.test(value)) {
                try {
                    normalized[field] = (0, phone_utils_1.normalizePhoneNumber)(value);
                }
                catch {
                }
            }
        }
    }
    return normalized;
}
function extractResourceInfo(path) {
    const cleanPath = path.replace(/^\/v\d+\//, '');
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 0) {
        return { resource: 'Unknown' };
    }
    let resource = segments[segments.length - 1];
    resource =
        resource.charAt(0).toUpperCase() + resource.slice(1).replace(/s$/, '');
    const idPattern = /^[0-9a-f]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resourceId;
    for (let i = segments.length - 2; i >= 0; i--) {
        if (idPattern.test(segments[i])) {
            resourceId = segments[i];
            if (i > 0) {
                const resourceSegment = segments[i - 1];
                resource =
                    resourceSegment.charAt(0).toUpperCase() +
                        resourceSegment.slice(1).replace(/s$/, '');
            }
            break;
        }
    }
    return { resource, resourceId };
}
function determineAction(method, path) {
    const upperMethod = method.toUpperCase();
    if (path.includes('/auth/login') || path.includes('/auth/authenticate')) {
        return 'LOGIN';
    }
    if (path.includes('/auth/logout')) {
        return 'LOGOUT';
    }
    if (path.includes('/auth/forgot-password')) {
        return 'FORGOT_PASSWORD';
    }
    if (path.includes('/auth/reset-password')) {
        return 'RESET_PASSWORD';
    }
    switch (upperMethod) {
        case 'POST':
            return 'CREATE';
        case 'PUT':
        case 'PATCH':
            return 'UPDATE';
        case 'DELETE':
            return 'DELETE';
        case 'GET':
            return 'READ';
        default:
            return upperMethod;
    }
}
//# sourceMappingURL=audit.utils.js.map