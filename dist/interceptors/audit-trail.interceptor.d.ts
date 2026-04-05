import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Logger } from 'nestjs-pino';
import { AuditTrailService } from 'src/services/audit-trail.service';
export declare class AuditTrailInterceptor implements NestInterceptor {
    private readonly auditTrailService;
    private readonly logger;
    constructor(auditTrailService: AuditTrailService, logger: Logger);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
