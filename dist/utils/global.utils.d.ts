import { ValidationError } from '@nestjs/common';
export declare function encryptQrData(data: string): string;
export declare function decryptQrData(encrypted: string): string;
export declare function encryptAuditLogData(data: string): string;
export declare function decryptAuditLogData(encrypted: string): string;
interface RetryOptions<T> {
    retries?: number;
    delay?: number;
    maxDelay?: number;
    jitter?: boolean;
    timeoutPerAttempt?: number;
    retryable?: (error: any, attempt: number) => boolean;
    onRetry?: (error: any, attempt: number, nextDelay: number) => void;
    fallback?: () => Promise<T>;
    signal?: AbortSignal;
}
export declare const multerDefaultConfig: {
    storage: import("multer").StorageEngine;
    fileFilter: (req: any, file: any, cb: any) => any;
};
export declare const GLOBAL_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export declare const generateRandomNumber: (min: number, max: number) => number;
export declare function pickRandomArrayItem<T>(array: T[]): T;
export declare const randomNumbers: (min: number, max: number) => number;
export declare const randomCharacters: (length: any, chars: string | any[]) => string;
export declare const formatRequestBody: (body: any) => any;
export declare const getDurationInMilliseconds: (start: [number, number]) => number;
export declare const formatValidationErrors: (errors: ValidationError[]) => any[];
export declare const cleanupArrayData: (arr: Record<string, unknown>[]) => Record<string, unknown>[];
export declare function retryWithBackoffAdvanced<T>(fn: (attempt: number) => Promise<T>, options?: RetryOptions<T>): Promise<T>;
export declare function retryWithBackoff<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>;
export declare function getNestedValue(obj: any, path: string): any;
export declare function omitFields<T extends Record<string, any>, K extends keyof T>(payload: T, keysToOmit: K[]): Omit<T, K>;
export declare function IsEmailOrPhone(validationOptions?: any): (object: any, propertyName: string) => void;
export {};
