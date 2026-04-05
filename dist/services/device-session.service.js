"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSessionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const nestjs_pino_1 = require("nestjs-pino");
const dayjs_1 = __importDefault(require("dayjs"));
const crud_service_1 = require("./core/crud.service");
const crypto_1 = __importDefault(require("crypto"));
let DeviceSessionService = class DeviceSessionService extends crud_service_1.CrudService {
    logger;
    constructor(deviceSessionModel, logger) {
        super(deviceSessionModel);
        this.logger = logger;
    }
    async createDeviceSession(userId, deviceInfo, jti) {
        const deviceId = deviceInfo.deviceId ||
            this.generateDeviceId(deviceInfo.userAgent, deviceInfo.ipAddress);
        const deviceType = deviceInfo.deviceType || this.detectDeviceType(deviceInfo.userAgent);
        const deviceName = deviceInfo.deviceName ||
            this.generateDeviceName(deviceType, deviceInfo.userAgent);
        const osVersion = deviceInfo.osVersion || this.extractOSVersion(deviceInfo.userAgent);
        const existingSession = await this.findOne({
            userId,
            deviceId,
            isActive: true,
        });
        if (existingSession) {
            return this.findByIdAndUpdate(existingSession.id, {
                lastActivityAt: (0, dayjs_1.default)().toDate(),
                expiresAt: (0, dayjs_1.default)().add(60, 'minutes').toDate(),
                jti,
                userAgent: deviceInfo.userAgent,
                ipAddress: deviceInfo.ipAddress,
                location: deviceInfo.location,
                deviceName,
                deviceType,
                osVersion,
            });
        }
        await this.updateMany({ userId, isActive: true }, { isCurrentSession: false });
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
            lastActivityAt: (0, dayjs_1.default)().toDate(),
            loginAt: (0, dayjs_1.default)().toDate(),
            expiresAt: (0, dayjs_1.default)().add(60, 'minutes').toDate(),
            jti,
        });
    }
    async getUserDeviceSessions(userId, includeInactive) {
        return this.findAllNoPaginate({
            userId,
            isActive: !includeInactive,
            ...(includeInactive
                ? {}
                : {
                    expiresAt: { $gt: (0, dayjs_1.default)() },
                }),
        }, undefined, undefined, { sort: 'lastActivityAt:-1' });
    }
    async logoutDevice(userId, deviceId) {
        const result = await this.updateMany({ userId, deviceId, isActive: true }, { isActive: false });
        return result.modifiedCount > 0;
    }
    async logoutOtherDevices(userId, currentJti) {
        const result = await this.updateMany({
            userId,
            isActive: true,
            jti: { $ne: currentJti },
        }, { isActive: false });
        return result.modifiedCount;
    }
    async logoutAllDevices(userId) {
        const result = await this.updateMany({ userId, isActive: true }, { isActive: false });
        return result.modifiedCount;
    }
    async updateActivity(jti) {
        const session = await this.findOne({ jti, isActive: true });
        if (session) {
            await this.updateMany({ userId: session.userId, isActive: true }, { isCurrentSession: false });
            await this.updateMany({ jti, isActive: true }, {
                lastActivityAt: (0, dayjs_1.default)().toDate(),
                isCurrentSession: true,
            });
        }
    }
    async cleanupExpiredSessions() {
        const result = await this.updateMany({
            isActive: true,
            expiresAt: { $lt: (0, dayjs_1.default)().toDate() },
        }, { isActive: false });
        return result.modifiedCount;
    }
    async getCurrentSession(jti) {
        return this.findOne({
            jti,
            isActive: true,
            expiresAt: { $gt: (0, dayjs_1.default)().toDate() },
        });
    }
    generateDeviceId(userAgent, ipAddress) {
        const hash = crypto_1.default
            .createHash('sha256')
            .update(`${userAgent}:${ipAddress}`)
            .digest('hex');
        return hash.substring(0, 16);
    }
    detectDeviceType(userAgent) {
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
    extractOSVersion(userAgent) {
        const ua = userAgent.toLowerCase();
        if (/windows nt (\d+\.\d+)/i.test(ua)) {
            const match = ua.match(/windows nt (\d+\.\d+)/i);
            if (match) {
                const version = match[1];
                const versionMap = {
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
        if (/mac os x (\d+[._]\d+)/i.test(ua)) {
            const match = ua.match(/mac os x (\d+[._]\d+)/i);
            if (match) {
                return `macOS ${match[1].replace('_', '.')}`;
            }
        }
        if (/os (\d+[._]\d+)/i.test(ua) && /iphone|ipad|ipod/i.test(ua)) {
            const match = ua.match(/os (\d+[._]\d+)/i);
            if (match) {
                return `iOS ${match[1].replace('_', '.')}`;
            }
        }
        if (/android (\d+\.\d+)/i.test(ua)) {
            const match = ua.match(/android (\d+\.\d+)/i);
            if (match) {
                return `Android ${match[1]}`;
            }
        }
        if (/linux/i.test(ua)) {
            return 'Linux';
        }
        return 'Unknown';
    }
    generateDeviceName(deviceType, userAgent) {
        const ua = userAgent.toLowerCase();
        if (deviceType === 'mobile') {
            if (/iphone/i.test(ua))
                return 'iPhone';
            if (/android/i.test(ua))
                return 'Android Phone';
            return 'Mobile Device';
        }
        if (deviceType === 'tablet') {
            if (/ipad/i.test(ua))
                return 'iPad';
            if (/android/i.test(ua))
                return 'Android Tablet';
            return 'Tablet';
        }
        if (deviceType === 'desktop') {
            if (/windows/i.test(ua))
                return 'Windows PC';
            if (/macintosh/i.test(ua))
                return 'Mac';
            if (/linux/i.test(ua))
                return 'Linux PC';
            return 'Desktop';
        }
        return 'Unknown Device';
    }
};
exports.DeviceSessionService = DeviceSessionService;
exports.DeviceSessionService = DeviceSessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('DeviceSession')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        nestjs_pino_1.Logger])
], DeviceSessionService);
//# sourceMappingURL=device-session.service.js.map