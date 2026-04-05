/**
 *
 * Utility functions for audit trail operations including data sanitization
 * and IP address extraction.
 *
 * @module AuditUtils
 */

import { isValidEmail } from 'src/utils/helper.utils';
import { normalizePhoneNumber } from 'src/utils/phone.utils';
import { formatRequestBody } from './global.utils';

/**
 * Sensitive fields that should be excluded from audit logs
 */
export const SENSITIVE_FIELDS = [
  'password',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'creditCard',
  'cvv',
  'pin',
  // GateId related fields - should never appear in audit logs
  'estateGateId',
  'estateGateIdEncrypted',
  'estateGateIdHash',
  'gateId',
  'gateIdEncrypted',
  'gateIdHash',
];

/**
 * Sanitizes an object by removing or redacting sensitive fields
 * Uses the existing formatRequestBody utility and extends it for nested objects
 * Handles circular references and Mongoose documents safely
 *
 * @param data - Data to sanitize
 * @param visited - Set of already visited objects to prevent circular reference issues
 * @param depth - Current recursion depth (max 10 to prevent stack overflow)
 * @returns Sanitized data with sensitive fields redacted
 */
export function sanitizeData(
  data: unknown,
  visited: WeakSet<object> = new WeakSet(),
  depth = 0,
): Record<string, unknown> | undefined {
  // Prevent infinite recursion with depth limit
  const MAX_DEPTH = 10;
  if (depth > MAX_DEPTH) {
    return { '[MAX_DEPTH_REACHED]': true };
  }

  if (!data || typeof data !== 'object') {
    return undefined;
  }

  // Handle circular references
  if (visited.has(data as object)) {
    return { '[CIRCULAR_REFERENCE]': true };
  }

  // Convert Mongoose documents to plain objects to avoid circular references
  // and issues with getters/setters
  let plainData = data;
  if (
    data &&
    typeof data === 'object' &&
    'toObject' in data &&
    typeof (data as { toObject?: () => unknown }).toObject === 'function'
  ) {
    try {
      const converted = (data as { toObject: () => unknown }).toObject();
      // If toObject returns a valid plain object, use it
      if (converted && typeof converted === 'object' && converted !== data) {
        plainData = converted;
        // Also mark the converted object as visited to prevent circular refs
        // that might exist in the converted object itself
        visited.add(converted as object);
      }
    } catch {
      plainData = data;
    }
  }

  // Use existing formatRequestBody for simple cases
  if (plainData && typeof plainData === 'object' && !Array.isArray(plainData)) {
    const obj = plainData as Record<string, unknown>;
    // Check if it's a simple request body with password fields
    if ('password' in obj || 'currentPassword' in obj || 'newPassword' in obj) {
      const sanitized = formatRequestBody(obj);
      return sanitized as Record<string, unknown>;
    }
  }

  // Mark this object as visited to prevent circular references
  visited.add(data as object);

  // For nested objects, recursively sanitize
  const sanitized: Record<string, unknown> = {};
  const obj = plainData as Record<string, unknown>;

  try {
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((field) =>
        lowerKey.includes(field.toLowerCase()),
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          sanitized[key] = value.map((item) => {
            if (item && typeof item === 'object') {
              return sanitizeData(item, visited, depth + 1);
            }
            return item;
          });
        } else {
          if (visited.has(value)) {
            sanitized[key] = { '[CIRCULAR_REFERENCE]': true };
          } else {
            sanitized[key] = sanitizeData(value, visited, depth + 1);
          }
        }
      } else {
        sanitized[key] = value;
      }
    }
  } catch (error) {
    return { '[SANITIZATION_ERROR]': true };
  }

  return sanitized;
}

/**
 * Extracts IP address from request headers
 * Handles X-Forwarded-For header (for proxies/load balancers) and falls back to direct IP
 *
 * @param headers - Request headers
 * @param ip - Direct IP from request
 * @param remoteAddress - Socket remote address
 * @returns IP address string
 */
export function extractIpAddress(
  headers: Record<string, unknown>,
  ip?: string,
  remoteAddress?: string,
): string | undefined {
  // Check X-Forwarded-For header (first IP in chain is the original client)
  const forwardedFor = headers['x-forwarded-for'] as string;
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim();
  }

  // Fall back to direct IP
  return ip || remoteAddress;
}

