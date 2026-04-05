/**
 * Auth Cache Service
 *
 * This service provides caching functionality specifically for authentication-related data.
 * It caches user sessions, tokens, and authentication states to improve performance
 * and reduce database load for frequently accessed authentication data.
 *
 * @module AuthCacheService
 */

import { Injectable } from '@nestjs/common';

import dayjs from 'dayjs';
import { Logger } from 'nestjs-pino';
import { CacheService } from './cache.services';

/**
 * Interface for authentication cache data
 *
 * Defines the structure of data stored in the authentication cache,
 * including user information, permissions, and session data.
 *
 * @interface AuthCacheData
 */
export interface AuthCacheData {
  /** User ID associated with the cached data */
  userId: string;
  /** User type (USER, PARTNER, GUARD, ESTATE) */
  userType: string;
  /** Array of estate IDs the user has access to */
  assignedEstates: string[];
  /** Array of user permissions */
  permissions: string[];
  /** Array of user roles */
  roles: string[];
  /** Timestamp when the cache entry was created */
  cachedAt: number;
  /** Timestamp when the cache entry expires */
  expiresAt: number;
}

/**
 * Authentication Cache Service
 *
 * Provides caching functionality for authentication data to improve performance
 * and reduce database load. Caches user information, permissions, and session data
 * with configurable TTL (Time To Live).
 *
 * @class AuthCacheService
 * @implements {Injectable}
 *
 * @example
 * ```typescript
 * import { AuthCacheService } from './auth-cache.service';
 *
 * @Injectable()
 * export class AuthService {
 *   constructor(private authCache: AuthCacheService) {}
 *
 *   async getUserData(userId: string) {
 *     // Try to get from cache first
 *     const cached = await this.authCache.getUserData(userId);
 *     if (cached) return cached;
 *
 *     // If not in cache, fetch from database
 *     const userData = await this.fetchFromDatabase(userId);
 *
 *     // Store in cache for future requests
 *     await this.authCache.setUserData(userId, userData);
 *
 *     return userData;
 *   }
 * }
 * ```
 */
