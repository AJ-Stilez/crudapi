"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoaderModule = void 0;
const config_1 = require("@nestjs/config");
const security_config_1 = __importDefault(require("../config/security.config"));
exports.ConfigLoaderModule = config_1.ConfigModule.forRoot({
    load: [security_config_1.default],
    isGlobal: true,
    cache: true,
});
//# sourceMappingURL=config.loader.module.js.map