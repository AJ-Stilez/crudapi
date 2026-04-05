"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorStatusCode = void 0;
exports.handleAndThrowError = handleAndThrowError;
const common_1 = require("@nestjs/common");
function handleAndThrowError(error, logger = null, fallbackMessage = 'An unexpected error occurred', errorStatus, publishToSentry = false, loggerMessage = 'An unexpected error occurred') {
    if (publishToSentry) {
    }
    if (error instanceof common_1.HttpException) {
        if (logger) {
            logger.error({ err: error, stack: error.stack }, error.message);
        }
        throw error;
    }
    const stack = error instanceof Error ? error.stack : undefined;
    if (logger) {
        logger.error({
            err: error,
            stack,
            status: errorStatus ?? common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        }, loggerMessage ?? fallbackMessage);
    }
    throw new common_1.HttpException(fallbackMessage, errorStatus ?? common_1.HttpStatus.INTERNAL_SERVER_ERROR);
}
const getErrorStatusCode = (err) => {
    if (err instanceof common_1.HttpException) {
        return err.getStatus();
    }
    return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
};
exports.getErrorStatusCode = getErrorStatusCode;
//# sourceMappingURL=error.utils.js.map