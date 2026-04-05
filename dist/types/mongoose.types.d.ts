import { HydratedDocument, IndexOptions, Schema, SchemaOptions, Types } from 'mongoose';
import dayjs from 'dayjs';
export type MongoosePlugin<TSchema = unknown, TOptions = unknown> = (schema: Schema<TSchema>, options?: TOptions) => void;
export type PaginateType = {
    page: number;
    pageSize: number;
};
export interface AuditFieldOptions {
    createdByRef?: string;
    updatedByRef?: string;
    deletedByRef?: string;
}
export interface ExtendedSchemaOptions<T = unknown> extends SchemaOptions {
    loadClass?: boolean | (new () => T);
    plugins?: Array<MongoosePlugin<T> | [MongoosePlugin<T>, any]>;
    softDelete?: boolean;
    auditFields?: boolean;
    auditFieldOptions?: AuditFieldOptions;
    extendSchema?: (schema: Schema) => void;
    indexes?: Array<{
        fields: Record<string, any>;
        options?: IndexOptions;
    }>;
}
export interface BaseSchema {
    deletedAt?: ReturnType<typeof dayjs> | null;
    deletedById?: string;
    updatedById?: string;
    createdById?: string;
    createdAt?: ReturnType<typeof dayjs>;
    updatedAt?: ReturnType<typeof dayjs>;
}
export interface SoftDeleteDocument extends HydratedDocument<BaseSchema> {
    isSoftDeleted(): boolean;
}
export interface SoftDeleteStatics<T> {
    findActive(): Promise<T[]>;
    softDeleteById(id: string | Types.ObjectId, deletedById?: string): Promise<T | null>;
    restoreById(id: string | Types.ObjectId): Promise<T | null>;
}
