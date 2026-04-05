import dayjs from 'dayjs';
import { createSchema } from 'src/utils/mongoose-schema.utils';
import { DeviceSessionSchemaClass } from 'src/schema/class/device-session.schema.class';

export const DeviceSessionSchemaModel = createSchema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      index: true,
    },
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet', 'unknown'],
      default: 'unknown',
    },
    osVersion: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      city: String,
      region: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActivityAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      default: () => dayjs().toDate(),
      index: true,
    },
    loginAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      default: () => dayjs().toDate(),
      index: true,
    },
    expiresAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      required: true,
      index: true,
    },
    jti: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    loadClass: DeviceSessionSchemaClass,
    softDelete: true,
    auditFields: true,
    indexes: [
      { fields: { userId: 1, isActive: 1 } },
      { fields: { deviceId: 1 } },
      { fields: { jti: 1 } },
      { fields: { expiresAt: 1 } },
      { fields: { lastActivityAt: -1 } },
      { fields: { createdAt: -1 } },
      { fields: { userId: 1, isCurrentSession: 1 } },
    ],
  },
);
