/**
 *  __  __                       _
 * |  \/  |                     (_)
 * | \  / | ___  _ __   __ _  ___ _ __   __ _  ___
 * | |\/| |/ _ \| '_ \ / _` |/ __| '_ \ / _` |/ _ \
 * | |  | | (_) | | | | (_| | (__| | | | (_| |  __/
 * |_|  |_|\___/|_| |_|\__, |\___|_| |_|\__, |\___|
 *                      __/ |            __/ |
 *                     |___/            |___/
 *
 * Mongoose Utilities - The Database Dynamos
 *
 * @module MongooseUtils
 * @internal
 *
 * 🗄️ These utilities are like the librarians of your app -
 *    they organize and find your data with lightning speed! ⚡
 */
import { Types, FilterQuery, Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { handleAndThrowError } from 'src/utils/error.utils';
import { Logger } from 'nestjs-pino';
import dayjs from 'dayjs';

export interface PaginateData {
  page?: number;
  pageSize?: number;
  skip?: number;
  totalPages?: number;
  totalRecords?: number;
}

// type FilterValue = string | number | boolean | (string | number | boolean)[];
// type MongoOperator =
//   | { $eq?: FilterValue }
//   | { $ne?: FilterValue }
//   | { $in?: FilterValue[] }
//   | { $nin?: FilterValue[] }
//   | { $gte?: FilterValue }
//   | { $gt?: FilterValue }
//   | { $lte?: FilterValue }
//   | { $lt?: FilterValue }
//   | { $exists?: boolean }
//   | { $regex?: string }
//   | { $not?: any };

// type FlexibleFilter = FilterValue | MongoOperator;

export type FilterValue =
  | string
  | number
  | boolean
  | ReturnType<typeof dayjs>
  | RegExp
  | null
  | (string | number | boolean)[];

export type MongoOperator = {
  $eq?: FilterValue;
  $ne?: FilterValue;
  $in?: FilterValue[];
  $nin?: FilterValue[];
  $gte?: FilterValue;
  $gt?: FilterValue;
  $lte?: FilterValue;
  $lt?: FilterValue;
  $exists?: boolean;
  $regex?: string | RegExp;
  $not?: MongoOperator;
};

export type LogicalOperators = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $or?: Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $and?: Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $nor?: Record<string, any>[];
};

