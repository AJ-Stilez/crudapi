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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcryptjs_1 = __importDefault(require("../../node_modules/bcryptjs/umd/index.js"));
const jwt_1 = require("@nestjs/jwt");
const access_type_1 = require("../enums/access_type");
const nestjs_pino_1 = require("nestjs-pino");
const cache_services_1 = require("./cache/cache.services");
const security_constant_1 = require("../constants/security.constant");
const auth_cache_service_1 = require("./cache/auth-cache.service");
const helper_utils_1 = require("../utils/helper.utils");
const phone_utils_1 = require("../utils/phone.utils");
const uuid_1 = require("uuid");
const phone_exception_1 = require("../exception/phone.exception");
const crud_service_1 = require("./core/crud.service");
const error_utils_1 = require("../utils/error.utils");
const token_mapping_services_1 = require("./cache/token-mapping.services");
const device_session_service_1 = require("./device-session.service");
const password_utils_1 = require("../utils/password.utils");
const audit_config_utils_1 = require("../utils/audit-config.utils");
const audit_trails_utils_1 = require("../utils/audit-trails.utils");
const audit_trail_service_1 = require("./audit-trail.service");
const user_service_1 = require("./user.service");
const refresh_token_service_1 = require("./refresh-token.service");
function toUserResponse(user) {
    const u = user;
    return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        roles: u.roles,
    };
}
let AuthService = class AuthService extends crud_service_1.CrudService {
    authModel;
    cacheService;
    refreshTokenService;
    userService;
    jwtService;
    auditTrailService;
    authCacheService;
    logger;
    tokenMappingService;
    deviceSessionService;
    MAPPING_TTL = security_constant_1.TOKEN_MAPPING_TTL_SECONDS;
    AUTH_CACHE_PREFIX = 'auth:info:';
    JWT_SESSION_CACHE_PREFIX = 'jwt_session:';
    JWT_SESSION_CACHE_TTL = 300;
    JWT_ROLES_CACHE_PREFIX = 'jwt_roles:';
    constructor(authModel, cacheService, refreshTokenService, userService, jwtService, auditTrailService, authCacheService, logger, tokenMappingService, deviceSessionService) {
        super(authModel);
        this.authModel = authModel;
        this.cacheService = cacheService;
        this.refreshTokenService = refreshTokenService;
        this.userService = userService;
        this.jwtService = jwtService;
        this.auditTrailService = auditTrailService;
        this.authCacheService = authCacheService;
        this.logger = logger;
        this.tokenMappingService = tokenMappingService;
        this.deviceSessionService = deviceSessionService;
    }
    async createUser(createUser) {
        try {
            const { password, username, email } = createUser;
            const checkEmail = await this.authModel.findOne({ email });
            if (checkEmail)
                throw new common_1.BadRequestException('Email already exists');
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = new this.authModel({
                username,
                email,
                password: hashedPassword,
                roles: [access_type_1.AccessType.USER],
            });
            const savedUser = await user.save();
            const { password: _, ...safeUser } = savedUser.toObject();
            return safeUser;
        }
        catch (error) {
            return error;
        }
    }
    async authenticate(userType, identifier, password, deviceInfo) {
        this.logger.log('Login attempt', {
            userType,
            identifier: identifier?.includes('@')
                ? identifier
                : `${identifier?.slice(0, 4)}***`,
        });
        const auditConfig = this.setupAuditConfig(identifier, userType, deviceInfo);
        return (0, audit_trails_utils_1.trackProcess)(this.auditTrailService, auditConfig, async () => {
            try {
                const cached = await this.authCacheService.getUserData(identifier);
                const key = userType === access_type_1.AccessType.SUPER_ADMIN
                    ? 'userId'
                    : (0, helper_utils_1.isValidEmail)(identifier)
                        ? 'email'
                        : 'phone';
                let normalizedIdentifier = this.normalizeIdentifier(identifier, key);
                const authRecord = await this.validateAndGetAuthRecord(key, normalizedIdentifier, userType, password, identifier);
                this.logger.log('Auth record validated', {
                    userType,
                    userId: authRecord.userId?.toString?.(),
                    authId: authRecord._id?.toString?.(),
                });
                const userData = await this.fetchUserData(authRecord.userId, userType);
                this.logger.log('User data loaded for login', {
                    userType,
                    userId: authRecord.userId?.toString?.(),
                    hasUserData: !!userData,
                });
                const jti = (0, uuid_1.v4)();
                const { accessToken, refreshToken, deviceSession } = await this.generateTokensAndSession(authRecord.userId, authRecord._id.toString(), userType, jti, deviceInfo);
                const result = {
                    user: {
                        ...toUserResponse(userData),
                    },
                    accessToken,
                    refreshToken: refreshToken || undefined,
                    deviceSession: deviceSession || undefined,
                };
                this.logger.log('Login successful', {
                    userType: userType,
                    userId: authRecord.userId?.toString?.(),
                    userEmail: result.user?.email ?? '(none)',
                });
                return result;
            }
            catch (error) {
                const errMessage = error instanceof Error ? error.message : String(error);
                this.logger.error('Login failed', {
                    userType,
                    identifier: identifier?.includes('@')
                        ? identifier
                        : `${identifier?.slice(0, 4)}***`,
                    error: errMessage,
                    isHttpException: error instanceof common_1.HttpException,
                });
                if (error instanceof common_1.HttpException) {
                    throw error;
                }
                (0, error_utils_1.handleAndThrowError)(error, this.logger, 'Failed to authenticate user', undefined, undefined, `Failed to authenticate user; check credentials and try again; identifier: ${identifier}, userType: ${userType}`);
            }
        });
    }
    async generateTokensAndSession(userId, authId, userType, jti, deviceInfo) {
        let accessToken = null;
        let deviceSession = null;
        accessToken = await this.generateAccessToken({
            userId,
            authId,
            jti,
        }, userType);
        const sessionDeviceInfo = deviceInfo ?? {
            userAgent: 'unknown',
            ipAddress: 'unknown',
        };
        deviceSession = await this.deviceSessionService.createDeviceSession(userId, sessionDeviceInfo, jti);
        await this.cacheService.set(`${this.JWT_SESSION_CACHE_PREFIX}${jti}`, { isValid: true, jti }, this.JWT_SESSION_CACHE_TTL);
        this.logger.debug('Device session created for access token', {
            jti,
            userId,
            userType,
            sessionId: deviceSession?.id,
        });
        let refreshToken = null;
        if (deviceInfo) {
            refreshToken = await this.refreshTokenService.createRefreshToken(userId, authId, {
                deviceId: deviceInfo.deviceId,
                userAgent: deviceInfo.userAgent,
                ipAddress: deviceInfo.ipAddress,
            });
        }
        return {
            accessToken,
            refreshToken,
            deviceSession,
        };
    }
    async fetchUserData(userId, userType) {
        let userData;
        userData = await this.userService.getUserInfo(userId);
        if (!userData) {
            this.logger.warn('User data not found after auth validation', {
                userType,
                userId,
                message: userType === access_type_1.AccessType.ADMIN
                    ? 'Admin record missing (check Admin collection and seed)'
                    : userType === access_type_1.AccessType.GUARD
                        ? 'Guard record missing'
                        : 'User/Partner record missing',
            });
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('User data not found', common_1.HttpStatus.NOT_FOUND), this.logger, 'User data not found');
        }
        return userData.toObject ? userData.toObject() : userData;
    }
    async createDeviceSessionForNewUser(userId, jti, deviceInfo) {
        return this.deviceSessionService.createDeviceSession(userId, {
            userAgent: deviceInfo.userAgent,
            ipAddress: deviceInfo.ipAddress,
        }, jti);
    }
    async refreshAccessToken(encryptedRefreshToken, deviceInfo) {
        return this.refreshTokenService.refreshAccessToken(encryptedRefreshToken, deviceInfo);
    }
    setupAuditConfig(identifier, userType, deviceInfo) {
        const auditConfig = (0, audit_config_utils_1.createUserLoginAuditConfig)(undefined, {
            userType,
            identifier: identifier.includes('@') ? identifier : '***',
            hasDeviceInfo: !!deviceInfo,
        });
        auditConfig.userIdExtractor = (result) => {
            if (result?.user?.id) {
                return typeof result.user.id === 'string'
                    ? result.user.id
                    : String(result.user.id);
            }
            return undefined;
        };
        return auditConfig;
    }
    normalizeIdentifier(identifier, key) {
        if (key !== 'phone') {
            return identifier;
        }
        try {
            return (0, phone_utils_1.normalizePhoneNumber)(identifier);
        }
        catch (error) {
            if (error instanceof phone_exception_1.InvalidPhoneFormatException ||
                error instanceof phone_exception_1.UnsupportedCountryException ||
                error instanceof phone_exception_1.PhoneTooShortException ||
                error instanceof phone_exception_1.PhoneTooLongException ||
                error instanceof phone_exception_1.InvalidPhoneCharactersException) {
                this.logger.warn(`Phone validation failed during authentication: ${identifier}, error: ${error.message}`, {
                    phone: identifier,
                    errorCode: error.code,
                    suggestion: error.suggestion,
                });
            }
            else {
                this.logger.warn(`Failed to normalize phone number during authentication: ${identifier}, error: ${error.message}`);
            }
            return identifier;
        }
    }
    async setImmediate() {
        console.log('Trying to set immediate');
        setImmediate(() => console.log('Set Immediate'));
        console.log('I returned before the set immediate response');
        const response = 'Return response';
        return response;
    }
    async authenticateUser(identifier, password, userType) {
        try {
            const key = (0, helper_utils_1.isValidEmail)(identifier) ? 'email' : 'phone';
            const value = identifier;
            console.log('Key:', key, identifier);
            const user = await this.validateAndGetAuthRecord(key, identifier, userType, password, identifier);
            if (!user) {
                this.logger.error(`[Auth Service] User with ${(0, helper_utils_1.isValidEmail)(identifier) ? 'email' : 'phone number'} ${identifier} not found`);
                throw new common_1.BadRequestException('User not found');
            }
            const payload = {
                sub: user.id,
                email: user.email,
                roles: user.roles,
                permissions: user.permissions,
            };
            const accessToken = await this.generateAccessToken(payload, userType, this.MAPPING_TTL);
            const { password: _, __v: _v, ...safeUser } = user;
            return {
                ...safeUser,
                accessToken,
            };
        }
        catch (error) {
            const errMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Login failed', {
                error: errMessage,
                isHttpException: error instanceof common_1.HttpException,
            });
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            (0, error_utils_1.handleAndThrowError)(error, this.logger, 'Failed to authenticate user', undefined, undefined, 'Falied to authenticate user check credentials and try again');
        }
    }
    async validateAndGetAuthRecord(key, normalizedIdentifier, userType, password, identifier) {
        const existingAuth = await this.findOne({ [key]: normalizedIdentifier, userType }, { select: 'id userId phone email userType' });
        if (!existingAuth) {
            this.logger.warn(`Authentication failed: No auth record found for ${key}=${normalizedIdentifier}, userType=${userType}`);
            if (key === 'phone') {
                const alternativeFormats = [
                    identifier,
                    identifier.startsWith('+')
                        ? identifier.substring(1)
                        : `+${identifier}`,
                ];
                for (const format of alternativeFormats) {
                    const altAuth = await this.findOne({ phone: format, userType }, { select: 'id userId phone email userType' });
                    if (altAuth) {
                        this.logger.warn(`Found user with alternative phone format: ${format} (original: ${identifier}, normalized: ${normalizedIdentifier})`);
                        break;
                    }
                }
            }
        }
        console.log('Hey', key, normalizedIdentifier);
        const authRecord = await this.findOneOrThrowException({ [key]: normalizedIdentifier, userType }, common_1.HttpStatus.UNAUTHORIZED, 'Invalid credentials', {
            select: 'id userId password userType assignedEstates lastSignedInEstate',
            lean: true,
        });
        console.log('AuthRecord:', authRecord);
        const valid = await (0, password_utils_1.verifyPassword)(authRecord.password, password);
        console.log('IsValllllid:', valid);
        if (!valid) {
            return (0, error_utils_1.handleAndThrowError)(new common_1.HttpException('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED), this.logger, 'Invalid credentials');
        }
        return authRecord;
    }
    async generateAccessToken(payload, accessType, expires) {
        const userId = payload.userId;
        const authId = payload.authId || payload.userId;
        const jti = payload.jti || (0, uuid_1.v4)();
        const mappings = await this.tokenMappingService.createMappings({
            userId,
            authId,
            accessType,
            jti,
        });
        const tokenPayload = {
            ...payload,
            userId: mappings.opaqueUserId,
            authId: mappings.opaqueAuthId,
            jti,
            metadata: accessType,
        };
        const expiresInSeconds = typeof expires === 'string' ? parseInt(expires, 10) : (expires ?? 3600);
        const options = {
            algorithm: 'HS256',
            expiresIn: expiresInSeconds,
        };
        const token = this.jwtService.sign(tokenPayload, options);
        return token;
    }
    remove(id) {
        return `This action removes a #${id} auth`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Auth')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cache_services_1.CacheService,
        refresh_token_service_1.RefreshTokenService,
        user_service_1.UserService,
        jwt_1.JwtService,
        audit_trail_service_1.AuditTrailService,
        auth_cache_service_1.AuthCacheService,
        nestjs_pino_1.Logger,
        token_mapping_services_1.TokenMappingService,
        device_session_service_1.DeviceSessionService])
], AuthService);
//# sourceMappingURL=auth.service.js.map