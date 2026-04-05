declare enum Environment {
    development = "development",
    staging = "staging",
    production = "production",
    test = "test"
}
declare const UPPER_ENVIRONMENTS: Environment[];
declare const getNodeEnv: () => Environment;
declare const getProject: () => string | void;
declare const isDevelopment: () => boolean;
declare const notIsDevelopment: () => boolean;
declare const isProduction: () => boolean;
declare const notIsProduction: () => boolean;
declare const isUpperEnv: () => boolean;
declare const isLowerEnv: () => boolean;
export { Environment, UPPER_ENVIRONMENTS, getNodeEnv, getProject, notIsDevelopment, isDevelopment, isLowerEnv, isProduction, isUpperEnv, notIsProduction, };
