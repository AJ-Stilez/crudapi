import dayjs from 'dayjs';
import { Document } from 'mongoose';

export class NonDocumentDeviceSession {
  userId: string;
  deviceId: string; // Unique identifier for the device (can be provided by frontend)
  deviceName: string; // User-friendly device name
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  osVersion?: string; // Operating system version
  userAgent: string;
  ipAddress: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  isActive: boolean;
  lastActivityAt: ReturnType<typeof dayjs>;
  loginAt: ReturnType<typeof dayjs>;
  expiresAt: ReturnType<typeof dayjs>;
  jti?: string; // JWT ID for token tracking
}

export interface DeviceSession
  extends Readonly<NonDocumentDeviceSession>,
    Document {}
export class DeviceSessionSchemaClass extends NonDocumentDeviceSession {
  readonly id: string;
}
export type DeviceSessionDocument = DeviceSession & DeviceSessionSchemaClass;
export type CreateDeviceSessionAttributes = NonDocumentDeviceSession & {
  id?: string;
  _id?: string;
};
