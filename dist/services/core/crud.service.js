"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudService = void 0;
const mongoose_utils_1 = require("../../utils/mongoose.utils");
const common_1 = require("@nestjs/common");
const error_utils_1 = require("../../utils/error.utils");
class CrudService {
    model;
    paginationService;
    constructor(model, paginationService) {
        this.model = model;
        this.paginationService = paginationService;
    }
    async withTransaction(callback) {
        const session = await this.model.db.startSession();
        session.startTransaction();
        try {
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            await session.endSession();
        }
    }
    async create(data, session) {
        if (session) {
            const [createdDoc] = await this.model.create([data], {
                session,
            });
            return createdDoc;
        }
        return await this.model.create(data);
    }
    async createMany(dataArray, session) {
        return await this.model.insertMany(dataArray, { session });
    }
    async bulkWrite(dataArray, session) {
        if (!dataArray.length)
            return [];
        const bulkOps = dataArray.map((data) => ({
            insertOne: { document: data },
        }));
        const result = await this.model.bulkWrite(bulkOps, { session });
        let insertedIds = Object.values(result.insertedIds);
        let insertedDocs = await this.model.find({ _id: { $in: insertedIds } }).lean();
        return insertedDocs;
    }
    async findAll(filter, page, pageSize, select, sort, options) {
        const safePage = Math.max(1, page || 1);
        const skip = (safePage - 1) * (pageSize ?? 1);
        const queryBuilder = this.model
            .find(filter)
            .sort({ createdAt: -1 });
        if (select) {
            console.warn('[DEPRECATION] `select` is deprecated. Use `options.select` instead.');
            queryBuilder.select(select);
        }
        if (sort) {
            console.warn('[DEPRECATION] `select` is deprecated. Use `options.sort` instead.');
            queryBuilder.sort(sort);
        }
        if (skip)
            queryBuilder.skip(skip);
        if (pageSize)
            queryBuilder.limit(pageSize);
        await this.processFieldOptions(queryBuilder, options);
        return await queryBuilder.exec();
    }
    async findAllNoPaginate(filter, select, sort, options) {
        const queryBuilder = this.model
            .find(filter)
            .sort({ createdAt: -1 });
        if (select) {
            console.warn('[DEPRECATION] `select` is deprecated. Use `options.select` instead.');
            queryBuilder.select(select);
        }
        if (sort) {
            console.warn('[DEPRECATION] `select` is deprecated. Use `options.sort` instead.');
            queryBuilder.sort(sort);
        }
        await this.processFieldOptions(queryBuilder, options);
        return await queryBuilder.exec();
    }
    async findPaginated(paginatedQuery, filter, fieldOptions) {
        if (this.paginationService) {
            return this.paginationService.findPaginated(this.model, paginatedQuery, filter, fieldOptions, this.processFieldOptions.bind(this));
        }
        const paginationParams = (0, mongoose_utils_1.calculatePaginate)(paginatedQuery);
        const queryBuilder = this.model
            .find(filter || {})
            .sort({ createdAt: -1 });
        await this.processFieldOptions(queryBuilder, fieldOptions);
        queryBuilder.skip(paginationParams.skip);
        queryBuilder.limit(paginationParams.pageSize);
        const paginatedResponse = await queryBuilder.exec();
        const totalRecords = await this.count(filter || {});
        return {
            totalRecords,
            totalPages: Math.ceil(totalRecords / (paginationParams.pageSize ?? 0)),
            currentPage: paginationParams.page ?? 0,
            pageSize: paginationParams.pageSize ?? 0,
            data: paginatedResponse,
        };
    }
    async findOne(options, fieldOptions) {
        const queryBuilder = this.model.findOne(options);
        await this.processFieldOptions(queryBuilder, fieldOptions);
        return await queryBuilder.exec();
    }
    async findOneSorted(options, sort) {
        return await this.model
            .findOne(options)
            .sort(sort ?? { createdAt: -1 })
            .exec();
    }
    async findByIdAndUpdate(id, updateData, session) {
        const query = this.model.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (session)
            query.session(session);
        return await query.exec();
    }
    async findOneAndUpdate(filter, updateData, session) {
        const query = this.model.findOneAndUpdate(filter, updateData, {
            new: true,
        });
        if (session)
            query.session(session);
        return await query.exec();
    }
    async findOneOrThrow(options, errorMessage) {
        const record = await this.model.findOne(options);
        if (!record) {
            return (0, error_utils_1.handleAndThrowError)(new Error(errorMessage ?? 'Record not found'), null, errorMessage ?? 'Record not found');
        }
        return await this.model.findOne(options).exec();
    }
    async findOneOrThrowException(options, exceptionStatus, errorMessage, fieldOptions, notFoundCallback) {
        const record = await this.model.findOne(options);
        if (!record) {
            if (notFoundCallback) {
                return await notFoundCallback();
            }
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(errorMessage ?? 'Record not found', exceptionStatus ?? common_1.HttpStatus.BAD_REQUEST), null, errorMessage ?? 'Record not found');
        }
        const queryBuilder = this.model.findOne(options);
        await this.processFieldOptions(queryBuilder, fieldOptions);
        return await queryBuilder.exec();
    }
    async updateMany(filter, updateData, session) {
        const query = this.model.updateMany(filter, updateData);
        if (session)
            query.session(session);
        return await query.exec();
    }
    async deleteOne(options, session) {
        const query = this.model.deleteOne(options);
        if (session)
            query.session(session);
        return await query.exec();
    }
    async deleteMany(options, session) {
        const query = this.model.deleteMany(options);
        if (session)
            query.session(session);
        return await query.exec();
    }
    async count(options) {
        return await this.model.count(options).exec();
    }
    async aggregate(pipeline) {
        return await this.model.aggregate(pipeline);
    }
    async processFieldOptions(queryBuilder, fieldOptions) {
        if (fieldOptions?.processFieldOptions) {
            for (const field of fieldOptions.processFieldOptions) {
                queryBuilder.populate(field);
            }
        }
        if (fieldOptions?.select)
            queryBuilder.select(fieldOptions?.select);
        if (fieldOptions?.sort) {
            queryBuilder.sort(fieldOptions.sort);
        }
        if (fieldOptions?.session)
            queryBuilder.session(fieldOptions.session);
        if (fieldOptions?.lean) {
            queryBuilder.lean();
        }
    }
}
exports.CrudService = CrudService;
//# sourceMappingURL=crud.service.js.map