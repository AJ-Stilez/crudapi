import { Schema } from 'mongoose';
import { AuditTrail } from 'src/schema/class/audit-trail.schema.class';
export declare const AuditTrailSchemaModel: Schema<AuditTrail, import("mongoose").Model<AuditTrail, any, any, any, import("mongoose").Document<unknown, any, AuditTrail, any, {}> & AuditTrail & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditTrail, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<AuditTrail>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AuditTrail> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
