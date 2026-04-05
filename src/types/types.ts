export interface AnyObject {
  [key: string]: unknown;
}

export type RecordId = string | number;

export enum RequestMethod {
  POST = 'POST',
  PUT = 'PUT',
  GET = 'GET',
  DELETE = 'DELETE',
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T; // data might be null/undefined on error
  error?: string; // Add an optional error property for error descriptions
  timestamp: string;
  timeTakenMs?: number; // Time taken might not be meaningful or present for errors caught very early
  path?: string; // Add optional path property
  validationErrors?: unknown; // Add optional validation errors for detailed error reporting
}
