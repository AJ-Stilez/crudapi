import { Injectable } from '@nestjs/common';
import { ICacheProvider } from 'src/types/cache-provider.types';
import dayjs from 'dayjs';

interface CacheEntry<T> {
  value: T;
  expiry?: number;
}

/**
 * In-memory implementation of ICacheProvider.
 * Suitable for development or simple caching needs.
 */
@Injectable()
export class InMemoryCacheProvider implements ICacheProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly cache = new Map<string, CacheEntry<any>>();

  /**
   * Retrieves a value from the in-memory cache.
   * Handles expiry checks.
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (entry.expiry && entry.expiry < dayjs().valueOf()) {
      this.cache.delete(key); // Remove expired entry
      return null;
    }

    return entry.value;
  }

  /**
   * Stores a value in the in-memory cache with an optional TTL.
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const entry: CacheEntry<T> = { value };
    if (ttlSeconds && ttlSeconds > 0) {
      entry.expiry = dayjs().valueOf() + ttlSeconds * 1000;
    }
    this.cache.set(key, entry);
  }

  /**
   * Deletes a value from the in-memory cache.
   */
  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Checks if a key exists and is not expired in the in-memory cache.
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    if (entry.expiry && entry.expiry < dayjs().valueOf()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Clears all entries from the in-memory cache.
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Deletes all keys matching a pattern.
   * @param pattern The pattern to match (supports * wildcard, e.g., 'estate:details:*')
   * @returns Promise resolving to the number of keys deleted
   */
  async delPattern(pattern: string): Promise<number> {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}
