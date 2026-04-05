import { Document } from 'mongoose';
import dayjs from 'dayjs';

/**
 * Process types for audit trail entries
 */
export enum AuditTrailProcessType {
  /** Incoming HTTP request to our API */
  INCOMING_REQUEST = 'INCOMING_REQUEST',
  /** Outgoing HTTP request to external API */
  OUTGOING_REQUEST = 'OUTGOING_REQUEST',
  /** Internal process (service call, background job, etc.) */
  INTERNAL_PROCESS = 'INTERNAL_PROCESS',
}

/**
 *
 * Represents an audit log entry for tracking system actions and user activities.
 */
export class NonDocumentAuditTrail {
  /** Type of process being tracked */
  processType: AuditTrailProcessType;
  /** User ID who performed the action (null for unauthenticated requests) */
  userId?: string;
  /** Type of action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', etc.) */
  action: string;
  /** Resource type that was acted upon (e.g., 'User', 'Estate', 'Payment', etc.) */
  resource: string;
  /** ID of the resource that was acted upon */
  resourceId?: string;
  /** HTTP method used (GET, POST, PUT, DELETE, etc.) - only for HTTP requests */
  method?: string;
  /** Request path/endpoint - only for HTTP requests */
  path?: string;
  /** External API URL - only for outgoing requests */
  externalUrl?: string;
  /** IP address of the requester */
  ipAddress?: string;
  /** User agent string from the request */
  userAgent?: string;
  /** Request body data (sanitized, no sensitive info) */
  requestData?: Record<string, unknown>;
  /** Response data (sanitized, no sensitive info) */
  responseData?: Record<string, unknown>;
  /** HTTP status code of the response */
  statusCode?: number;
  /** Error message if the request failed */
  errorMessage?: string;
  /** Additional metadata about the action */
  metadata?: Record<string, unknown>;
  /** Timestamp when the action occurred */
  createdAt?: ReturnType<typeof dayjs> | string;
  /** Timestamp when the record was last updated */
  updatedAt?: ReturnType<typeof dayjs> | string;
}

export interface AuditTrail extends Readonly<NonDocumentAuditTrail>, Document {}

export class AuditTrailSchemaClass extends NonDocumentAuditTrail {
  readonly id: string;
}

export type AuditTrailDocument = AuditTrail & AuditTrailSchemaClass;

export type CreateAuditTrailAttributes = NonDocumentAuditTrail & {
  id?: string;
  _id?: string;
};
