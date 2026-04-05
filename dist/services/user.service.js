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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const crud_service_1 = require("./core/crud.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const access_type_1 = require("../enums/access_type");
const audit_config_utils_1 = require("../utils/audit-config.utils");
const audit_trails_utils_1 = require("../utils/audit-trails.utils");
const audit_trail_service_1 = require("./audit-trail.service");
const error_utils_1 = require("../utils/error.utils");
const nestjs_pino_1 = require("nestjs-pino");
const password_utils_1 = require("../utils/password.utils");
const phone_utils_1 = require("../utils/phone.utils");
const dayjs_1 = __importDefault(require("dayjs"));
const cache_services_1 = require("./cache/cache.services");
let UserService = class UserService extends crud_service_1.CrudService {
    userModel;
    cacheService;
    auditTrailService;
    logger;
    USER_CACHE_PREFIX = 'user:info:';
    constructor(userModel, cacheService, auditTrailService, logger) {
        super(userModel);
        this.userModel = userModel;
        this.cacheService = cacheService;
        this.auditTrailService = auditTrailService;
        this.logger = logger;
    }
    getUserCacheTtl() {
        return parseInt(process.env.USER_CACHE_TTL || '300', 10) || 300;
    }
    async createUser(userData, userType = access_type_1.AccessType.USER, tokenId, otpCode, selfie = []) {
        const auditConfig = (0, audit_config_utils_1.createUserCreationAuditConfig)(undefined, {
            userType,
            hasToken: !!tokenId,
            hasSelfie: selfie.length > 0,
        });
        auditConfig.userIdExtractor = (result) => {
            if (result?.user?.id) {
                return typeof result.user.id === 'string'
                    ? result.user.id
                    : String(result.user.id);
            }
            return undefined;
        };
        return (0, audit_trails_utils_1.trackProcess)(this.auditTrailService, auditConfig, async (userDataArg) => {
            try {
                const key = userData.email ? 'email' : 'phone';
                const value = userData.email ? userData.email : userData.phone;
                const account = await this.findOne({ [key]: value, userType: userType }, { select: 'id' });
                if (account) {
                    return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Account already exists', common_1.HttpStatus.BAD_REQUEST), this.logger, 'Account already exists');
                }
                const password = await (0, password_utils_1.hashPassword)(userData.password);
                let countryCode = userData.countryCode;
                let normalizedPhone = userData.phone;
                if (userData.phone) {
                    let validation;
                    if (countryCode) {
                        validation = (0, phone_utils_1.validateLocalPhoneNumber)(userData.phone, countryCode);
                    }
                    else {
                        validation = (0, phone_utils_1.validatePhoneNumber)(userData.phone);
                    }
                    if (!validation.isValid) {
                        const errorMessage = validation.error || 'Invalid phone number format';
                        return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException(`Invalid phone number: ${errorMessage}`, common_1.HttpStatus.BAD_REQUEST), this.logger, `Phone validation failed: ${errorMessage}`);
                    }
                    if (!countryCode) {
                        const { countryCode: extractedCode } = (0, phone_utils_1.extractCountryCode)(userData.phone);
                        countryCode = extractedCode;
                    }
                    const startTime = (0, dayjs_1.default)().valueOf();
                }
                let selfiePhotoId = null;
                let selfiePhotoUrl = null;
                const user = await this.create({
                    ...userData,
                    phone: normalizedPhone,
                    countryCode,
                    password,
                    selfiePhotoId,
                    selfiePhotoUrl,
                });
                return { user, token: null };
            }
            catch (error) {
                (0, error_utils_1.handleAndThrowError)(error, this.logger, 'Error Creating User');
            }
        }, userData);
    }
    async getUserInfo(userId) {
        const cacheKey = `${this.USER_CACHE_PREFIX}${userId}`;
        return await this.cacheService.getOrSet(cacheKey, async () => {
            return await this.findOneOrThrowException({
                _id: userId,
            }, common_1.HttpStatus.EXPECTATION_FAILED, 'Unable find user', {
                select: 'id firstName lastName email phone countryCode selfiePhotoUrl emailConfirmedAt phoneConfirmedAt userType',
            });
        }, this.getUserCacheTtl());
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cache_services_1.CacheService,
        audit_trail_service_1.AuditTrailService,
        nestjs_pino_1.Logger])
], UserService);
//# sourceMappingURL=user.service.js.map