/**
 * Audit Trail Utilities
 *
 * Utility functions for creating audit trail entries for internal processes
 * and outgoing requests. Provides easy-to-use helpers for tracking system activities.
 *
 * @module AuditTrailUtils
 */
import { AuditTrailService } from 'src/services/audit-trail.service';
import { AuditTrailProcessType } from 'src/schema/class/audit-trail.schema.class';
import dayjs from 'dayjs';
import { AuditAction } from 'src/enums/audit-actions.enums';
import { sanitizeData } from './audit.utils';

/**
 * Logs an internal process to the audit trail
 * Use this for tracking service calls, background jobs, or any internal operations
 *
 * @param auditTrailService - The audit trail service instance
 * @param options - Audit trail entry options
 *
 * @example
 * ```typescript
 * // Track a background job
 * logInternalProcess(auditTrailService, {
 *   action: 'PROCESS_PAYMENT',
 *   resource: 'Payment',
 *   resourceId: paymentId,
 *   metadata: { amount: 1000, currency: 'NGN' },
 * });
 *
 * // Track a service method call
 * logInternalProcess(auditTrailService, {
 *   action: 'SEND_EMAIL',
 *   resource: 'Email',
 *   metadata: { recipient: 'user@example.com', template: 'welcome' },
 * });
 * ```
 */
export function logInternalProcess(
  auditTrailService: AuditTrailService,
  options: {
    userId?: string;
    action: string | AuditAction;
    resource: string;
    resourceId?: string;
    requestData?: unknown;
    responseData?: unknown;
    statusCode?: number;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  },
): void {
  auditTrailService.createAuditEntryAsync({
    processType: AuditTrailProcessType.INTERNAL_PROCESS,
    userId: options.userId,
    action:
      typeof options.action === 'string'
        ? options.action
        : String(options.action),
    resource: options.resource,
    resourceId: options.resourceId,
    requestData: sanitizeData(options.requestData),
    responseData: sanitizeData(options.responseData),
    statusCode: options.statusCode,
    errorMessage: options.errorMessage,
    metadata: options.metadata,
  });
}

/**
 * Logs an outgoing HTTP request to the audit trail
 * Use this for tracking external API calls
 *
 * @param auditTrailService - The audit trail service instance
 * @param options - Audit trail entry options
 *
 * @example
 * ```typescript
 * // Track an external API call
 * logOutgoingRequest(auditTrailService, {
 *   userId: '123',
 *   action: 'SEND_SMS',
 *   resource: 'SMS',
 *   method: 'POST',
 *   externalUrl: 'https://api.sms-provider.com/send',
 *   requestData: { phone: '+2341234567890', message: 'Hello' },
 *   responseData: { success: true, messageId: 'msg123' },
 *   statusCode: 200,
 * });
 * ```
 */
export function logOutgoingRequest(
  auditTrailService: AuditTrailService,
  options: {
    userId?: string;
    action: string | AuditAction;
    resource: string;
    method: string;
    externalUrl: string;
    requestData?: unknown;
    responseData?: unknown;
    statusCode?: number;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  },
): void {
  auditTrailService.createAuditEntryAsync({
    processType: AuditTrailProcessType.OUTGOING_REQUEST,
    userId: options.userId,
    action: options.action,
    resource: options.resource,
    method: options.method,
    externalUrl: options.externalUrl,
    requestData: sanitizeData(options.requestData),
    responseData: sanitizeData(options.responseData),
    statusCode: options.statusCode,
    errorMessage: options.errorMessage,
    metadata: options.metadata,
  });
}

/**
 * Configuration options for tracking a process
 */
export interface TrackProcessOptions {
  /** User ID who initiated the process */
  userId?: string;
  /** Action name for the audit trail */
  action: string | AuditAction;
  /** Resource name for the audit trail */
  resource: string;
  /** Resource ID (can be extracted from arguments if not provided) */
  resourceId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Function to extract resource ID from function arguments */
  resourceIdExtractor?: (...args: unknown[]) => string | undefined;
  /** Function to extract user ID from function arguments */
  userIdExtractor?: (...args: unknown[]) => string | undefined;
  /** Function to transform arguments into request data */
  requestDataTransformer?: (...args: unknown[]) => unknown;
  /** Function to transform result into response data (for sanitization control) */
  responseDataTransformer?: (result: unknown) => unknown;
  /** Whether to include full response data (default: true, set false for large responses) */
  includeFullResponse?: boolean;
  /** Maximum size of response data to log (in characters, default: 10000) */
  maxResponseSize?: number;
  /** Maximum size of request data to log (in characters, default: 10000) */
  maxRequestSize?: number;
  /** Whether to track memory usage (default: false) */
  trackMemory?: boolean;
  /** Whether to track CPU usage (default: false) */
  trackCpu?: boolean;
  /** Whether to track request/response sizes in bytes (default: false) */
  trackDataSize?: boolean;
  /** Correlation/Request ID for distributed tracing */
  correlationId?: string;
  /** Number of retry attempts (if operation was retried) */
  retryAttempt?: number;
  /** Whether this is an async/background operation */
  isAsync?: boolean;
}

