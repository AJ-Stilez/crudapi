/**
 * Security Constants
 *
 * Centralized constants for security-related configurations including
 * token expiration times and mapping TTLs.
 */

/**
 * JWT Access Token expiration time
 * This is the time after which access tokens become invalid
 * Format: '60m' = 60 minutes
 */
export const JWT_ACCESS_TOKEN_EXPIRATION = '60m';

/**
 * JWT Access Token expiration time in seconds
 * Used for cache TTL calculations
 * 60 minutes = 3600 seconds
 */
export const JWT_ACCESS_TOKEN_EXPIRATION_SECONDS = 60 * 60; // 3600 seconds

/**
 * Token Mapping TTL in seconds
 * Should be slightly longer than token expiration to handle edge cases
 * where token is validated just before expiration
 * 60 minutes + 5 minutes buffer = 65 minutes = 3900 seconds
 */
export const TOKEN_MAPPING_TTL_SECONDS =
  JWT_ACCESS_TOKEN_EXPIRATION_SECONDS + 5 * 60; // 3900 seconds

/**
 * Refresh Token expiration time in hours
 * Fixed expiration - user must re-authenticate after this period
 * 6 hours = good balance between security and UX
 */
export const REFRESH_TOKEN_EXPIRATION_HOURS = 6;
export const REFRESH_TOKEN_EXPIRATION_SECONDS =
  REFRESH_TOKEN_EXPIRATION_HOURS * 60 * 60; // 21600 seconds

/**
 * Maximum session lifetime in hours
 * Total time from first login - forces re-auth after this period
 * Even with token rotation, session expires after 24 hours
 */
export const MAX_SESSION_LIFETIME_HOURS = 24;
export const MAX_SESSION_LIFETIME_SECONDS =
  MAX_SESSION_LIFETIME_HOURS * 60 * 60; // 86400 seconds

/**
 * Refresh Token inactivity timeout in hours
 * Invalidates refresh token if unused for this period
 * 1 hour = automatically logs out inactive users
 */
export const REFRESH_TOKEN_INACTIVITY_HOURS = 1;
export const REFRESH_TOKEN_INACTIVITY_SECONDS =
  REFRESH_TOKEN_INACTIVITY_HOURS * 60 * 60; // 3600 seconds

/**
 * Maximum number of refresh attempts per day per token
 * Prevents abuse if token is stolen
 */
export const MAX_REFRESH_ATTEMPTS_PER_DAY = 20;
