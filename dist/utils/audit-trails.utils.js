"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInternalProcess = logInternalProcess;
exports.logOutgoingRequest = logOutgoingRequest;
exports.trackProcess = trackProcess;
exports.createTracker = createTracker;
const audit_trail_schema_class_1 = require("../schema/class/audit-trail.schema.class");
const dayjs_1 = __importDefault(require("dayjs"));
const audit_utils_1 = require("./audit.utils");
function logInternalProcess(auditTrailService, options) {
    auditTrailService.createAuditEntryAsync({
        processType: audit_trail_schema_class_1.AuditTrailProcessType.INTERNAL_PROCESS,
        userId: options.userId,
        action: typeof options.action === 'string'
            ? options.action
            : String(options.action),
        resource: options.resource,
        resourceId: options.resourceId,
        requestData: (0, audit_utils_1.sanitizeData)(options.requestData),
        responseData: (0, audit_utils_1.sanitizeData)(options.responseData),
        statusCode: options.statusCode,
        errorMessage: options.errorMessage,
        metadata: options.metadata,
    });
}
function logOutgoingRequest(auditTrailService, options) {
    auditTrailService.createAuditEntryAsync({
        processType: audit_trail_schema_class_1.AuditTrailProcessType.OUTGOING_REQUEST,
        userId: options.userId,
        action: options.action,
        resource: options.resource,
        method: options.method,
        externalUrl: options.externalUrl,
        requestData: (0, audit_utils_1.sanitizeData)(options.requestData),
        responseData: (0, audit_utils_1.sanitizeData)(options.responseData),
        statusCode: options.statusCode,
        errorMessage: options.errorMessage,
        metadata: options.metadata,
    });
}
async function trackProcess(auditTrailService, options, fn, ...args) {
    const startTime = (0, dayjs_1.default)().valueOf();
    const startMemory = options.trackMemory ? process.memoryUsage() : undefined;
    const startCpu = options.trackCpu ? process.cpuUsage() : undefined;
    const extractedResourceId = options.resourceId ||
        (options.resourceIdExtractor
            ? options.resourceIdExtractor(...args)
            : undefined);
    const extractedUserId = options.userId ||
        (options.userIdExtractor ? options.userIdExtractor(...args) : undefined);
    let requestData = options.requestDataTransformer
        ? options.requestDataTransformer(...args)
        : args.length > 0
            ? args.length === 1
                ? args[0]
                : { arguments: args }
            : undefined;
    if (options.maxRequestSize && requestData) {
        const requestString = JSON.stringify(requestData);
        if (requestString.length > options.maxRequestSize) {
            requestData = {
                _truncated: true,
                _originalSize: requestString.length,
                _data: requestString.substring(0, options.maxRequestSize),
            };
        }
    }
    let responseData;
    let errorMessage;
    let statusCode;
    let errorStack;
    try {
        const result = await fn(...args);
        const endTime = (0, dayjs_1.default)().valueOf();
        const duration = endTime - startTime;
        let transformedResult = options.responseDataTransformer
            ? options.responseDataTransformer(result)
            : result;
        if (options.maxResponseSize && transformedResult) {
            const resultString = JSON.stringify(transformedResult);
            if (resultString.length > options.maxResponseSize) {
                transformedResult = {
                    _truncated: true,
                    _originalSize: resultString.length,
                    _data: resultString.substring(0, options.maxResponseSize),
                };
            }
        }
        responseData =
            options.includeFullResponse !== false
                ? transformedResult
                : { _logged: true };
        statusCode = 200;
        const metadata = {
            ...options.metadata,
            duration,
        };
        if (options.correlationId) {
            metadata.correlationId = options.correlationId;
        }
        if (options.retryAttempt !== undefined) {
            metadata.retryAttempt = options.retryAttempt;
        }
        if (options.isAsync !== undefined) {
            metadata.isAsync = options.isAsync;
        }
        if (options.trackMemory && startMemory) {
            const endMemory = process.memoryUsage();
            metadata.memoryUsage = {
                rss: endMemory.rss - startMemory.rss,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                external: endMemory.external - startMemory.external,
                arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
            };
        }
        if (options.trackCpu && startCpu) {
            const endCpu = process.cpuUsage();
            metadata.cpuUsage = {
                user: endCpu.user - startCpu.user,
                system: endCpu.system - startCpu.system,
            };
        }
        if (options.trackDataSize) {
            const requestSize = requestData ? JSON.stringify(requestData).length : 0;
            const responseSize = responseData
                ? JSON.stringify(responseData).length
                : 0;
            metadata.dataSize = {
                requestBytes: requestSize,
                responseBytes: responseSize,
                totalBytes: requestSize + responseSize,
            };
        }
        logInternalProcess(auditTrailService, {
            userId: extractedUserId,
            action: options.action,
            resource: options.resource,
            resourceId: extractedResourceId,
            requestData: (0, audit_utils_1.sanitizeData)(requestData),
            responseData: (0, audit_utils_1.sanitizeData)(responseData),
            statusCode,
            metadata,
        });
        return result;
    }
    catch (error) {
        const endTime = (0, dayjs_1.default)().valueOf();
        const duration = endTime - startTime;
        if (error instanceof Error) {
            errorMessage = error.message;
            errorStack = error.stack;
        }
        else {
            errorMessage = String(error);
        }
        if (error && typeof error === 'object') {
            const errorObj = error;
            statusCode =
                errorObj.statusCode || errorObj.status || errorObj.code || 500;
        }
        else {
            statusCode = 500;
        }
        let errorResponseData = undefined;
        if (options.responseDataTransformer && error) {
            try {
                errorResponseData = options.responseDataTransformer(error);
            }
            catch {
            }
        }
        const metadata = {
            ...options.metadata,
            duration,
            errorStack,
        };
        if (options.correlationId) {
            metadata.correlationId = options.correlationId;
        }
        if (options.retryAttempt !== undefined) {
            metadata.retryAttempt = options.retryAttempt;
        }
        if (options.isAsync !== undefined) {
            metadata.isAsync = options.isAsync;
        }
        if (error instanceof Error) {
            metadata.errorType = error.constructor?.name || 'Error';
        }
        if (options.trackMemory && startMemory) {
            const endMemory = process.memoryUsage();
            metadata.memoryUsage = {
                rss: endMemory.rss - startMemory.rss,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                external: endMemory.external - startMemory.external,
                arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
            };
        }
        if (options.trackCpu && startCpu) {
            const endCpu = process.cpuUsage();
            metadata.cpuUsage = {
                user: endCpu.user - startCpu.user,
                system: endCpu.system - startCpu.system,
            };
        }
        if (options.trackDataSize) {
            const requestSize = requestData ? JSON.stringify(requestData).length : 0;
            const responseSize = errorResponseData
                ? JSON.stringify(errorResponseData).length
                : 0;
            metadata.dataSize = {
                requestBytes: requestSize,
                responseBytes: responseSize,
                totalBytes: requestSize + responseSize,
            };
        }
        logInternalProcess(auditTrailService, {
            userId: extractedUserId,
            action: options.action,
            resource: options.resource,
            resourceId: extractedResourceId,
            requestData: (0, audit_utils_1.sanitizeData)(requestData),
            responseData: errorResponseData
                ? (0, audit_utils_1.sanitizeData)(errorResponseData)
                : undefined,
            statusCode,
            errorMessage,
            metadata,
        });
        throw error;
    }
}
function createTracker(auditTrailService, action, resource, defaults) {
    return async (fn, overrides) => {
        const resourceIdExtractor = overrides?.resourceIdExtractor ||
            defaults?.resourceIdExtractor ||
            ((result) => {
                if (result && typeof result === 'object' && 'id' in result) {
                    const id = result.id;
                    return typeof id === 'string' ? id : String(id);
                }
                return undefined;
            });
        return trackProcess(auditTrailService, {
            action,
            resource,
            ...defaults,
            ...overrides,
            resourceIdExtractor,
        }, fn, ...[]);
    };
}
//# sourceMappingURL=audit-trails.utils.js.map