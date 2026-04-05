"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const nestjs_pino_1 = require("nestjs-pino");
const dayjs_1 = __importDefault(require("dayjs"));
const audit_utils_1 = require("../utils/audit.utils");
const audit_trail_schema_class_1 = require("../schema/class/audit-trail.schema.class");
const audit_trail_service_1 = require("../services/audit-trail.service");
let AuditTrailInterceptor = class AuditTrailInterceptor {
    auditTrailService;
    logger;
    constructor(auditTrailService, logger) {
        this.auditTrailService = auditTrailService;
        this.logger = logger;
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const method = request.method;
        const path = request.path;
        const ipAddress = (0, audit_utils_1.extractIpAddress)(request.headers, request.ip, request.socket.remoteAddress);
        const userAgent = request.headers['user-agent'];
        const user = request.user;
        const userId = user?.userId || user?.id || undefined;
        const { resource, resourceId } = (0, audit_utils_1.extractResourceInfo)(path);
        const action = (0, audit_utils_1.determineAction)(method, path);
        const requestData = (0, audit_utils_1.sanitizeData)({
            body: request.body,
            query: request.query,
            params: request.params,
        });
        const startTime = (0, dayjs_1.default)().valueOf();
        return next.handle().pipe((0, operators_1.tap)((responseData) => {
            const statusCode = response.statusCode || 200;
            const sanitizedResponse = (0, audit_utils_1.sanitizeData)(responseData);
            this.auditTrailService.createAuditEntryAsync({
                processType: audit_trail_schema_class_1.AuditTrailProcessType.INCOMING_REQUEST,
                userId,
                action,
                resource,
                resourceId: resourceId || request.params?.id || request.body?.id,
                method,
                path,
                ipAddress,
                userAgent,
                requestData,
                responseData: sanitizedResponse,
                statusCode,
                metadata: {
                    duration: (0, dayjs_1.default)().valueOf() - startTime,
                },
            });
        }), (0, operators_1.catchError)((error) => {
            const statusCode = error.status || error.statusCode || 500;
            const errorMessage = error.message || error.response?.message || 'Unknown error';
            this.auditTrailService.createAuditEntryAsync({
                processType: audit_trail_schema_class_1.AuditTrailProcessType.INCOMING_REQUEST,
                userId,
                action,
                resource,
                resourceId: resourceId || request.params?.id || request.body?.id,
                method,
                path,
                ipAddress,
                userAgent,
                requestData,
                statusCode,
                errorMessage,
                metadata: {
                    duration: (0, dayjs_1.default)().valueOf() - startTime,
                    errorType: error.constructor?.name || 'Error',
                },
            });
            throw error;
        }));
    }
};
exports.AuditTrailInterceptor = AuditTrailInterceptor;
exports.AuditTrailInterceptor = AuditTrailInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_trail_service_1.AuditTrailService,
        nestjs_pino_1.Logger])
], AuditTrailInterceptor);
//# sourceMappingURL=audit-trail.interceptor.js.map