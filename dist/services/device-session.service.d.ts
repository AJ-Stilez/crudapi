import { Model } from 'mongoose';
import { DeviceSession, DeviceSessionDocument } from 'src/schema/class/device-session.schema.class';
import { Logger } from 'nestjs-pino';
import { CrudService } from 'src/services/core/crud.service';
export declare class DeviceSessionService extends CrudService<DeviceSessionDocument> {
    protected readonly logger: Logger;
    constructor(deviceSessionModel: Model<DeviceSessionDocument>, logger: Logger);
    createDeviceSession(userId: string, deviceInfo: {
        deviceId?: string;
        userAgent: string;
        ipAddress: string;
        deviceName?: string;
        deviceType?: string;
        osVersion?: string;
        location?: {
            country?: string;
            city?: string;
            region?: string;
        };
    }, jti?: string): Promise<DeviceSession>;
    getUserDeviceSessions(userId: string, includeInactive: boolean): Promise<DeviceSession[]>;
    logoutDevice(userId: string, deviceId: string): Promise<boolean>;
    logoutOtherDevices(userId: string, currentJti: string): Promise<number>;
    logoutAllDevices(userId: string): Promise<number>;
    updateActivity(jti: string): Promise<void>;
    cleanupExpiredSessions(): Promise<number>;
    getCurrentSession(jti: string): Promise<DeviceSession | null>;
    private generateDeviceId;
    private detectDeviceType;
    private extractOSVersion;
    private generateDeviceName;
}
