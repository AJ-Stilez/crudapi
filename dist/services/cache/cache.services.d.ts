import { Logger } from 'nestjs-pino';
import * as cacheProviderTypes from 'src/types/cache-provider.types';
export declare class CacheService {
    private readonly cacheProvider;
    private readonly logger;
    constructor(cacheProvider: cacheProviderTypes.ICacheProvider, logger: Logger);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T>;
    del(key: string): Promise<void>;
    has(key: string): Promise<boolean>;
    clear(): Promise<void>;
    delPattern(pattern: string): Promise<number>;
}
