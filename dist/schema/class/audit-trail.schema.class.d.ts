import { Document } from 'mongoose';
import dayjs from 'dayjs';
export declare enum AuditTrailProcessType {
    INCOMING_REQUEST = "INCOMING_REQUEST",
    OUTGOING_REQUEST = "OUTGOING_REQUEST",
    INTERNAL_PROCESS = "INTERNAL_PROCESS"
}
export declare class NonDocumentAuditTrail {
    processType: AuditTrailProcessType;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    method?: string;
    path?: string;
    externalUrl?: string;
    ipAddress?: string;
    userAgent?: string;
    requestData?: Record<string, unknown>;
    responseData?: Record<string, unknown>;
    statusCode?: number;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
    createdAt?: ReturnType<typeof dayjs> | string;
    updatedAt?: ReturnType<typeof dayjs> | string;
}
export interface AuditTrail extends Readonly<NonDocumentAuditTrail>, Document {
}
export declare class AuditTrailSchemaClass extends NonDocumentAuditTrail {
    readonly id: string;
}
export type AuditTrailDocument = AuditTrail & AuditTrailSchemaClass;
export type CreateAuditTrailAttributes = NonDocumentAuditTrail & {
    id?: string;
    _id?: string;
};
