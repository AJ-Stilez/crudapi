export interface AnyObject {
    [key: string]: unknown;
}
export type RecordId = string | number;
export declare enum RequestMethod {
    POST = "POST",
    PUT = "PUT",
    GET = "GET",
    DELETE = "DELETE"
}
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
    timeTakenMs?: number;
    path?: string;
    validationErrors?: unknown;
}
