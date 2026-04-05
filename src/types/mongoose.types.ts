import {
  HydratedDocument,
  IndexOptions,
  Schema,
  SchemaOptions,
  Types,
} from 'mongoose';
import dayjs from 'dayjs';

/**
 * A reusable Mongoose plugin type that accepts a schema and optional options.
 *
 * This type defines the shape of Mongoose plugin functions, which are used to
 * extend or modify schema behavior globally or contextually.
 *
 * @template TSchema - Schema type the plugin applies to
 * @template TOptions - Optional plugin configuration options
 *
 * @example
 * const timestampPlugin: MongoosePlugin = (schema) => {
 *   schema.add({ addedAt: { type: Date, default: Date.now } });
 * };
 *
 * schema.plugin(timestampPlugin);
 */
export type MongoosePlugin<TSchema = unknown, TOptions = unknown> = (
  schema: Schema<TSchema>,
  options?: TOptions,
) => void;

/**
 * Standard structure for pagination parameters.
 *
 * @property page - The current page number (1-based)
 * @property pageSize - The number of items per page
 *
 * @example
 * const query: PaginateType = { page: 1, pageSize: 20 };
 */
export type PaginateType = {
  page: number;
  pageSize: number;
};

/**
 * Customizable references for audit tracking fields.
 *
 * Useful when you want to define which model the `createdById`, `updatedById`,
 * and `deletedById` fields should reference.
 *
 * @property createdByRef - Reference model for createdById
 * @property updatedByRef - Reference model for updatedById
 * @property deletedByRef - Reference model for deletedById
 *
 * @example
 * const options: AuditFieldOptions = {
 *   createdByRef: 'AdminUser',
 *   updatedByRef: 'AdminUser',
 *   deletedByRef: 'AdminUser',
 * };
 */
export interface AuditFieldOptions {
  createdByRef?: string;
  updatedByRef?: string;
  deletedByRef?: string;
}

/**
 * Extended schema configuration for enhanced schema creation.
 *
 * Adds support for plugins, soft deletes, audit tracking, and class loading.
 *
 * @template T - The type associated with schema instance methods or statics
 *
 * @property loadClass - Optional ES6 class to attach as methods/statics
 * @property plugins - List of Mongoose plugins or plugin/option tuples
 * @property softDelete - Enables soft-delete capabilities
 * @property auditFields - Enables audit tracking fields
 * @property auditFieldOptions - Custom references for audit fields
 * @property extendSchema - Custom schema extension logic
 */
export interface ExtendedSchemaOptions<T = unknown> extends SchemaOptions {
  loadClass?: boolean | (new () => T);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: Array<MongoosePlugin<T> | [MongoosePlugin<T>, any]>;
  softDelete?: boolean;
  auditFields?: boolean;
  auditFieldOptions?: AuditFieldOptions;
  extendSchema?: (schema: Schema) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  indexes?: Array<{ fields: Record<string, any>; options?: IndexOptions }>;
}

/**
 * Common fields used for audit tracking and soft deletes.
 *
 * Interfaces with documents that need tracking metadata.
 *
 * @property deletedAt - When the document was soft deleted (if applicable)
 * @property deletedById - Who deleted the document
 * @property updatedById - Who last updated the document
 * @property createdById - Who created the document
 * @property createdAt - When the document was created
 * @property updatedAt - When the document was last updated
 */
export interface BaseSchema {
  deletedAt?: ReturnType<typeof dayjs> | null;
  deletedById?: string;
  updatedById?: string;
  createdById?: string;
  createdAt?: ReturnType<typeof dayjs>;
  updatedAt?: ReturnType<typeof dayjs>;
}

/**
 * Extends a hydrated document with a soft delete checker.
 *
 * Used to determine whether the document has been logically deleted.
 *
 * @method isSoftDeleted - Returns true if deletedAt is set
 *
 * @example
 * const doc = await Model.findById(id);
 * if (doc?.isSoftDeleted()) {
 *   console.log('Document is deleted');
 * }
 */
export interface SoftDeleteDocument extends HydratedDocument<BaseSchema> {
  isSoftDeleted(): boolean;
}

/**
 * Static model methods to support soft-delete logic.
 *
 * These methods are attached to the model to handle filtering, deletion, and restoration.
 *
 * @template T - Model interface type
 *
 * @method findActive - Fetch all non-deleted documents
 * @method softDeleteById - Marks a document as deleted
 * @method restoreById - Reverts the soft-deletion
 *
 * @example
 * const activeDocs = await Model.findActive();
 *
 * await Model.softDeleteById(id, userId);
 *
 * await Model.restoreById(id);
 */
export interface SoftDeleteStatics<T> {
  findActive(): Promise<T[]>;
  softDeleteById(
    id: string | Types.ObjectId,
    deletedById?: string,
  ): Promise<T | null>;
  restoreById(id: string | Types.ObjectId): Promise<T | null>;
}
