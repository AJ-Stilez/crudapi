import { AuthData } from 'src/enums/access_type';
import { Logger } from 'nestjs-pino';
import { TokenMappingService } from 'src/services/cache/token-mapping.services';
import { CacheService } from 'src/services/cache/cache.services';
import { DeviceSessionService } from 'src/services/device-session.service';
import { AuthService } from 'src/services/auth.service';
export type JwtUser = AuthData & {
    id: string;
    roles: string[];
};
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly logger;
    private readonly tokenMappingService;
    private readonly authService;
    private readonly cacheService;
    private readonly deviceSessionService;
    private readonly cacheKeyPrefix;
    private readonly rolesCacheKeyPrefix;
    private readonly cacheTTL;
    private readonly negativeCacheTTL;
    private readonly rolesCacheTTL;
    constructor(logger: Logger, tokenMappingService: TokenMappingService, authService: AuthService, cacheService: CacheService, deviceSessionService: DeviceSessionService);
    validate(payload: any): Promise<JwtUser>;
    private attachRoles;
}
export {};
