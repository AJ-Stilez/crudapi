import dayjs from 'dayjs';
import { Document } from 'mongoose';
export declare class NonDocumentDeviceSession {
    userId: string;
    deviceId: string;
    deviceName: string;
    deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
    osVersion?: string;
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
    jti?: string;
}
export interface DeviceSession extends Readonly<NonDocumentDeviceSession>, Document {
}
export declare class DeviceSessionSchemaClass extends NonDocumentDeviceSession {
    readonly id: string;
}
export type DeviceSessionDocument = DeviceSession & DeviceSessionSchemaClass;
export type CreateDeviceSessionAttributes = NonDocumentDeviceSession & {
    id?: string;
    _id?: string;
};
