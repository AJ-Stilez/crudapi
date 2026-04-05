import { AccessType } from 'src/enums/access_type';
export declare class AuthenticateValidator {
    identifier: string;
    password: string;
    userType: AccessType;
    deviceId?: string;
    deviceName?: string;
    deviceType?: 'mobile' | 'desktop' | 'tablet' | 'unknown';
    osVersion?: string;
}
