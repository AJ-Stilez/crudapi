import { Model, Document } from 'mongoose';
import { PaginateType } from 'src/types/mongoose.types';
import { HttpStatus } from '@nestjs/common';
import { PaginationService } from './pagination.service';
export interface PaginatedDataInterface<T> {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    data: T[];
}
type OptionalCrudFieldsType = {
    processFieldOptions?: unknown[];
    select?: string;
    sort?: string;
    session?: unknown;
    lean?: boolean;
};
export declare class CrudService<M extends Document, T = any> {
    protected readonly model: Model<T>;
    protected readonly paginationService?: PaginationService | undefined;
    constructor(model: Model<T>, paginationService?: PaginationService | undefined);
    withTransaction<T>(callback: (session: any) => Promise<T>): Promise<T>;
    create(data: any, session?: any): Promise<T>;
    createMany(dataArray: unknown[], session?: unknown): Promise<T[]>;
    bulkWrite(dataArray: any[], session?: any): Promise<T[]>;
    findAll(filter?: any, page?: number, pageSize?: number, select?: string, sort?: string, options?: OptionalCrudFieldsType): Promise<T[]>;
    findAllNoPaginate(filter: any, select?: string, sort?: string, options?: OptionalCrudFieldsType): Promise<T[]>;
    findPaginated(paginatedQuery: PaginateType, filter?: any, fieldOptions?: OptionalCrudFieldsType): Promise<PaginatedDataInterface<T>>;
    findOne(options: any, fieldOptions?: OptionalCrudFieldsType): Promise<T>;
    findOneSorted(options: any, sort?: string): Promise<T>;
    findByIdAndUpdate(id: string, updateData: Partial<any>, session?: any): Promise<T>;
    findOneAndUpdate(filter: any, updateData: Partial<any>, session?: any): Promise<T>;
    findOneOrThrow(options: any, errorMessage?: string): Promise<M>;
    findOneOrThrowException(options: any, exceptionStatus?: HttpStatus, errorMessage?: string, fieldOptions?: OptionalCrudFieldsType, notFoundCallback?: () => any): Promise<M>;
    updateMany(filter: any, updateData: Partial<any>, session?: any): Promise<any>;
    deleteOne(options: any, session?: any): Promise<any>;
    deleteMany(options: any, session?: any): Promise<any>;
    count(options?: any): Promise<number>;
    aggregate(pipeline: any[]): Promise<any[]>;
    private processFieldOptions;
}
export {};
