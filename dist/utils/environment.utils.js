"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notIsProduction = exports.isUpperEnv = exports.isProduction = exports.isLowerEnv = exports.isDevelopment = exports.notIsDevelopment = exports.getProject = exports.getNodeEnv = exports.UPPER_ENVIRONMENTS = exports.Environment = void 0;
var Environment;
(function (Environment) {
    Environment["development"] = "development";
    Environment["staging"] = "staging";
    Environment["production"] = "production";
    Environment["test"] = "test";
})(Environment || (exports.Environment = Environment = {}));
const UPPER_ENVIRONMENTS = [Environment.staging, Environment.production];
exports.UPPER_ENVIRONMENTS = UPPER_ENVIRONMENTS;
const getNodeEnv = () => Environment[process.env.NODE_ENV] || Environment.production;
exports.getNodeEnv = getNodeEnv;
const getProject = () => process.env.PROJECT || undefined;
exports.getProject = getProject;
const isDevelopment = () => getNodeEnv() === Environment.development;
exports.isDevelopment = isDevelopment;
const notIsDevelopment = () => !isDevelopment();
exports.notIsDevelopment = notIsDevelopment;
const isProduction = () => getNodeEnv() === Environment.production;
exports.isProduction = isProduction;
const notIsProduction = () => !isProduction();
exports.notIsProduction = notIsProduction;
const isUpperEnv = () => UPPER_ENVIRONMENTS.includes(getNodeEnv());
exports.isUpperEnv = isUpperEnv;
const isLowerEnv = () => !isUpperEnv();
exports.isLowerEnv = isLowerEnv;
//# sourceMappingURL=environment.utils.js.map