export interface ICacheProvider {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    has(key: string): Promise<boolean>;
    clear(): Promise<void>;
    delPattern(pattern: string): Promise<number>;
}
export declare const CACHE_PROVIDER = "CACHE_PROVIDER";
