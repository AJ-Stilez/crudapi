import dayjs from 'dayjs';
import { createSchema } from 'src/utils/mongoose-schema.utils';
import { RefreshTokenSchemaClass } from 'src/schema/class/refresh-token.schema.class';
import { REFRESH_TOKEN_EXPIRATION_HOURS } from 'src/constants/security.constant';


export const RefreshTokenSchemaModel = createSchema(
  {
    tokenId: {
      type: String,
      required: [true, 'Token ID is required'],
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    authId: {
      type: String,
      required: [true, 'Auth ID is required'],
      index: true,
    },
    deviceId: {
      type: String,
      required: false,
      index: true,
    },
    userAgent: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    expiresAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
      default: () =>
        dayjs().add(REFRESH_TOKEN_EXPIRATION_HOURS, 'hour').toDate(),
    },
    firstIssuedAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      required: [true, 'First issued date is required'],
      index: true,
      default: () => dayjs().toDate(),
    },
    lastUsedAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      required: false,
    },
    refreshCount: {
      type: Number,
      default: 0,
      required: true,
    },
    lastRefreshAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      required: false,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      required: false,
    },
    revokedReason: {
      type: String,
      required: false,
      enum: [
        'user_logout',
        'password_change',
        'security_incident',
        'expired',
        'max_lifetime_reached',
        'inactivity',
        'rate_limit',
        'token_reuse_detected',
        'device_mismatch',
        'ip_mismatch',
      ],
    },
  },
  {
    loadClass: RefreshTokenSchemaClass,
    indexes: [
      { fields: { tokenId: 1 }, options: { unique: true } },
      { fields: { userId: 1, isRevoked: 1 } },
      { fields: { expiresAt: 1 } },
      { fields: { firstIssuedAt: 1 } },
      { fields: { lastUsedAt: 1 } },
      { fields: { deviceId: 1 } },
      { fields: { createdAt: -1 } },
    ],
  },
);
