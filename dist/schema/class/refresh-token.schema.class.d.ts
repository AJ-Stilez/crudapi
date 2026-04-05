import dayjs from 'dayjs';
import { Document } from 'mongoose';
export declare class NonDocumentRefreshToken {
    tokenId: string;
    userId: string;
    authId: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: ReturnType<typeof dayjs>;
    firstIssuedAt: ReturnType<typeof dayjs>;
    lastUsedAt?: ReturnType<typeof dayjs>;
    refreshCount: number;
    lastRefreshAt?: ReturnType<typeof dayjs>;
    isRevoked: boolean;
    revokedAt?: ReturnType<typeof dayjs>;
    revokedReason?: string;
}
export interface RefreshToken extends Readonly<NonDocumentRefreshToken>, Document {
}
export declare class RefreshTokenSchemaClass extends NonDocumentRefreshToken {
    readonly id: string;
}
export type RefreshTokenDocument = RefreshToken & RefreshTokenSchemaClass;
