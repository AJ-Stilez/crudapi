export declare const SENSITIVE_FIELDS: string[];
export declare function sanitizeData(data: unknown, visited?: WeakSet<object>, depth?: number): Record<string, unknown> | undefined;
export declare function extractIpAddress(headers: Record<string, unknown>, ip?: string, remoteAddress?: string): string | undefined;
export declare function normalizeRequestBodyForDedup(body: unknown, path: string): Promise<unknown>;
export declare function extractResourceInfo(path: string): {
    resource: string;
    resourceId?: string;
};
export declare function determineAction(method: string, path: string): string;