/**
 * Normalizes phone numbers in request body for deduplication
 * This ensures that different phone formats (e.g., +2341234567890 vs 2341234567890)
 * are treated as the same request
 *
 * @param body - Request body
 * @param path - Request path
 * @returns Normalized body with phone numbers standardized
 */
export async function normalizeRequestBodyForDedup(
  body: unknown,
  path: string,
): Promise<unknown> {
  // Only normalize for authentication endpoints
  if (!path.includes('/auth/') && !path.includes('/authenticate')) {
    return body;
  }

  if (!body || typeof body !== 'object') {
    return body;
  }

  const normalized = { ...(body as Record<string, unknown>) };

  // Check for common identifier fields in auth requests
  const identifierFields = ['identifier', 'email', 'phone', 'username'];
  for (const field of identifierFields) {
    if (normalized[field] && typeof normalized[field] === 'string') {
      const value = normalized[field] as string;
      // If it's not an email and looks like a phone number, normalize it
      if (!isValidEmail(value) && /^\+?[\d\s\-\(\)]+$/.test(value)) {
        try {
          normalized[field] = normalizePhoneNumber(value);
        } catch {
          // If normalization fails, keep original value
        }
      }
    }
  }

  return normalized;
}

/**
 * Extracts resource information from the request path
 * Parses URL paths to identify the resource type and resource ID
 *
 * @param path - Request path (e.g., '/v1/users/123')
 * @returns Object with resource name and optional resourceId
 *
 * @example
 * extractResourceInfo('/v1/users/123') // { resource: 'User', resourceId: '123' }
 * extractResourceInfo('/v1/estates/456/payments') // { resource: 'Payment', resourceId: '456' }
 */
export function extractResourceInfo(path: string): {
  resource: string;
  resourceId?: string;
} {
  // Remove version prefix (e.g., /v1/)
  const cleanPath = path.replace(/^\/v\d+\//, '');

  // Extract resource from path segments
  // Examples:
  // /v1/users -> resource: 'User'
  // /v1/users/123 -> resource: 'User', resourceId: '123'
  // /v1/estates/456/payments -> resource: 'Payment', resourceId: '456'
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { resource: 'Unknown' };
  }

  // Get the last segment as resource (plural to singular conversion)
  let resource = segments[segments.length - 1];
  resource =
    resource.charAt(0).toUpperCase() + resource.slice(1).replace(/s$/, '');

  // Try to find resource ID (usually a UUID or ObjectId)
  const idPattern =
    /^[0-9a-f]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let resourceId: string | undefined;

  // Look for ID in path segments
  for (let i = segments.length - 2; i >= 0; i--) {
    if (idPattern.test(segments[i])) {
      resourceId = segments[i];
      // The resource is the segment before the ID
      if (i > 0) {
        const resourceSegment = segments[i - 1];
        resource =
          resourceSegment.charAt(0).toUpperCase() +
          resourceSegment.slice(1).replace(/s$/, '');
      }
      break;
    }
  }

  return { resource, resourceId };
}

/**
 * Determines the action type from HTTP method and path
 * Maps HTTP methods and special paths to audit trail action names
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param path - Request path
 * @returns Action name (CREATE, UPDATE, DELETE, READ, LOGIN, etc.)
 *
 * @example
 * determineAction('POST', '/v1/users') // 'CREATE'
 * determineAction('GET', '/v1/auth/login') // 'LOGIN'
 */
export function determineAction(method: string, path: string): string {
  const upperMethod = method.toUpperCase();

  // Special cases for authentication
  if (path.includes('/auth/login') || path.includes('/auth/authenticate')) {
    return 'LOGIN';
  }
  if (path.includes('/auth/logout')) {
    return 'LOGOUT';
  }
  if (path.includes('/auth/forgot-password')) {
    return 'FORGOT_PASSWORD';
  }
  if (path.includes('/auth/reset-password')) {
    return 'RESET_PASSWORD';
  }

  // Standard CRUD operations
  switch (upperMethod) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    case 'GET':
      return 'READ';
    default:
      return upperMethod;
  }
}
