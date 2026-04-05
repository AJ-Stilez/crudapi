import { Logger } from 'nestjs-pino';
import { CacheService } from './cache.services';
export interface AuthCacheData {
    userId: string;
    userType: string;
    assignedEstates: string[];
    permissions: string[];
    roles: string[];
    cachedAt: number;
    expiresAt: number;
}
export declare class AuthCacheService {
    private readonly cacheService;
    private readonly logger;
    private readonly CACHE_PREFIX;
    private readonly DEFAULT_TTL;
    constructor(cacheService: CacheService, logger: Logger);
    private generateCacheKey;
    getUserData(userId: string): Promise<AuthCacheData | null>;
    setUserData(userId: string, userData: Omit<AuthCacheData, 'cachedAt' | 'expiresAt'>, ttl?: number): Promise<boolean>;
    invalidateUserData(userId: string): Promise<boolean>;
    invalidateMultipleUsers(userIds: string[]): Promise<number>;
    hasUserData(userId: string): Promise<boolean>;
    updateUserData(userId: string, updates: Partial<Omit<AuthCacheData, 'cachedAt' | 'expiresAt'>>): Promise<boolean>;
    getStats(): Promise<Record<string, unknown>>;
}