/**
 * Wraps an async function and logs it to the audit trail
 * Automatically tracks execution time, success/failure, and data
 * Supports capturing function arguments and extracting metadata
 *
 * @param auditTrailService - The audit trail service instance
 * @param options - Audit trail configuration
 * @param fn - The function to execute and track
 * @param args - Arguments to pass to the function
 * @returns Promise resolving to the function result
 *
 * @example
 * ```typescript
 * // Track a service method with arguments
 * const result = await trackProcess(
 *   auditTrailService,
 *   {
 *     action: 'PROCESS_PAYMENT',
 *     resource: 'Payment',
 *     resourceIdExtractor: (paymentId) => paymentId,
 *     userIdExtractor: (paymentId, userId) => userId,
 *     requestDataTransformer: (paymentId, amount) => ({ paymentId, amount }),
 *   },
 *   paymentService.processPayment,
 *   paymentId,
 *   amount
 * );
 *
 * // Track with custom metadata extraction
 * const result = await trackProcess(
 *   auditTrailService,
 *   {
 *     action: 'SEND_EMAIL',
 *     resource: 'Email',
 *     resourceIdExtractor: (emailData) => emailData.id,
 *     requestDataTransformer: (emailData) => ({
 *       recipient: emailData.to,
 *       template: emailData.template,
 *     }),
 *     includeFullResponse: false, // Don't log full email response
 *   },
 *   emailService.send,
 *   emailData
 * );
 * ```
 */
export async function trackProcess<
  T extends (...args: unknown[]) => Promise<unknown>,
