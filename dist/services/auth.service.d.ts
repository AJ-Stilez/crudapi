import { CreateAuthDto } from '../dtos/create-user.dto';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { AccessType } from 'src/enums/access_type';
import { Logger } from 'nestjs-pino';
import { CacheService } from './cache/cache.services';
import { UserResponse } from 'src/types/auth.types';
import { AuthCacheService } from './cache/auth-cache.service';
import { AuthDocument } from 'src/schema/class/auth.schema.class';
import { CrudService } from './core/crud.service';
import { TokenMappingService } from './cache/token-mapping.services';
import { DeviceSession } from 'src/schema/class/device-session.schema.class';
import { DeviceSessionService } from './device-session.service';
import { AuditTrailService } from './audit-trail.service';
import { UserService } from './user.service';
import { RefreshTokenService } from './refresh-token.service';
export declare class AuthService extends CrudService<AuthDocument> {
    private readonly authModel;
    private cacheService;
    private refreshTokenService;
    private userService;
    private jwtService;
    private auditTrailService;
    private authCacheService;
    private readonly logger;
    private tokenMappingService;
    private deviceSessionService;
    private readonly MAPPING_TTL;
    private readonly AUTH_CACHE_PREFIX;
    private readonly JWT_SESSION_CACHE_PREFIX;
    private readonly JWT_SESSION_CACHE_TTL;
    private readonly JWT_ROLES_CACHE_PREFIX;
    constructor(authModel: Model<AuthDocument>, cacheService: CacheService, refreshTokenService: RefreshTokenService, userService: UserService, jwtService: JwtService, auditTrailService: AuditTrailService, authCacheService: AuthCacheService, logger: Logger, tokenMappingService: TokenMappingService, deviceSessionService: DeviceSessionService);
    createUser(createUser: CreateAuthDto): Promise<any>;
    authenticate(userType: AccessType, identifier: string, password: string, deviceInfo?: {
        deviceId?: string;
        userAgent: string;
        ipAddress: string;
        deviceName?: string;
        osVersion?: string;
        location?: {
            country?: string;
            city?: string;
            region?: string;
        };
    }): Promise<{
        user: UserResponse;
        accessToken: string | null;
        refreshToken?: string | null;
        deviceSession?: DeviceSession;
    }>;
    private generateTokensAndSession;
    private fetchUserData;
    createDeviceSessionForNewUser(userId: string, jti: string, deviceInfo: {
        userAgent: string;
        ipAddress: string;
    }): Promise<DeviceSession>;
    refreshAccessToken(encryptedRefreshToken: string, deviceInfo?: {
        deviceId?: string;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<{
        userId: string;
        authId: string;
        newRefreshToken: string;
    }>;
    private setupAuditConfig;
    private normalizeIdentifier;
    setImmediate(): Promise<String>;
    authenticateUser(identifier: string, password: string, userType: AccessType): Promise<{
        accessToken: string;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        userId: string;
        identifier: string;
        email?: string;
        phone?: string;
        phoneConfirmedAt?: ReturnType<typeof import("dayjs")>;
        emailConfirmedAt?: ReturnType<typeof import("dayjs")>;
        roles: string[];
        permissions: string[];
        userType?: AccessType;
    }>;
    private validateAndGetAuthRecord;
    generateAccessToken(payload: Record<string, any>, accessType: AccessType, expires?: string | number): Promise<string>;
    remove(id: number): string;
}
