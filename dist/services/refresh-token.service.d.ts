import { CrudService } from './core/crud.service';
import type { RefreshToken, RefreshTokenDocument } from 'src/schema/class/refresh-token.schema.class';
import { Logger } from 'nestjs-pino';
import { Model } from 'mongoose';
import { AuditTrailService } from './audit-trail.service';
export declare class RefreshTokenService extends CrudService<RefreshTokenDocument> {
    private readonly refreshTokenModel;
    private readonly logger;
    private readonly auditTrailService;
    constructor(refreshTokenModel: Model<RefreshTokenDocument>, logger: Logger, auditTrailService: AuditTrailService);
    createRefreshToken(userId: string, authId: string, deviceInfo?: {
        deviceId?: string;
        userAgent?: string;
        ipAddress?: string;
    }, firstIssuedAt?: Date): Promise<string>;
    refreshAccessToken(encryptedRefreshToken: string, deviceInfo?: {
        deviceId?: string;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<{
        userId: string;
        authId: string;
        newRefreshToken: string;
    }>;
    private validateRefreshTokenExpiration;
    revokeRefreshToken(tokenId: string, reason?: string): Promise<void>;
    revokeAllUserTokens(userId: string, reason?: string): Promise<void>;
    private validateIpAddress;
    validateRefreshToken(tokenId: string, deviceInfo?: {
        deviceId?: string;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<RefreshToken | RefreshTokenDocument>;
}
