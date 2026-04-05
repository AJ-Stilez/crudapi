import dayjs from 'dayjs';
import { Document } from 'mongoose';

export class NonDocumentRefreshToken {
  tokenId: string; // Opaque UUID (what's in the token)
  userId: string; // Real user ID
  authId: string; // Real auth ID
  deviceId?: string; // Device identifier for binding
  userAgent?: string; // For security tracking
  ipAddress?: string; // For security tracking
  expiresAt: ReturnType<typeof dayjs>; // Fixed expiration date (not sliding)
  firstIssuedAt: ReturnType<typeof dayjs>; // When token was first created (for max lifetime)
  lastUsedAt?: ReturnType<typeof dayjs>; // Last time token was used (for inactivity check)
  refreshCount: number; // Number of times token has been used (for rate limiting)
  lastRefreshAt?: ReturnType<typeof dayjs>; // Last refresh timestamp
  isRevoked: boolean;
  revokedAt?: ReturnType<typeof dayjs>;
  revokedReason?: string; // 'user_logout', 'password_change', 'security_incident', 'expired', 'max_lifetime_reached', 'inactivity', 'rate_limit'
}

export interface RefreshToken
  extends Readonly<NonDocumentRefreshToken>,
    Document {}
export class RefreshTokenSchemaClass extends NonDocumentRefreshToken {
  readonly id: string;
}
export type RefreshTokenDocument = RefreshToken & RefreshTokenSchemaClass;