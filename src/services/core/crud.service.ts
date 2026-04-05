import { Model, Document } from 'mongoose';
import { PaginateType } from 'src/types/mongoose.types';
import { calculatePaginate } from 'src/utils/mongoose.utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import { handleAndThrowError } from 'src/utils/error.utils';
import { PaginationService } from './pagination.service';

/**
 * Interface for paginated response data.
 */
export interface PaginatedDataInterface<T> {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: T[];
}

/**
 * Optional configuration for CRUD query fields.
 */
type OptionalCrudFieldsType = {
  processFieldOptions?: unknown[];
  select?: string;
  sort?: string;
  session?: unknown;
  lean?: boolean;
};

/**
 * Generic CRUD service for MongoDB using Mongoose.
 *
 * @template M - The Mongoose Document type.
 * @template T - The return type of queries (can be plain object or hydrated document).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class CrudService<M extends Document, T = any> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly paginationService?: PaginationService,
  ) {}

  /**
   * Executes a callback within a MongoDB transaction session.
   *
   * @param callback - The function to execute in the transaction.
   * @returns The result of the callback.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async withTransaction<T>(callback: (session: any) => Promise<T>) {
    const session = await this.model.db.startSession();
    session.startTransaction();
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates a single document.
   *
   * @param data - The data to create.
   * @param session - Optional transaction session.
   * @returns The created document.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any, session?: any): Promise<T> {
    if (session) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [createdDoc] = await (this.model as any).create([data], {
        session,
      });
      return createdDoc;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (this.model as any).create(data);
  }

  /**
   * Creates multiple documents.
   *
   * @param dataArray - Array of documents to insert.
   * @param session - Optional transaction session.
   * @returns Array of inserted documents.
   */
  async createMany(dataArray: unknown[], session?: unknown): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (this.model as any).insertMany(dataArray, { session });
  }

  /**
   * Bulk inserts documents using bulkWrite.
   *
   * @param dataArray - Array of documents to insert.
   * @param session - Optional transaction session.
   * @returns Inserted documents.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async bulkWrite(dataArray: any[], session?: any): Promise<T[]> {
    if (!dataArray.length) return [];

    const bulkOps = dataArray.map((data) => ({
      insertOne: { document: data },
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (this.model as any).bulkWrite(bulkOps, { session });
    // Fetch inserted documents (since bulkWrite doesn't return them directly)
     let insertedIds = Object.values(result.insertedIds);
     let insertedDocs = await this.model.find({ _id: { $in: insertedIds } }).lean();
    return insertedDocs as T[];
  }

  /**
   * Finds all documents with optional pagination, sorting, and selection.
   *
   * @param filter - Query filter.
   * @param page - Page number.
   * @param pageSize - Number of records per page.
   * @param select - @deprecated Use `options.select` instead.
   * @param sort - @deprecated Use `options.sort` instead.
   * @param options - Additional field options.
   * @returns Array of found documents.
   */
  async findAll(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter?: any,
    page?: number,
    pageSize?: number,
    /** @deprecated Use `options.select` instead. */
    select?: string,
    /** @deprecated Use `options.sort` instead. */
    sort?: string,
    options?: OptionalCrudFieldsType,
  ): Promise<T[]> {
    // skip = skip ?? 1;
    // pageSize = pageSize ?? 50;
    // Ensure page is at least 1 to avoid negative skip values
    const safePage = Math.max(1, page || 1);
    const skip = (safePage - 1) * (pageSize ?? 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryBuilder = (this.model as any)
      .find(filter)
      .sort({ createdAt: -1 });
    if (select) {
      // eslint-disable-next-line no-restricted-globals
      console.warn(
        '[DEPRECATION] `select` is deprecated. Use `options.select` instead.',
      );
      queryBuilder.select(select);
    }
    if (sort) {
      // eslint-disable-next-line no-restricted-globals
      console.warn(
        '[DEPRECATION] `select` is deprecated. Use `options.sort` instead.',
      );
      queryBuilder.sort(sort);
    }
    if (skip) queryBuilder.skip(skip);
    if (pageSize) queryBuilder.limit(pageSize);
    await this.processFieldOptions(queryBuilder, options);
    return await queryBuilder.exec();
  }

  /**
   * Finds all documents without pagination.
   *
   * @param filter - Query filter.
   * @param select - @deprecated Use `options.select` instead.
   * @param sort - @deprecated Use `options.sort` instead.
   * @param options - Additional field options.
   * @returns Array of found documents.
   */
  async findAllNoPaginate(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: any,
    /** @deprecated Use `options.select` instead. */
    select?: string,
    /** @deprecated Use `options.sort` instead. */
    sort?: string,
    options?: OptionalCrudFieldsType,
  ): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryBuilder = (this.model as any)
      .find(filter)
      .sort({ createdAt: -1 });
    if (select) {
      // eslint-disable-next-line no-restricted-globals
      console.warn(
        '[DEPRECATION] `select` is deprecated. Use `options.select` instead.',
      );
      queryBuilder.select(select);
    }
    if (sort) {
      // eslint-disable-next-line no-restricted-globals
      console.warn(
        '[DEPRECATION] `select` is deprecated. Use `options.sort` instead.',
      );
      queryBuilder.sort(sort);
    }
    await this.processFieldOptions(queryBuilder, options);
    return await queryBuilder.exec();
  }

  /**
   * Returns paginated documents with metadata.
   *
   * @param paginatedQuery - Pagination params.
   * @param filter - Filter conditions.
   * @param fieldOptions - Additional field options (processFieldOptions, select, sort, etc.).
   * @returns Paginated result.
   */
  async findPaginated(
    paginatedQuery: PaginateType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter?: any,
    fieldOptions?: OptionalCrudFieldsType,
  ): Promise<PaginatedDataInterface<T>> {
    // Use PaginationService if available, otherwise fall back to inline implementation
    if (this.paginationService) {
      return this.paginationService.findPaginated<T>(
        this.model,
        paginatedQuery,
        filter,
        fieldOptions,
        this.processFieldOptions.bind(this),
      );
    }

    // Fallback to inline implementation if PaginationService is not provided
    const paginationParams = calculatePaginate(paginatedQuery);

    // Use findAllNoPaginate with manual pagination to support fieldOptions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryBuilder = (this.model as any)
      .find(filter || {})
      .sort({ createdAt: -1 });

    // Apply field options (including processFieldOptions for population)
    await this.processFieldOptions(queryBuilder, fieldOptions);

    // Apply pagination
    queryBuilder.skip(paginationParams.skip);
    queryBuilder.limit(paginationParams.pageSize);

    const paginatedResponse = await queryBuilder.exec();
    const totalRecords = await this.count(filter || {});

    return {
      totalRecords,
      totalPages: Math.ceil(totalRecords / (paginationParams.pageSize ?? 0) ),
      currentPage: paginationParams.page ?? 0,
      pageSize: paginationParams.pageSize ?? 0,
      data: paginatedResponse,
    };
  }

  /**
   * Finds a single document.
   *
   * @param options - Filter conditions.
   * @param fieldOptions - Additional field options.
   * @returns Found document or null.
   */
  async findOne(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any,
    fieldOptions?: OptionalCrudFieldsType,
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryBuilder = (this.model as any).findOne(options);
    await this.processFieldOptions(queryBuilder, fieldOptions);
    return await queryBuilder.exec();
  }

  /**
   * Finds one document with optional sorting.
   *
   * @param options - Filter conditions.
   * @param sort - Sort criteria.
   * @returns Found document or null.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOneSorted(options: any, sort?: string): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (this.model as any)
      .findOne(options)
      .sort(sort ?? { createdAt: -1 })
      .exec();
  }

  /**
   * Updates a document by its ID.
   *
   * @param id - Document ID.
   * @param updateData - Update data.
   * @param session - Optional transaction session.
   * @returns Updated document.
   */
  async findByIdAndUpdate(
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateData: Partial<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session?: any,
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (this.model as any).findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (session) query.session(session);
    return await query.exec();
  }

  /**
   * Updates the first document matching the filter.
   *
   * @param filter - Query filter.
   * @param updateData - Update data.
   * @param session - Optional transaction session.
   * @returns Updated document.
   */
  async findOneAndUpdate(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateData: Partial<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session?: any,
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (this.model as any).findOneAndUpdate(filter, updateData, {
      new: true,
    });
    if (session) query.session(session);
    return await query.exec();
  }

  /**
   * Finds a document or throws a plain error if not found.
   *
   * @param options - Filter conditions.
   * @param errorMessage - Error message to throw.
   * @returns Found document.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOneOrThrow(options: any, errorMessage?: string): Promise<M> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await (this.model as any).findOne(options);
    if (!record) {
      return handleAndThrowError(
        new Error(errorMessage ?? 'Record not found'),
        null,
        errorMessage ?? 'Record not found',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (this.model as any).findOne(options).exec();
  }

  /**
   * Finds a document or throws an HTTP exception if not found.
   *
   * @param options - Filter conditions.
   * @param exceptionStatus - Optional HTTP status code.
   * @param errorMessage - Optional custom error message.
   * @param fieldOptions - Additional field options.
   * @param notFoundCallback - Optional callback to handle not found case.
   * @returns Found document.
   */
  async findOneOrThrowException(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any,
    exceptionStatus?: HttpStatus,
    errorMessage?: string,
    fieldOptions?: OptionalCrudFieldsType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notFoundCallback?: () => any, // Optional callback if not found
  ): Promise<M> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await (this.model as any).findOne(options);
    if (!record) {
      if (notFoundCallback) {
        return await notFoundCallback();
      }
      return handleAndThrowError(
        new HttpException(
          errorMessage ?? 'Record not found',
          exceptionStatus ?? HttpStatus.BAD_REQUEST,
        ),
        null,
        errorMessage ?? 'Record not found',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryBuilder = (this.model as any).findOne(options);
    await this.processFieldOptions(queryBuilder, fieldOptions);
    return await queryBuilder.exec();
  }

  /**
   * Updates multiple documents.
   *
   * @param filter - Filter conditions.
   * @param updateData - Update data.
   * @param session - Optional transaction session.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateMany(filter: any, updateData: Partial<any>, session?: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (this.model as any).updateMany(filter, updateData);
    if (session) query.session(session);
    return await query.exec();
  }

  /**
   * Deletes a single document.
   *
   * @param options - Filter conditions.
   * @param session - Optional transaction session.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteOne(options: any, session?: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (this.model as any).deleteOne(options);
    if (session) query.session(session);
    return await query.exec();
  }

  /**
   * Deletes multiple documents.
   *
   * @param options - Filter conditions.
   * @param session - Optional transaction session.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteMany(options: any, session?: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (this.model as any).deleteMany(options);
    if (session) query.session(session);
    return await query.exec();
  }

  /**
   * Counts the number of documents that match the filter.
   *
   * @param options - Filter conditions.
   * @returns Number of matching documents.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async count(options?: any): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (this.model as any).count(options).exec();
  }

  /**
   * Executes an aggregation pipeline on the model.
   *
   * @param pipeline - MongoDB aggregation pipeline stages.
   * @returns Aggregation results.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async aggregate(pipeline: any[]): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (this.model as any).aggregate(pipeline);
  }

  /**
   * Applies field-related options to a query builder.
   *
   * @param queryBuilder - Mongoose query instance.
   * @param fieldOptions - Field options.
   */
  private async processFieldOptions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: any,
    fieldOptions?: OptionalCrudFieldsType,
  ) {
    if (fieldOptions?.processFieldOptions) {
      for (const field of fieldOptions.processFieldOptions) {
        queryBuilder.populate(field);
      }
    }
    if (fieldOptions?.select) queryBuilder.select(fieldOptions?.select);
    if (fieldOptions?.sort) {
      queryBuilder.sort(fieldOptions.sort);
    }
    if (fieldOptions?.session) queryBuilder.session(fieldOptions.session);
    if (fieldOptions?.lean) {
      queryBuilder.lean();
    }
  }
}
