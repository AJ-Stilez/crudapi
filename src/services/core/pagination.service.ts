import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaginateType } from 'src/types/mongoose.types';
import { calculatePaginate } from 'src/utils/mongoose.utils';
import { PaginatedDataInterface } from 'src/services/core/crud.service';

/**
 * Optional configuration for CRUD query fields.
 */
export type OptionalCrudFieldsType = {
  processFieldOptions?: unknown[];
  select?: string;
  sort?: string;
  session?: unknown;
  lean?: boolean;
};

/**
 * Pagination service for handling paginated queries.
 */
@Injectable()
export class PaginationService {
  /**
   * Executes a paginated query with field options support.
   *
   * @param model - Mongoose model to query.
   * @param paginatedQuery - Pagination parameters.
   * @param filter - Filter conditions.
   * @param fieldOptions - Additional field options (processFieldOptions, select, sort, etc.).
   * @param processFieldOptions - Function to process field options on query builder.
   * @returns Paginated result.
   */
  async findPaginated<T>(
    model: Model<T>,
    paginatedQuery: PaginateType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter?: any,
    fieldOptions?: OptionalCrudFieldsType,
    processFieldOptions?: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryBuilder: any,
      options?: OptionalCrudFieldsType,
    ) => Promise<void>,
  ): Promise<PaginatedDataInterface<T>> {
    const paginationParams = calculatePaginate(paginatedQuery);

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryBuilder = (model as any)
      .find(filter || {})
      .sort({ createdAt: -1 });

    // Apply field options (including processFieldOptions for population)
    if (processFieldOptions) {
      await processFieldOptions(queryBuilder, fieldOptions);
    }

    // Apply pagination
    queryBuilder.skip(paginationParams.skip);
    queryBuilder.limit(paginationParams.pageSize);

    const paginatedResponse = await queryBuilder.exec();

    // Count total records
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRecords = await (model as any)
      .countDocuments(filter || {})
      .exec();

    return {
      totalRecords,
      totalPages: Math.ceil(totalRecords / (paginationParams.pageSize ?? 0) ),
      currentPage: paginationParams.page ?? 0,
      pageSize: paginationParams.pageSize ?? 0,
      data: paginatedResponse,
    };
  }
}