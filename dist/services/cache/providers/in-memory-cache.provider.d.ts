import { ICacheProvider } from 'src/types/cache-provider.types';
export declare class InMemoryCacheProvider implements ICacheProvider {
    private readonly cache;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    has(key: string): Promise<boolean>;
    clear(): Promise<void>;
    delPattern(pattern: string): Promise<number>;
}