@Injectable()
export class AuthCacheService {
  private readonly CACHE_PREFIX = 'auth:';
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: Logger,
  ) {}

  /**
   * Generates a cache key for authentication data
   *
   * Creates a unique cache key using the user ID and a prefix
   * to avoid conflicts with other cache entries.
   *
   * @param userId - The user ID to generate a cache key for
   * @returns The cache key string
   *
   * @example
   * ```typescript
   * const key = this.generateCacheKey('user123');
   * // Returns: 'auth:user123'
   * ```
   */
  private generateCacheKey(userId: string): string {
    return `${this.CACHE_PREFIX}${userId}`;
  }

  /**
   * Retrieves user authentication data from cache
   *
   * Attempts to fetch cached authentication data for a given user ID.
   * Returns null if the data is not found or has expired.
   *
   * @param userId - The user ID to retrieve cached data for
   * @returns Promise resolving to cached auth data or null if not found
   *
   * @example
   * ```typescript
   * const userData = await this.authCache.getUserData('user123');
   * if (userData) {
   *   console.log('User permissions:', userData.permissions);
   * }
   * ```
   */
  async getUserData(userId: string): Promise<AuthCacheData | null> {
    try {
      const key = this.generateCacheKey(userId);
      const cached = await this.cacheService.get<AuthCacheData>(key);

      if (!cached) {
        return null;
      }

      // Check if cache entry has expired
      if (cached.expiresAt && dayjs().valueOf() > cached.expiresAt) {
        await this.invalidateUserData(userId);
        return null;
      }

      return cached;
    } catch (error) {
      this.logger.error(
        `Error retrieving user data from cache for user ${userId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return null;
    }
  }

  /**
   * Stores user authentication data in cache
   *
   * Caches authentication data for a user with a configurable TTL.
   * The data includes user information, permissions, roles, and assigned estates.
   *
   * @param userId - The user ID to cache data for
   * @param userData - The authentication data to cache
   * @param ttl - Time to live in seconds (defaults to 1 hour)
   * @returns Promise resolving to true if successful, false otherwise
   *
   * @example
   * ```typescript
   * const userData: AuthCacheData = {
   *   userId: 'user123',
   *   userType: 'USER',
   *   assignedEstates: ['estate1', 'estate2'],
   *   permissions: ['read', 'write'],
   *   roles: ['resident'],
   *   cachedAt: dayjs().valueOf(),
   *   expiresAt: dayjs().valueOf() + 3600000
   * };
   *
   * await this.authCache.setUserData('user123', userData);
   * ```
   */
  async setUserData(
    userId: string,
    userData: Omit<AuthCacheData, 'cachedAt' | 'expiresAt'>,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<boolean> {
    try {
      const key = this.generateCacheKey(userId);
      const now = dayjs().valueOf();

      const cacheData: AuthCacheData = {
        ...userData,
        cachedAt: now,
        expiresAt: now + ttl * 1000,
      };

      await this.cacheService.set(key, cacheData, ttl);
      return true;
    } catch (error) {
      this.logger.error(
        `Error setting user data in cache for user ${userId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return false;
    }
  }

  /**
   * Invalidates cached user authentication data
   *
   * Removes the cached authentication data for a specific user,
   * forcing the next request to fetch fresh data from the database.
   *
   * @param userId - The user ID whose cache should be invalidated
   * @returns Promise resolving to true if successful, false otherwise
   *
   * @example
   * ```typescript
   * // Invalidate cache when user permissions change
   * await this.authCache.invalidateUserData('user123');
   * ```
   */
  async invalidateUserData(userId: string): Promise<boolean> {
    try {
      const key = this.generateCacheKey(userId);
      await this.cacheService.del(key);
      return true;
    } catch (error) {
      this.logger.error(
        `Error invalidating user data from cache for user ${userId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return false;
    }
  }

  /**
   * Invalidates cached data for multiple users
   *
   * Removes cached authentication data for multiple users at once.
   * Useful for bulk operations or when multiple users' permissions change.
   *
   * @param userIds - Array of user IDs whose cache should be invalidated
   * @returns Promise resolving to the number of successfully invalidated entries
   *
   * @example
   * ```typescript
   * // Invalidate cache for multiple users
   * const invalidatedCount = await this.authCache.invalidateMultipleUsers([
   *   'user1', 'user2', 'user3'
   * ]);
   * console.log(`Invalidated ${invalidatedCount} cache entries`);
   * ```
   */
  async invalidateMultipleUsers(userIds: string[]): Promise<number> {
    try {
      const keys = userIds.map((userId) => this.generateCacheKey(userId));
      const results = await Promise.allSettled(
        keys.map((key) => this.cacheService.del(key)),
      );

      return results.filter((result) => result.status === 'fulfilled').length;
    } catch (error) {
      this.logger.error(
        `Error invalidating multiple users from cache: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return 0;
    }
  }

  /**
   * Checks if user data exists in cache
   *
   * Verifies whether authentication data for a user is currently cached
   * without retrieving the actual data.
   *
   * @param userId - The user ID to check
   * @returns Promise resolving to true if data exists in cache, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await this.authCache.hasUserData('user123');
   * if (!exists) {
   *   // Fetch and cache user data
   * }
   * ```
   */
  async hasUserData(userId: string): Promise<boolean> {
    try {
      const key = this.generateCacheKey(userId);
      return await this.cacheService.has(key);
    } catch (error) {
      this.logger.error(
        `Error checking user data in cache for user ${userId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return false;
    }
  }

  /**
   * Updates specific fields in cached user data
   *
   * Updates only specific fields in the cached authentication data
   * without invalidating the entire cache entry.
   *
   * @param userId - The user ID whose cache should be updated
   * @param updates - Partial data to update in the cache
   * @returns Promise resolving to true if successful, false otherwise
   *
   * @example
   * ```typescript
   * // Update only permissions without invalidating entire cache
   * await this.authCache.updateUserData('user123', {
   *   permissions: ['read', 'write', 'admin']
   * });
   * ```
   */
  async updateUserData(
    userId: string,
    updates: Partial<Omit<AuthCacheData, 'cachedAt' | 'expiresAt'>>,
  ): Promise<boolean> {
    try {
      const existing = await this.getUserData(userId);
      if (!existing) {
        return false;
      }

      const updatedData: AuthCacheData = {
        ...existing,
        ...updates,
        cachedAt: dayjs().valueOf(), // Update cache timestamp
      };

      const key = this.generateCacheKey(userId);
      const remainingTtl = Math.max(
        0,
        Math.floor((existing.expiresAt - dayjs().valueOf()) / 1000),
      );

      await this.cacheService.set(key, updatedData, remainingTtl);
      return true;
    } catch (error) {
      this.logger.error(
        `Error updating user data in cache for user ${userId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return false;
    }
  }

  /**
   * Gets cache statistics
   *
   * Returns various metrics about the auth cache including
   * hit rates, memory usage, and performance indicators.
   *
   * @returns Promise resolving to cache statistics
   *
   * @example
   * ```typescript
   * const stats = await this.authCache.getStats();
   * console.log('Cache hit rate:', stats.hitRate);
   * ```
   */
  async getStats(): Promise<Record<string, unknown>> {
    try {
      return {
        service: 'AuthCacheService',
        timestamp: dayjs().valueOf(),
        note: 'Detailed stats not available in current implementation',
      };
    } catch (error) {
      this.logger.error(
        `Error getting cache stats: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return {};
    }
  }
}
