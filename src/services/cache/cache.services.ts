import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cacheProviderTypes from 'src/types/cache-provider.types';


/**
 * CacheService provides a high-level API for interacting with the underlying cache provider.
 * It's injected with a specific ICacheProvider implementation.
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject(cacheProviderTypes.CACHE_PROVIDER) private readonly cacheProvider: cacheProviderTypes.ICacheProvider,
    private readonly logger: Logger,
  ) {}

  /**
   * Retrieves data from the cache.
   * @param key The key to retrieve.
   * @returns The cached data or null.
   */
  async get<T>(key: string): Promise<T | null> {
    this.logger.log(`CacheService: Attempting to get key: ${key}`);
    return this.cacheProvider.get<T>(key);
  }

  /**
   * Stores data in the cache.
   * @param key The key to store.
   * @param value The value to store.
   * @param ttlSeconds Optional time-to-live in seconds.
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.logger.log(
      `CacheService: Setting key: ${key} with TTL: ${ttlSeconds || 'none'}s`,
    );
    return this.cacheProvider.set<T>(key, value, ttlSeconds);
  }

  /**
   * Gets a value from cache, or sets it if not found.
   * @param key The key to retrieve or set.
   * @param factory Function to generate the value if not found in cache.
   * @param ttlSeconds Optional time-to-live in seconds.
   * @returns The cached or newly created value.
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    this.logger.log(`CacheService: Attempting to get or set key: ${key}`);

    // Try to get from cache first
    const cachedValue = await this.cacheProvider.get<T>(key);
    if (cachedValue !== null) {
      this.logger.log(`CacheService: Cache hit for key: ${key}`);
      return cachedValue;
    }

    // Cache miss, generate value using factory
    this.logger.log(
      `CacheService: Cache miss for key: ${key}, generating value`,
    );
    const newValue = await factory();

    // Store in cache
    await this.cacheProvider.set<T>(key, newValue, ttlSeconds);
    this.logger.log(`CacheService: Stored new value for key: ${key}`);

    return newValue;
  }

  /**
   * Deletes data from the cache.
   * @param key The key to delete.
   */
  async del(key: string): Promise<void> {
    this.logger.log(`CacheService: Deleting key: ${key}`);
    return this.cacheProvider.del(key);
  }

  /**
   * Checks if a key exists in the cache.
   * @param key The key to check.
   * @returns True if the key exists, false otherwise.
   */
  async has(key: string): Promise<boolean> {
    this.logger.log(`CacheService: Checking if key exists: ${key}`);
    return this.cacheProvider.has(key);
  }

  /**
   * Clears the entire cache.
   */
  async clear(): Promise<void> {
    this.logger.log('CacheService: Clearing all cache entries.');
    return this.cacheProvider.clear();
  }

  /**
   * Deletes all keys matching a pattern.
   * @param pattern The pattern to match (e.g., 'estate:details:*')
   * @returns Promise resolving to the number of keys deleted
   */
  async delPattern(pattern: string): Promise<number> {
    this.logger.log(`CacheService: Deleting keys matching pattern: ${pattern}`);
    return this.cacheProvider.delPattern(pattern);
  }
}
