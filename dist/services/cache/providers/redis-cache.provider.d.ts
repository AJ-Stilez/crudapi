import { OnModuleDestroy } from '@nestjs/common';
import { ICacheProvider } from 'src/types/cache-provider.types';
import { Logger } from 'nestjs-pino';
export interface RedisCacheOptions {
    host: string;
    port: number;
    password?: string;
    db?: number;
}
export declare class RedisCacheProvider implements ICacheProvider, OnModuleDestroy {
    private readonly logger;
    private readonly redisClient;
    constructor(options: RedisCacheOptions, logger: Logger);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    has(key: string): Promise<boolean>;
    clear(): Promise<void>;
    delPattern(pattern: string): Promise<number>;
    onModuleDestroy(): void;
}
