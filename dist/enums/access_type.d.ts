export declare enum AccessType {
    ADMIN = "admin",
    USER = "user",
    SUPER_ADMIN = "super_admin",
    GUARD = "guard"
}
export type AuthData = {
    userId: string;
    authId: string;
    accessType: AccessType;
    metadata?: Record<string, any>;
};
