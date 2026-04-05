"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_utils_1 = require("../../utils/mongoose.utils");
let PaginationService = class PaginationService {
    async findPaginated(model, paginatedQuery, filter, fieldOptions, processFieldOptions) {
        const paginationParams = (0, mongoose_utils_1.calculatePaginate)(paginatedQuery);
        const queryBuilder = model
            .find(filter || {})
            .sort({ createdAt: -1 });
        if (processFieldOptions) {
            await processFieldOptions(queryBuilder, fieldOptions);
        }
        queryBuilder.skip(paginationParams.skip);
        queryBuilder.limit(paginationParams.pageSize);
        const paginatedResponse = await queryBuilder.exec();
        const totalRecords = await model
            .countDocuments(filter || {})
            .exec();
        return {
            totalRecords,
            totalPages: Math.ceil(totalRecords / (paginationParams.pageSize ?? 0)),
            currentPage: paginationParams.page ?? 0,
            pageSize: paginationParams.pageSize ?? 0,
            data: paginatedResponse,
        };
    }
};
exports.PaginationService = PaginationService;
exports.PaginationService = PaginationService = __decorate([
    (0, common_1.Injectable)()
], PaginationService);
//# sourceMappingURL=pagination.service.js.map