import { Types, FilterQuery, Model } from 'mongoose';
import { Logger } from 'nestjs-pino';
import dayjs from 'dayjs';
export interface PaginateData {
    page?: number;
    pageSize?: number;
    skip?: number;
    totalPages?: number;
    totalRecords?: number;
}
export type FilterValue = string | number | boolean | ReturnType<typeof dayjs> | RegExp | null | (string | number | boolean)[];
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
    $or?: Record<string, any>[];
    $and?: Record<string, any>[];
    $nor?: Record<string, any>[];
};
type FieldFilterMap<T> = {
    [K in keyof T]?: FilterValue | MongoOperator;
};
export interface BuildValidatedFilterOptions<TSchema = unknown> {
    ids?: string[];
    filters?: FieldFilterMap<TSchema> & LogicalOperators;
    isValidatedList?: boolean;
    findExistingFn: (filter: unknown) => Promise<unknown[]>;
    entityName?: string;
    logger?: Logger | null;
    organizationId?: string;
    projectIds?: string | string[];
    organizationFieldName?: string;
    projectFieldName?: string;
}
interface ExecuteDeleteOptions {
    softDelete?: boolean;
    hasIds: boolean;
    objectIds: Types.ObjectId[];
    filter: Record<string, unknown>;
    deleteFn: (filter: Record<string, unknown>) => Promise<unknown>;
    updateFn: (filter: Record<string, unknown>, update: Record<string, unknown>) => Promise<unknown>;
    entityName: string;
    idsLabel?: string;
    logger?: Logger | null;
}
export interface CreateDeleteOptions {
    deleteIds?: string[];
    softDelete?: boolean;
    isValidatedList?: boolean;
}
export declare const calculatePaginate: (query: Partial<PaginateData>) => PaginateData;
export declare const isValidObjectId: (id: string) => boolean;
export declare function validateObjectIds(ids: string[]): void;
export declare function validateAndTransformObjectIds(ids: string[], fieldName?: string): Types.ObjectId[];
export declare function validatePaginationParams(page: number, pageSize: number, maxPageSize?: number): void;
export declare function validateSortParams(sortField: string, allowedFields: string[]): void;
export declare function buildValidatedMongoFilterV1({ ids, isValidatedList, findExistingFn, entityName, filters, organizationId, projectIds, organizationFieldName, projectFieldName, }: BuildValidatedFilterOptions): Promise<{
    filter: Record<string, any>;
    objectIds: Types.ObjectId[];
    hasIds: boolean;
}>;
export declare function buildValidatedMongoFilter<TSchema = unknown>({ ids, filters, isValidatedList, findExistingFn, entityName, }: BuildValidatedFilterOptions<TSchema>): Promise<{
    filter: Record<string, unknown>;
    objectIds: Types.ObjectId[];
    hasIds: boolean;
}>;
export declare function executeDeleteOrSoftDelete({ softDelete, hasIds, objectIds, filter, deleteFn, updateFn, entityName, idsLabel, }: ExecuteDeleteOptions): Promise<{
    message: string;
    [key: string]: any;
}>;
export declare function buildDateRangeQuery(fieldName: string, dateRange: {
    startDate?: string;
    endDate?: string;
}): Record<string, unknown>;
export declare function softDelete<T>(model: Model<T>, filter: FilterQuery<T>, deletedById?: string): Promise<T | null>;
export {};
