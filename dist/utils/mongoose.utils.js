"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidObjectId = exports.calculatePaginate = void 0;
exports.validateObjectIds = validateObjectIds;
exports.validateAndTransformObjectIds = validateAndTransformObjectIds;
exports.validatePaginationParams = validatePaginationParams;
exports.validateSortParams = validateSortParams;
exports.buildValidatedMongoFilterV1 = buildValidatedMongoFilterV1;
exports.buildValidatedMongoFilter = buildValidatedMongoFilter;
exports.executeDeleteOrSoftDelete = executeDeleteOrSoftDelete;
exports.buildDateRangeQuery = buildDateRangeQuery;
exports.softDelete = softDelete;
const mongoose_1 = require("mongoose");
const common_1 = require("@nestjs/common");
const error_utils_1 = require("./error.utils");
const dayjs_1 = __importDefault(require("dayjs"));
const calculatePaginate = (query) => {
    query.page = query.page ?? 1;
    query.pageSize = query.pageSize ?? 20;
    query.page = Math.max(1, query.page);
    query.skip = Math.max(0, (query.page - 1) * query.pageSize);
    return query;
};
exports.calculatePaginate = calculatePaginate;
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
exports.isValidObjectId = isValidObjectId;
function validateObjectIds(ids) {
    if (!ids || ids.length === 0) {
        return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('No valid IDs provided.', common_1.HttpStatus.BAD_REQUEST), null, 'No valid IDs provided.');
    }
    for (const id of ids) {
        if (!(0, exports.isValidObjectId)(id)) {
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Invalid ObjectId format: ${id}`, common_1.HttpStatus.BAD_REQUEST), null, `Invalid ObjectId format: ${id}`);
        }
    }
}
function validateAndTransformObjectIds(ids, fieldName = 'ids') {
    if (!ids || ids.length === 0) {
        return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`No ${fieldName} provided.`, common_1.HttpStatus.BAD_REQUEST), null, `No ${fieldName} provided.`);
    }
    const objectIds = [];
    for (const id of ids) {
        if (!(0, exports.isValidObjectId)(id)) {
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Invalid ObjectId format in ${fieldName}: ${id}`, common_1.HttpStatus.BAD_REQUEST), null, `Invalid ObjectId format in ${fieldName}: ${id}`);
        }
        objectIds.push(new mongoose_1.Types.ObjectId(id));
    }
    return objectIds;
}
function validatePaginationParams(page, pageSize, maxPageSize = 100) {
    if (page < 1) {
        return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Page number must be greater than 0.', common_1.HttpStatus.BAD_REQUEST), null, 'Page number must be greater than 0.');
    }
    if (pageSize < 1 || pageSize > maxPageSize) {
        return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Page size must be between 1 and ${maxPageSize}.`, common_1.HttpStatus.BAD_REQUEST), null, `Page size must be between 1 and ${maxPageSize}.`);
    }
}
function validateSortParams(sortField, allowedFields) {
    if (!allowedFields.includes(sortField)) {
        return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Invalid sort field: ${sortField}. Allowed fields: ${allowedFields.join(', ')}`, common_1.HttpStatus.BAD_REQUEST), null, `Invalid sort field: ${sortField}. Allowed fields: ${allowedFields.join(', ')}`);
    }
}
async function buildValidatedMongoFilterV1({ ids = [], isValidatedList = false, findExistingFn, entityName = 'Items', filters = {}, organizationId, projectIds, organizationFieldName = 'organization', projectFieldName = 'project', }) {
    const objectIds = validateAndTransformObjectIds(ids);
    const hasIds = objectIds.length > 0;
    const fullFilters = { ...filters };
    if (organizationId && !filters[organizationFieldName]) {
        fullFilters[organizationFieldName] = organizationId;
    }
    if (projectIds && !filters[projectFieldName]) {
        fullFilters[projectFieldName] = Array.isArray(projectIds)
            ? { $in: projectIds }
            : projectIds;
    }
    const filter = { ...fullFilters };
    if (hasIds) {
        filter._id = { $in: objectIds };
        if (!isValidatedList) {
            const existingItems = await findExistingFn(filter);
            if (existingItems.length !== objectIds.length) {
                return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Some ${entityName.toLowerCase()} were not found or do not match the provided filters.`, common_1.HttpStatus.BAD_REQUEST), null, `Some ${entityName.toLowerCase()} were not found or do not match the provided filters.`);
            }
        }
    }
    return { filter, objectIds, hasIds };
}
async function buildValidatedMongoFilter({ ids = [], filters = {}, isValidatedList = false, findExistingFn, entityName = 'Items', }) {
    const objectIds = validateAndTransformObjectIds(ids);
    const hasIds = objectIds.length > 0;
    const filter = { ...filters };
    if (hasIds) {
        filter._id = { $in: objectIds };
        if (!isValidatedList) {
            const existingItems = await findExistingFn(filter);
            if (existingItems.length !== objectIds.length) {
                return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Some ${entityName.toLowerCase()} were not found or do not match the specified filters.`, common_1.HttpStatus.BAD_REQUEST), null, `Some ${entityName.toLowerCase()} were not found or do not match the specified filters.`);
            }
        }
    }
    return { filter, objectIds, hasIds };
}
async function executeDeleteOrSoftDelete({ softDelete = true, hasIds, objectIds, filter, deleteFn, updateFn, entityName, idsLabel = 'ids', }) {
    let result;
    if (softDelete) {
        result = await updateFn(filter, {
            $set: { deletedAt: (0, dayjs_1.default)().toDate() },
        });
        if (hasIds && result.modifiedCount !== objectIds.length) {
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Failed to soft delete some ${entityName.toLowerCase()}. Only ${result.modifiedCount} of ${objectIds.length} were updated.`, common_1.HttpStatus.INTERNAL_SERVER_ERROR), null, `Failed to soft delete some ${entityName.toLowerCase()}. Only ${result.modifiedCount} of ${objectIds.length} were updated.`);
        }
    }
    else {
        result = await deleteFn(filter);
        if (hasIds && result.deletedCount !== objectIds.length) {
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Failed to delete some ${entityName.toLowerCase()}. Only ${result.deletedCount} of ${objectIds.length} were removed.`, common_1.HttpStatus.INTERNAL_SERVER_ERROR), null, `Failed to delete some ${entityName.toLowerCase()}. Only ${result.deletedCount} of ${objectIds.length} were removed.`);
        }
    }
    const count = result.modifiedCount ?? result.deletedCount ?? 0;
    return {
        message: `${count} ${entityName.toLowerCase()}(s) successfully ${softDelete ? 'soft deleted' : 'deleted'}.`,
        [idsLabel]: objectIds.map((id) => id.toString()),
    };
}
function buildDateRangeQuery(fieldName, dateRange) {
    const query = {};
    if (dateRange.startDate) {
        query[fieldName] = { $gte: (0, dayjs_1.default)(dateRange.startDate).toDate() };
    }
    if (dateRange.endDate) {
        if (query[fieldName]) {
            query[fieldName].$lte = (0, dayjs_1.default)(dateRange.endDate).toDate();
        }
        else {
            query[fieldName] = { $lte: (0, dayjs_1.default)(dateRange.endDate).toDate() };
        }
    }
    return query;
}
async function softDelete(model, filter, deletedById) {
    const update = { deletedAt: (0, dayjs_1.default)().toDate() };
    if (deletedById) {
        update.deletedById = deletedById;
    }
    return model.findOneAndUpdate(filter, { $set: update }, { new: true, runValidators: true });
}
//# sourceMappingURL=mongoose.utils.js.map