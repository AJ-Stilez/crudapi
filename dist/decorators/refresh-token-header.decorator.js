"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenHeader = void 0;
const common_1 = require("@nestjs/common");
const error_utils_1 = require("../utils/error.utils");
exports.RefreshTokenHeader = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const refreshToken = request.headers['x-refresh-token'];
    if (!refreshToken) {
        return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Refresh token is required in X-Refresh-Token header', common_1.HttpStatus.BAD_REQUEST), null, 'Refresh token is missing from header');
    }
    return refreshToken;
});
//# sourceMappingURL=refresh-token-header.decorator.js.map