>(
  auditTrailService: AuditTrailService,
  options: TrackProcessOptions,
  fn: T,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>> {
  const startTime = dayjs().valueOf();
  const startMemory = options.trackMemory ? process.memoryUsage() : undefined;
  const startCpu = options.trackCpu ? process.cpuUsage() : undefined;

  // Extract metadata from arguments
  const extractedResourceId =
    options.resourceId ||
    (options.resourceIdExtractor
      ? options.resourceIdExtractor(...args)
      : undefined);
  const extractedUserId =
    options.userId ||
    (options.userIdExtractor ? options.userIdExtractor(...args) : undefined);

  // Transform arguments to request data
  let requestData = options.requestDataTransformer
    ? options.requestDataTransformer(...args)
    : args.length > 0
    ? args.length === 1
      ? args[0]
      : { arguments: args }
    : undefined;

  // Limit request size if configured
  if (options.maxRequestSize && requestData) {
    const requestString = JSON.stringify(requestData);
    if (requestString.length > options.maxRequestSize) {
      requestData = {
        _truncated: true,
        _originalSize: requestString.length,
        _data: requestString.substring(0, options.maxRequestSize),
      };
    }
  }

  let responseData: unknown;
  let errorMessage: string | undefined;
  let statusCode: number | undefined;
  let errorStack: string | undefined;

  try {
    const result = await fn(...args);
    const endTime = dayjs().valueOf();
    const duration = endTime - startTime;

    // Transform result to response data
    let transformedResult = options.responseDataTransformer
      ? options.responseDataTransformer(result)
      : result;

    // Limit response size if configured
    if (options.maxResponseSize && transformedResult) {
      const resultString = JSON.stringify(transformedResult);
      if (resultString.length > options.maxResponseSize) {
        transformedResult = {
          _truncated: true,
          _originalSize: resultString.length,
          _data: resultString.substring(0, options.maxResponseSize),
        };
      }
    }

    responseData =
      options.includeFullResponse !== false
        ? transformedResult
        : { _logged: true };
    statusCode = 200;

    // Build metadata
    const metadata: Record<string, unknown> = {
      ...options.metadata,
      duration,
    };

    // Add correlation ID if provided
    if (options.correlationId) {
      metadata.correlationId = options.correlationId;
    }

    // Add retry attempt if provided
    if (options.retryAttempt !== undefined) {
      metadata.retryAttempt = options.retryAttempt;
    }

    // Add async flag if provided
    if (options.isAsync !== undefined) {
      metadata.isAsync = options.isAsync;
    }

    // Add memory usage if tracking
    if (options.trackMemory && startMemory) {
      const endMemory = process.memoryUsage();
      metadata.memoryUsage = {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
      };
    }

    // Add CPU usage if tracking
    if (options.trackCpu && startCpu) {
      const endCpu = process.cpuUsage();
      metadata.cpuUsage = {
        user: endCpu.user - startCpu.user,
        system: endCpu.system - startCpu.system,
      };
    }

    // Add data size tracking if enabled
    if (options.trackDataSize) {
      const requestSize = requestData ? JSON.stringify(requestData).length : 0;
      const responseSize = responseData
        ? JSON.stringify(responseData).length
        : 0;
      metadata.dataSize = {
        requestBytes: requestSize,
        responseBytes: responseSize,
        totalBytes: requestSize + responseSize,
      };
    }

    // Log success
    logInternalProcess(auditTrailService, {
      userId: extractedUserId,
      action: options.action,
      resource: options.resource,
      resourceId: extractedResourceId,
      requestData: sanitizeData(requestData),
      responseData: sanitizeData(responseData),
      statusCode,
      metadata,
    });

    return result as Awaited<ReturnType<T>>;
  } catch (error) {
    const endTime = dayjs().valueOf();
    const duration = endTime - startTime;

    // Extract error information
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else {
      errorMessage = String(error);
    }

    // Try to extract status code from error
    if (error && typeof error === 'object') {
      const errorObj = error as {
        statusCode?: number;
        status?: number;
        code?: number;
      };
      statusCode =
        errorObj.statusCode || errorObj.status || errorObj.code || 500;
    } else {
      statusCode = 500;
    }

    // Transform error result if transformer is provided
    let errorResponseData: unknown = undefined;
    if (options.responseDataTransformer && error) {
      try {
        errorResponseData = options.responseDataTransformer(error);
      } catch {
        // Ignore transformation errors
      }
    }

    // Build metadata
    const metadata: Record<string, unknown> = {
      ...options.metadata,
      duration,
      errorStack,
    };

    // Add correlation ID if provided
    if (options.correlationId) {
      metadata.correlationId = options.correlationId;
    }

    // Add retry attempt if provided
    if (options.retryAttempt !== undefined) {
      metadata.retryAttempt = options.retryAttempt;
    }

    // Add async flag if provided
    if (options.isAsync !== undefined) {
      metadata.isAsync = options.isAsync;
    }

    // Add error type for better categorization
    if (error instanceof Error) {
      metadata.errorType = error.constructor?.name || 'Error';
    }

    // Add memory usage if tracking
    if (options.trackMemory && startMemory) {
      const endMemory = process.memoryUsage();
      metadata.memoryUsage = {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
      };
    }

    // Add CPU usage if tracking
    if (options.trackCpu && startCpu) {
      const endCpu = process.cpuUsage();
      metadata.cpuUsage = {
        user: endCpu.user - startCpu.user,
        system: endCpu.system - startCpu.system,
      };
    }

    // Add data size tracking if enabled
    if (options.trackDataSize) {
      const requestSize = requestData ? JSON.stringify(requestData).length : 0;
      const responseSize = errorResponseData
        ? JSON.stringify(errorResponseData).length
        : 0;
      metadata.dataSize = {
        requestBytes: requestSize,
        responseBytes: responseSize,
        totalBytes: requestSize + responseSize,
      };
    }

    // Log failure
    logInternalProcess(auditTrailService, {
      userId: extractedUserId,
      action: options.action,
      resource: options.resource,
      resourceId: extractedResourceId,
      requestData: sanitizeData(requestData),
      responseData: errorResponseData
        ? sanitizeData(errorResponseData)
        : undefined,
      statusCode,
      errorMessage,
      metadata,
    });

    throw error;
  }
}

/**
 * Creates a pre-configured tracking function for a specific action and resource
 * This reduces boilerplate by allowing you to create reusable trackers
 *
 * @param auditTrailService - The audit trail service instance
 * @param action - The audit action (enum or string)
 * @param resource - The resource name
 * @param defaults - Default options for all tracked calls
 *
 * @example
 * ```typescript
 * // Create a tracker once
 * const trackPayment = createTracker(
 *   auditTrailService,
 *   AuditAction.INITIATE_PAYMENT,
 *   'Payment',
 *   { userId: data.userId }
 * );
 *
 * // Use it simply
 * const result = await trackPayment(async () => {
 *   return this.createPayment(data);
 * });
 * ```
 */
export function createTracker(
  auditTrailService: AuditTrailService,
  action: AuditAction | string,
  resource: string,
  defaults?: Partial<TrackProcessOptions>,
) {
  return async <T extends () => Promise<unknown>>(
    fn: T,
    overrides?: Partial<TrackProcessOptions>,
  ): Promise<Awaited<ReturnType<T>>> => {
    // Auto-extract resourceId from result if it has id property
    const resourceIdExtractor =
      overrides?.resourceIdExtractor ||
      defaults?.resourceIdExtractor ||
      ((result: unknown) => {
        if (result && typeof result === 'object' && 'id' in result) {
          const id = (result as { id?: unknown }).id;
          return typeof id === 'string' ? id : String(id);
        }
        return undefined;
      });

    return trackProcess(
      auditTrailService,
      {
        action,
        resource,
        ...defaults,
        ...overrides,
        resourceIdExtractor,
      },
      fn as T,
      ...([] as Parameters<T>),
    ) as Promise<Awaited<ReturnType<T>>>;
  };
}
