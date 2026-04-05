/**
 * Interface for a generic cache provider.
 * All cache implementations (e.g., Redis, in-memory) must adhere to this.
 */
export interface ICacheProvider {
  /**
   * Retrieves a value from the cache by its key.
   * @param key The key of the item to retrieve.
   * @returns The cached value or null if not found.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Stores a value in the cache with an optional time-to-live (TTL).
   * @param key The key of the item to store.
   * @param value The value to store.
   * @param ttlSeconds Optional. The time-to-live in seconds. If 0 or negative, it means no expiry.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Deletes a value from the cache by its key.
   * @param key The key of the item to delete.
   */
  del(key: string): Promise<void>;

  /**
   * Checks if a key exists in the cache.
   * @param key The key to check.
   * @returns True if the key exists, false otherwise.
   */
  has(key: string): Promise<boolean>;

  /**
   * Clears all items from the cache.
   */
  clear(): Promise<void>;

  /**
   * Deletes all keys matching a pattern.
   * @param pattern The pattern to match (e.g., 'estate:details:*')
   * @returns Promise resolving to the number of keys deleted
   */
  delPattern(pattern: string): Promise<number>;
}

// Injection token for the cache provider
export const CACHE_PROVIDER = 'CACHE_PROVIDER';
