import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ICacheProvider } from 'src/types/cache-provider.types';
import { Logger } from 'nestjs-pino';

/**
 * Configuration options for the RedisCacheProvider.
 */
export interface RedisCacheOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  // Add more Redis connection options as needed (e.g., enableTLS, tls)
}

/**
 * Redis implementation of ICacheProvider.
 * Uses ioredis to interact with a Redis server.
 */
@Injectable()
export class RedisCacheProvider implements ICacheProvider, OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor(options: RedisCacheOptions, private readonly logger: Logger) {
    this.redisClient = new Redis({
      host: options.host,
      port: options.port,
      password: options.password,
      db: options.db,
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Connected to Redis server.');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
    });
  }

  /**
   * Retrieves a value from Redis. Parses the stored JSON string back to an object.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(
        `Failed to get key ${key} from Redis: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Stores a value in Redis. Stringifies the object to JSON.
   * Uses EX for TTL in seconds.
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.redisClient.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, data);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key} in Redis: ${error.message}`);
    }
  }

  /**
   * Deletes a value from Redis.
   */
  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(
        `Failed to delete key ${key} from Redis: ${error.message}`,
      );
    }
  }

  /**
   * Checks if a key exists in Redis.
   */
  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(
        `Failed to check existence for key ${key} in Redis: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Clears all keys from the current Redis database.
   * USE WITH CAUTION: This will clear ALL data in the configured Redis DB.
   */
  async clear(): Promise<void> {
    try {
      await this.redisClient.flushdb();
      this.logger.warn('Redis cache cleared (flushdb command executed).');
    } catch (error) {
      this.logger.error(`Failed to clear Redis cache: ${error.message}`);
    }
  }

  /**
   * Deletes all keys matching a pattern using SCAN for safe iteration.
   * @param pattern The pattern to match (e.g., 'estate:details:*')
   * @returns Promise resolving to the number of keys deleted
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const stream = this.redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      const keys: string[] = [];
      stream.on('data', (resultKeys: string[]) => {
        keys.push(...resultKeys);
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      if (keys.length === 0) {
        return 0;
      }

      // Delete keys in batches to avoid blocking Redis
      const batchSize = 100;
      let deletedCount = 0;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        const result = await this.redisClient.del(...batch);
        deletedCount += result;
      }

      this.logger.debug(
        `Deleted ${deletedCount} keys matching pattern: ${pattern}`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error(
        `Failed to delete keys matching pattern ${pattern}: ${error.message}`,
      );
      return 0;
    }
  }

  /**
   * Closes the Redis connection when the module is destroyed.
   */
  onModuleDestroy() {
    this.redisClient.disconnect();
    this.logger.log('Redis client disconnected.');
  }
}
