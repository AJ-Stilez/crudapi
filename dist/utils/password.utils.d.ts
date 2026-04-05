export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxLength?: number;
    disallowedWords?: string[];
}
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(hash: string, password: string): Promise<boolean>;
export declare function isPasswordStrong(password: string): boolean;
export declare function generateRandomPassword(length?: number, includeSpecialChars?: boolean): string;
export declare function validatePasswordPolicy(password: string, policy: PasswordPolicy): {
    isValid: boolean;
    errors: string[];
};
export declare function hashPasswordWithSalt(password: string, salt: string): Promise<string>;
export declare function generatePasswordResetToken(length?: number): string;
export declare function generateSalt(length?: number): string;
