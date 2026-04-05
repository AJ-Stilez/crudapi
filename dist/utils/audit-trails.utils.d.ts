import { AuditTrailService } from 'src/services/audit-trail.service';
import { AuditAction } from 'src/enums/audit-actions.enums';
export declare function logInternalProcess(auditTrailService: AuditTrailService, options: {
    userId?: string;
    action: string | AuditAction;
    resource: string;
    resourceId?: string;
    requestData?: unknown;
    responseData?: unknown;
    statusCode?: number;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
}): void;
export declare function logOutgoingRequest(auditTrailService: AuditTrailService, options: {
    userId?: string;
    action: string | AuditAction;
    resource: string;
    method: string;
    externalUrl: string;
    requestData?: unknown;
    responseData?: unknown;
    statusCode?: number;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
}): void;
export interface TrackProcessOptions {
    userId?: string;
    action: string | AuditAction;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    resourceIdExtractor?: (...args: unknown[]) => string | undefined;
    userIdExtractor?: (...args: unknown[]) => string | undefined;
    requestDataTransformer?: (...args: unknown[]) => unknown;
    responseDataTransformer?: (result: unknown) => unknown;
    includeFullResponse?: boolean;
    maxResponseSize?: number;
    maxRequestSize?: number;
    trackMemory?: boolean;
    trackCpu?: boolean;
    trackDataSize?: boolean;
    correlationId?: string;
    retryAttempt?: number;
    isAsync?: boolean;
}
export declare function trackProcess<T extends (...args: unknown[]) => Promise<unknown>>(auditTrailService: AuditTrailService, options: TrackProcessOptions, fn: T, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>;
export declare function createTracker(auditTrailService: AuditTrailService, action: AuditAction | string, resource: string, defaults?: Partial<TrackProcessOptions>): <T extends () => Promise<unknown>>(fn: T, overrides?: Partial<TrackProcessOptions>) => Promise<Awaited<ReturnType<T>>>;
