import { Logger } from 'nestjs-pino';
import { CacheService } from './cache.services';
export interface TokenMappingData {
    userId: string;
    authId: string;
    estateId?: string;
    acpId?: string;
    accessType: string;
    createdAt: number;
    jti?: string;
}
export declare class TokenMappingService {
    private readonly cacheService;
    private readonly logger;
    private readonly CACHE_PREFIX;
    private readonly MAPPING_TTL;
    private readonly REVERSE_PREFIX;
    constructor(cacheService: CacheService, logger: Logger);
    private getMappingKey;
    private getReverseKey;
    createMappings(data: {
        userId: string;
        authId: string;
        accessType: string;
        jti?: string;
    }): Promise<{
        opaqueUserId: string;
        opaqueAuthId: string;
    }>;
    resolveMappings(opaqueIds: {
        opaqueUserId?: string;
        opaqueAuthId?: string;
        opaqueEstateId?: string;
        opaqueAcpId?: string;
    }): Promise<TokenMappingData | null>;
    revokeMappingsByRealId(realId: string, type: 'userId' | 'authId' | 'estateId' | 'acpId'): Promise<void>;
    revokeMapping(opaqueId: string): Promise<void>;
    extendMappingTTL(opaqueId: string, additionalSeconds?: number): Promise<void>;
}
