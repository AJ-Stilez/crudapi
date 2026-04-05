import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeviceSession,
  DeviceSessionDocument,
  DeviceSessionSchemaClass,
} from 'src/schema/class/device-session.schema.class';
import { Logger } from 'nestjs-pino';
import dayjs from 'dayjs';
import { CrudService } from 'src/services/core/crud.service';
import crypto from 'crypto';

@Injectable()
export class DeviceSessionService extends CrudService<
  DeviceSessionDocument >{
  constructor(
    @InjectModel('DeviceSession')
    deviceSessionModel: Model<DeviceSessionDocument>,
    protected readonly logger: Logger,
  ) {
    super(deviceSessionModel);
  }

  /**
   * Creates a new device session
   */
  async createDeviceSession(
    userId: string,
    deviceInfo: {
      deviceId?: string; // Optional deviceId from frontend
      userAgent: string;
      ipAddress: string;
      deviceName?: string;
      deviceType?: string;
      osVersion?: string;
      location?: { country?: string; city?: string; region?: string };
    },
    jti?: string,
  ): Promise<DeviceSession> {
    // Use provided deviceId or generate one
    const deviceId =
      deviceInfo.deviceId ||
      this.generateDeviceId(deviceInfo.userAgent, deviceInfo.ipAddress);
    const deviceType =
      deviceInfo.deviceType || this.detectDeviceType(deviceInfo.userAgent);
    const deviceName =
      deviceInfo.deviceName ||
      this.generateDeviceName(deviceType, deviceInfo.userAgent);
    const osVersion =
      deviceInfo.osVersion || this.extractOSVersion(deviceInfo.userAgent);

    // Check if session already exists for this device
    const existingSession = await this.findOne({
      userId,
      deviceId,
      isActive: true,
    });

    if (existingSession) {
      // Update existing session
      return this.findByIdAndUpdate(existingSession.id, {
        lastActivityAt: dayjs().toDate(),
        expiresAt: dayjs().add(60, 'minutes').toDate(),
        jti,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        location: deviceInfo.location,
        deviceName,
        deviceType,
        osVersion,
      });
    }

    // Mark all other sessions as not current
    await this.updateMany(
      { userId, isActive: true },
      { isCurrentSession: false },
    );

    // Create new session (use .toDate() so Mongoose persists proper Date values for query matching)
    return this.create({
      userId,
      deviceId,
      deviceName,
      deviceType,
      osVersion,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      location: deviceInfo.location,
      isActive: true,
      lastActivityAt: dayjs().toDate(),
      loginAt: dayjs().toDate(),
      expiresAt: dayjs().add(60, 'minutes').toDate(),
      jti,
    });
  }

  /**
   * Get sessions for a user
   */
  async getUserDeviceSessions(
    userId: string,
    includeInactive: boolean,
  ): Promise<DeviceSession[]> {
    return this.findAllNoPaginate(
      {
        userId,
        isActive: !includeInactive,
        ...(includeInactive
          ? {}
          : {
              expiresAt: { $gt: dayjs() },
            }),
      },
      undefined,
      undefined,
      { sort: 'lastActivityAt:-1' },
    );
  }

  /**
   * Logout from a specific device
   */
  async logoutDevice(userId: string, deviceId: string): Promise<boolean> {
    const result = await this.updateMany(
      { userId, deviceId, isActive: true },
      { isActive: false },
    );
    return result.modifiedCount > 0;
  }

  /**
   * Logout from all OTHER devices (excluding current session)
   */
  async logoutOtherDevices(
    userId: string,
    currentJti: string,
  ): Promise<number> {
    const result = await this.updateMany(
      {
        userId,
        isActive: true,
        jti: { $ne: currentJti }, // Exclude current session
      },
      { isActive: false },
    );
    return result.modifiedCount;
  }

  /**
   * Logout from all devices (including current session)
   */
  async logoutAllDevices(userId: string): Promise<number> {
    const result = await this.updateMany(
      { userId, isActive: true },
      { isActive: false },
    );
    return result.modifiedCount;
  }

  /**
   * Update session activity and mark as current
   */
  async updateActivity(jti: string): Promise<void> {
    const session = await this.findOne({ jti, isActive: true });
    if (session) {
      // Mark this session as current and others as not current
      await this.updateMany(
        { userId: session.userId, isActive: true },
        { isCurrentSession: false },
      );

      // Update current session
      await this.updateMany(
        { jti, isActive: true },
        {
          lastActivityAt: dayjs().toDate(),
          isCurrentSession: true,
        },
      );
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: dayjs().toDate() },
      },
      { isActive: false },
    );
    return result.modifiedCount;
  }

  /**
   * Get current session by JTI
   */
  async getCurrentSession(jti: string): Promise<DeviceSession | null> {
    return this.findOne({
      jti,
      isActive: true,
      expiresAt: { $gt: dayjs().toDate() },
    });
  }

  /**
   * Generate device ID based on user agent and IP
   */
  private generateDeviceId(userAgent: string, ipAddress: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${userAgent}:${ipAddress}`)
      .digest('hex');
    return hash.substring(0, 16);
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(
    userAgent: string,
  ): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
    const ua = userAgent.toLowerCase();

    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
      return 'mobile';
    }

    if (/tablet|ipad|kindle|silk/i.test(ua)) {
      return 'tablet';
    }

    if (/windows|macintosh|linux|x11/i.test(ua)) {
      return 'desktop';
    }

    return 'unknown';
  }

  /**
   * Extract OS version from user agent
   */
  private extractOSVersion(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    // Windows
    if (/windows nt (\d+\.\d+)/i.test(ua)) {
      const match = ua.match(/windows nt (\d+\.\d+)/i);
      if (match) {
        const version = match[1];
        const versionMap: { [key: string]: string } = {
          '10.0': 'Windows 10',
          '6.3': 'Windows 8.1',
          '6.2': 'Windows 8',
          '6.1': 'Windows 7',
          '6.0': 'Windows Vista',
          '5.2': 'Windows XP',
        };
        return versionMap[version] || `Windows ${version}`;
      }
    }

    // macOS
    if (/mac os x (\d+[._]\d+)/i.test(ua)) {
      const match = ua.match(/mac os x (\d+[._]\d+)/i);
      if (match) {
        return `macOS ${match[1].replace('_', '.')}`;
      }
    }

    // iOS
    if (/os (\d+[._]\d+)/i.test(ua) && /iphone|ipad|ipod/i.test(ua)) {
      const match = ua.match(/os (\d+[._]\d+)/i);
      if (match) {
        return `iOS ${match[1].replace('_', '.')}`;
      }
    }

    // Android
    if (/android (\d+\.\d+)/i.test(ua)) {
      const match = ua.match(/android (\d+\.\d+)/i);
      if (match) {
        return `Android ${match[1]}`;
      }
    }

    // Linux
    if (/linux/i.test(ua)) {
      return 'Linux';
    }

    return 'Unknown';
  }

  /**
   * Generate device name from device type and user agent
   */
  private generateDeviceName(deviceType: string, userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (deviceType === 'mobile') {
      if (/iphone/i.test(ua)) return 'iPhone';
      if (/android/i.test(ua)) return 'Android Phone';
      return 'Mobile Device';
    }

    if (deviceType === 'tablet') {
      if (/ipad/i.test(ua)) return 'iPad';
      if (/android/i.test(ua)) return 'Android Tablet';
      return 'Tablet';
    }

    if (deviceType === 'desktop') {
      if (/windows/i.test(ua)) return 'Windows PC';
      if (/macintosh/i.test(ua)) return 'Mac';
      if (/linux/i.test(ua)) return 'Linux PC';
      return 'Desktop';
    }

    return 'Unknown Device';
  }
}
