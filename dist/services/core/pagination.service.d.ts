import { Model } from 'mongoose';
import { PaginateType } from 'src/types/mongoose.types';
import { PaginatedDataInterface } from 'src/services/core/crud.service';
export type OptionalCrudFieldsType = {
    processFieldOptions?: unknown[];
    select?: string;
    sort?: string;
    session?: unknown;
    lean?: boolean;
};
export declare class PaginationService {
    findPaginated<T>(model: Model<T>, paginatedQuery: PaginateType, filter?: any, fieldOptions?: OptionalCrudFieldsType, processFieldOptions?: (queryBuilder: any, options?: OptionalCrudFieldsType) => Promise<void>): Promise<PaginatedDataInterface<T>>;
}
