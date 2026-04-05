/**
 *
 * Service for creating and managing audit trail entries.
 * Provides methods to log system actions and user activities.
 *
 * @module AuditTrailService
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'nestjs-pino';
import {
  AuditTrail,
  AuditTrailDocument,
  CreateAuditTrailAttributes,
} from 'src/schema/class/audit-trail.schema.class';
import { CrudService } from 'src/services/core/crud.service';

@Injectable()
export class AuditTrailService extends CrudService<
  AuditTrailDocument
  > {
  constructor(
    @InjectModel('AuditTrail')
    auditTrailModel: Model<AuditTrailDocument>,
    protected readonly logger: Logger,
  ) {
    super(auditTrailModel);
  }

  /**
   * Creates an audit trail entry asynchronously (fire and forget)
   * Useful for non-critical audit logging that shouldn't block the request
   * Errors are logged but don't break the application flow
   *
   * @param attributes - Audit trail data to log
   *
   * @example
   * ```typescript
   * this.auditTrailService.createAuditEntryAsync({
   *   userId: '123',
   *   action: 'READ',
   *   resource: 'User',
   *   method: 'GET',
   *   path: '/v1/users',
   * });
   * ```
   */
  createAuditEntryAsync(attributes: CreateAuditTrailAttributes): void {
    // Fire and forget - don't await
    this.create(attributes).catch((error) => {
      this.logger.error('Failed to create async audit trail entry', {
        error: error instanceof Error ? error.message : 'Unknown error',
        attributes,
      });
    });
  }
}
