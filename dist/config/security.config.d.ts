export type SecurityConfig = {
    jwtSecret: string;
    basicUsername?: string;
    basicPassword?: string;
    gateIdEncryptionKey?: string;
    refreshTokenFrontendSecret?: string;
    tokenEncryptionKey?: string;
};
export declare const getJwtSecret: () => string | undefined;
export declare const getSecurityConfigName: () => string;
export declare const getSecurityConfig: () => {
    jwtSecret: string;
    expiresIn: number;
    basicUsername: string | undefined;
    basicPassword: string | undefined;
    refreshTokenFrontendSecret: string | undefined;
    tokenEncryptionKey: string | undefined;
};
declare const _default: (() => {
    jwtSecret: string;
    expiresIn: number;
    basicUsername: string | undefined;
    basicPassword: string | undefined;
    refreshTokenFrontendSecret: string | undefined;
    tokenEncryptionKey: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    jwtSecret: string;
    expiresIn: number;
    basicUsername: string | undefined;
    basicPassword: string | undefined;
    refreshTokenFrontendSecret: string | undefined;
    tokenEncryptionKey: string | undefined;
}>;
export default _default;
