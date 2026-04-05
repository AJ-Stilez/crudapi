import { Model } from 'mongoose';
import { Logger } from 'nestjs-pino';
import { AuditTrailDocument, CreateAuditTrailAttributes } from 'src/schema/class/audit-trail.schema.class';
import { CrudService } from 'src/services/core/crud.service';
export declare class AuditTrailService extends CrudService<AuditTrailDocument> {
    protected readonly logger: Logger;
    constructor(auditTrailModel: Model<AuditTrailDocument>, logger: Logger);
    createAuditEntryAsync(attributes: CreateAuditTrailAttributes): void;
}
