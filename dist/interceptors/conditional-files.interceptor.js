"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionalFilesInterceptor = ConditionalFilesInterceptor;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const multer_1 = __importDefault(require("multer"));
function ConditionalFilesInterceptor(fieldName, maxCount = 1) {
    class Interceptor {
        intercept(context, next) {
            const request = context.switchToHttp().getRequest();
            const contentType = (request.headers['content-type'] || '').toLowerCase();
            const isMultipart = contentType.includes('multipart/form-data');
            if (!isMultipart) {
                return next.handle();
            }
            const createMulter = multer_1.default;
            const multerHandler = createMulter().array(fieldName, maxCount);
            return (0, rxjs_1.from)(new Promise((resolve, reject) => {
                multerHandler(request, context.switchToHttp().getResponse(), (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            })).pipe((0, operators_1.switchMap)(() => next.handle()));
        }
    }
    return Interceptor;
}
//# sourceMappingURL=conditional-files.interceptor.js.map