type FieldFilterMap<T> = {
  [K in keyof T]?: FilterValue | MongoOperator;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BuildValidatedFilterOptions<TSchema = unknown> {
  ids?: string[];
  filters?: FieldFilterMap<TSchema> & LogicalOperators;
  isValidatedList?: boolean;
  findExistingFn: (filter: unknown) => Promise<unknown[]>;
  entityName?: string;
  logger?: Logger | null;

  /**
   * @deprecated Use `filters` instead.
   */
  organizationId?: string;
  /**
   * @deprecated Use `filters` instead.
   */
  projectIds?: string | string[];
  /**
   * @deprecated Use `filters` instead.
   */
  organizationFieldName?: string;
  /**
   * @deprecated Use `filters` instead.
   */
  projectFieldName?: string;
}

interface ExecuteDeleteOptions {
  softDelete?: boolean;
  hasIds: boolean;
  objectIds: Types.ObjectId[];
  filter: Record<string, unknown>;
  deleteFn: (filter: Record<string, unknown>) => Promise<unknown>;
  updateFn: (
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
  ) => Promise<unknown>;
  entityName: string;
  idsLabel?: string;
  logger?: Logger | null;
}

export interface CreateDeleteOptions {
  deleteIds?: string[];
  softDelete?: boolean;
  isValidatedList?: boolean;
}

export const calculatePaginate = (
  query: Partial<PaginateData>,
): PaginateData => {
  // Set defaults first
  query.page = query.page ?? 1;
  query.pageSize = query.pageSize ?? 20;

  // Ensure page is at least 1 to avoid negative skip values
  query.page = Math.max(1, query.page);

  // Calculate skip after ensuring page is valid
  query.skip = Math.max(0, (query.page - 1) * query.pageSize);

  return query;
};

export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export function validateObjectIds(ids: string[]): void {
  if (!ids || ids.length === 0) {
    return handleAndThrowError(
      new HttpException('No valid IDs provided.', HttpStatus.BAD_REQUEST),
      null,
      'No valid IDs provided.',
    );
  }

  for (const id of ids) {
    if (!isValidObjectId(id)) {
      return handleAndThrowError(
        new HttpException(
          `Invalid ObjectId format: ${id}`,
          HttpStatus.BAD_REQUEST,
        ),
        null,
        `Invalid ObjectId format: ${id}`,
      );
    }
  }
}

export function validateAndTransformObjectIds(
  ids: string[],
  fieldName = 'ids',
): Types.ObjectId[] {
  if (!ids || ids.length === 0) {
    return handleAndThrowError(
      new HttpException(`No ${fieldName} provided.`, HttpStatus.BAD_REQUEST),
      null,
      `No ${fieldName} provided.`,
    );
  }

  const objectIds: Types.ObjectId[] = [];
  for (const id of ids) {
    if (!isValidObjectId(id)) {
      return handleAndThrowError(
        new HttpException(
          `Invalid ObjectId format in ${fieldName}: ${id}`,
          HttpStatus.BAD_REQUEST,
        ),
        null,
        `Invalid ObjectId format in ${fieldName}: ${id}`,
      );
    }
    objectIds.push(new Types.ObjectId(id));
  }

  return objectIds;
}

export function validatePaginationParams(
  page: number,
  pageSize: number,
  maxPageSize = 100,
): void {
  if (page < 1) {
    return handleAndThrowError(
      new HttpException(
        'Page number must be greater than 0.',
        HttpStatus.BAD_REQUEST,
      ),
      null,
      'Page number must be greater than 0.',
    );
  }

  if (pageSize < 1 || pageSize > maxPageSize) {
    return handleAndThrowError(
      new HttpException(
        `Page size must be between 1 and ${maxPageSize}.`,
        HttpStatus.BAD_REQUEST,
      ),
      null,
      `Page size must be between 1 and ${maxPageSize}.`,
    );
  }
}

export function validateSortParams(
  sortField: string,
  allowedFields: string[],
): void {
  if (!allowedFields.includes(sortField)) {
    return handleAndThrowError(
      new HttpException(
        `Invalid sort field: ${sortField}. Allowed fields: ${allowedFields.join(
          ', ',
        )}`,
        HttpStatus.BAD_REQUEST,
      ),
      null,
      `Invalid sort field: ${sortField}. Allowed fields: ${allowedFields.join(
        ', ',
      )}`,
    );
  }
}

/**
 * Builds a validated MongoDB filter with optional checks for organization, project, and ID existence.
 *
 * @remarks
 * - If `ids` are provided and `isValidatedList` is false, the function will validate their existence
 *   using `findExistingFn`.
 * - Useful for building query filters in bulk delete/update operations.
 *
 * @param options - Options used to construct the MongoDB filter.
 * @param options.ids - Array of string or ObjectId values to match against `_id` field.
 * @param options.organizationId - Optional organization ID to filter by.
 * @param options.projectIds - Optional single or multiple project IDs to filter by.
 * @param options.organizationFieldName - Name of the organization field in the DB (defaults to `'organization'`).
 * @param options.projectFieldName - Name of the project field in the DB (defaults to `'project'`).
 * @param options.isValidatedList - If `true`, skips validation of IDs against the DB.
 * @param options.findExistingFn - Function that queries the DB to find matching documents.
 * @param options.entityName - Name of the entity, used in error messages (defaults to `'Items'`).
 *
 * @returns An object containing:
 * - `filter`: A MongoDB query object.
 * - `objectIds`: The validated list of ObjectIds.
 * - `hasIds`: Whether any IDs were provided.
 *
 * @throws {@link HttpException} Throws if validation fails and some IDs are missing or don't match the filter.
 */
export async function buildValidatedMongoFilterV1({
  ids = [],
  isValidatedList = false,
  findExistingFn,
  entityName = 'Items',
  filters = {},
  organizationId,
  projectIds,
  organizationFieldName = 'organization',
  projectFieldName = 'project',
}: BuildValidatedFilterOptions): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: Record<string, any>;
  objectIds: Types.ObjectId[];
  hasIds: boolean;
}> {
  const objectIds = validateAndTransformObjectIds(ids);
  const hasIds = objectIds.length > 0;

  const fullFilters = { ...filters };

  // Backward compatibility
  if (organizationId && !filters[organizationFieldName]) {
    fullFilters[organizationFieldName] = organizationId;
  }

  if (projectIds && !filters[projectFieldName]) {
    fullFilters[projectFieldName] = Array.isArray(projectIds)
      ? { $in: projectIds }
      : projectIds;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { ...fullFilters };

  if (hasIds) {
    filter._id = { $in: objectIds };

    if (!isValidatedList) {
      const existingItems = await findExistingFn(filter);
      if (existingItems.length !== objectIds.length) {
        return handleAndThrowError(
          new HttpException(
            `Some ${entityName.toLowerCase()} were not found or do not match the provided filters.`,
            HttpStatus.BAD_REQUEST,
          ),
          null,
          `Some ${entityName.toLowerCase()} were not found or do not match the provided filters.`,
        );
      }
    }
  }

  return { filter, objectIds, hasIds };
}

/**
 * Builds a validated MongoDB filter with optional checks for specific field values and ID existence.
 *
 * @remarks
 * - `filters` is fully flexible and supports both direct value matching and MongoDB operators (e.g. `$in`, `$gte`).
 * - You can pass logical operators like `$or`, `$and`, and `$nor` directly in the `filters` object.
 * - If `ids` are provided and `isValidatedList` is false, the function will validate their existence using `findExistingFn`.
 * - Useful for bulk operations (delete/update) that need strict ID and field validation.
 * - Fully generic with type-safe support for fields via `TSchema`.
 *
 * @example
 * ```ts
 * const result = await buildValidatedMongoFilter({
 *   ids: ['...'],
 *   filters: {
 *     organization: 'org123',
 *     status: { $in: ['active', 'pending'] },
 *     createdAt: { $gte: new Date('2024-01-01') },
 *     $or: [
 *       { type: 'A' },
 *       { type: 'B' }
 *     ]
 *   },
 *   findExistingFn: (filter) => db.collection.find(filter).toArray(),
 *   entityName: 'Records',
 * });
 * ```
 *
 *
 * -----------------------------------
 * -----------------------------------
 *
 * @example
 * ```ts
 * await buildValidatedMongoFilter({
 *   filters: {
 *     'address.city': 'New York',
 *     'address.zipcode': { $gte: '10000' },
 *   },
 *   findExistingFn: (filter) => UserModel.find(filter),
 *   entityName: 'User',
 * });
 * ```
 *
 * -----------------------------------
 * -----------------------------------
 *
 * @example
 * ```ts
 * await buildValidatedMongoFilter({
 *   filters: {
 *     [`customField.${userInput}`]: { $eq: 'value' },
 *   },
 *   findExistingFn: (filter) => CustomModel.find(filter),
 *   entityName: 'Custom',
 * });
 * ```
 *
 * @param options - Options used to construct the MongoDB filter.
 * @param options.ids - Array of string values to match against the `_id` field.
 * @param options.filters - Optional additional filters as field-value pairs and/or MongoDB query operators.
 * @param options.isValidatedList - If `true`, skips validation of IDs against the DB.
 * @param options.findExistingFn - Function that queries the DB to find matching documents.
 * @param options.entityName - Optional name of the entity, used in error messages (defaults to `'Items'`).
 *
 * @returns An object containing:
 * - `filter`: A MongoDB query object.
 * @param options.isValidatedList - If `true`, skips validation of IDs against the DB.
 * - `hasIds`: Whether any IDs were provided.
 *
 * @throws {@link HttpException} Throws if validation fails and some IDs are missing or don't match the filter.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildValidatedMongoFilter<TSchema = unknown>({
  ids = [],
  filters = {},
  isValidatedList = false,
  findExistingFn,
  entityName = 'Items',
}: BuildValidatedFilterOptions<TSchema>): Promise<{
  filter: Record<string, unknown>;
  objectIds: Types.ObjectId[];
  hasIds: boolean;
}> {
  const objectIds = validateAndTransformObjectIds(ids);
  const hasIds = objectIds.length > 0;

  const filter: Record<string, unknown> = { ...filters };

  if (hasIds) {
    filter._id = { $in: objectIds };
    if (!isValidatedList) {
      const existingItems = await findExistingFn(filter);
      if (existingItems.length !== objectIds.length) {
        return handleAndThrowError(
          new HttpException(
            `Some ${entityName.toLowerCase()} were not found or do not match the specified filters.`,
            HttpStatus.BAD_REQUEST,
          ),
          null,
          `Some ${entityName.toLowerCase()} were not found or do not match the specified filters.`,
        );
      }
    }
  }

  return { filter, objectIds, hasIds };
}

/**
 * Executes either a soft delete (setting `deletedAt`) or a hard delete based on provided options.
 *
 * @remarks
 * - If `softDelete` is true, it will use `updateFn` to set a `deletedAt` timestamp.
 * - If false, it will use `deleteFn` to permanently delete the records.
 * - If `hasIds` is true and the number of affected records does not match the number of IDs, it throws an error.
 *
 * @param options - Options for deletion or soft deletion.
 * @param options.softDelete - Whether to perform a soft delete (default: `true`).
 * @param options.hasIds - Whether specific IDs are being targeted.
 * @param options.objectIds - List of ObjectIds to process.
 * @param options.filter - MongoDB filter used to select documents.
 * @param options.deleteFn - MongoDB deletion function (e.g., `Model.deleteMany`).
 * @param options.updateFn - MongoDB update function (e.g., `Model.updateMany`).
 * @param options.entityName - Entity name used in success/error messages.
 * @param options.idsLabel - Optional key used in the return object for the list of IDs (default: `'ids'`).
 *
 * @returns A message describing the result and an array of affected IDs under the provided `idsLabel`.
 *
 * @throws {@link HttpException} If some entities could not be updated or deleted.
 */
export async function executeDeleteOrSoftDelete({
  softDelete = true,
  hasIds,
  objectIds,
  filter,
  deleteFn,
  updateFn,
  entityName,
  idsLabel = 'ids',
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
ExecuteDeleteOptions): Promise<{ message: string; [key: string]: any }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  if (softDelete) {
    result = await updateFn(filter, {
      $set: { deletedAt: dayjs().toDate() },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (hasIds && (result as any).modifiedCount !== objectIds.length) {
      return handleAndThrowError(
        new HttpException(
          `Failed to soft delete some ${entityName.toLowerCase()}. Only ${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result as any).modifiedCount
          } of ${objectIds.length} were updated.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        null,
        `Failed to soft delete some ${entityName.toLowerCase()}. Only ${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result as any).modifiedCount
        } of ${objectIds.length} were updated.`,
      );
    }
  } else {
    result = await deleteFn(filter);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (hasIds && (result as any).deletedCount !== objectIds.length) {
      return handleAndThrowError(
        new HttpException(
          `Failed to delete some ${entityName.toLowerCase()}. Only ${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result as any).deletedCount
          } of ${objectIds.length} were removed.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        null,
        `Failed to delete some ${entityName.toLowerCase()}. Only ${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result as any).deletedCount
        } of ${objectIds.length} were removed.`,
      );
    }
  }

  const count =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result as any).modifiedCount ?? (result as any).deletedCount ?? 0;
  return {
    message: `${count} ${entityName.toLowerCase()}(s) successfully ${
      softDelete ? 'soft deleted' : 'deleted'
    }.`,
    [idsLabel]: objectIds.map((id) => id.toString()),
  };
}

/**
 * Example usage:
 * ```typescript
 * const query = buildDateRangeQuery('createdAt', {
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * });
 *
 * const users = await UserModel.find({
 *   ...query,
 *   estateId: 'estate123'
 * });
 * ```
 */
export function buildDateRangeQuery(
  fieldName: string,
  dateRange: { startDate?: string; endDate?: string },
): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (dateRange.startDate) {
    query[fieldName] = { $gte: dayjs(dateRange.startDate).toDate() };
  }

  if (dateRange.endDate) {
    if (query[fieldName]) {
      (query[fieldName] as Record<string, unknown>).$lte = dayjs(
        dateRange.endDate,
      ).toDate();
    } else {
      query[fieldName] = { $lte: dayjs(dateRange.endDate).toDate() };
    }
  }

  return query;
}

/**
 * Soft delete a document by setting deletedAt field
 *
 * @param model - Mongoose model
 * @param filter - Filter criteria
 * @param deletedById - ID of user performing the deletion
 * @returns Promise resolving to the soft deleted document
 *
 * @example
 * ```typescript
 * const deletedUser = await softDelete(UserModel, { _id: 'user123' }, 'admin456');
 * ```
 */
export async function softDelete<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  deletedById?: string,
): Promise<T | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: any = { deletedAt: dayjs().toDate() };

  if (deletedById) {
    update.deletedById = deletedById;
  }

  return model.findOneAndUpdate(
    filter,
    { $set: update },
    { new: true, runValidators: true },
  );
}
