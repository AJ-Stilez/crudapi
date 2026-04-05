"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenMongooseFactoriesLoader = exports.DeviceSessionMongooseFactoriesLoader = exports.AuditTrailMongooseFactoriesLoader = exports.AuthMongooseFactoriesLoader = exports.UserMongooseFactoriesLoader = exports.MongooseModuleLoader = void 0;
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const nestjs_pino_1 = require("nestjs-pino");
const mongoose_config_1 = require("../config/mongoose.config");
const audit_trail_schema_model_1 = require("../schema/model/audit-trail.schema.model");
const auth_schema_model_1 = require("../schema/model/auth.schema.model");
const device_session_schema_model_1 = require("../schema/model/device-session.schema.model");
const refresh_token_schema_model_1 = require("../schema/model/refresh-token.schema.model");
const user_schema_model_1 = require("../schema/model/user.schema.model");
exports.MongooseModuleLoader = mongoose_1.MongooseModule.forRootAsync({
    imports: [config_1.ConfigModule, nestjs_pino_1.LoggerModule],
    useFactory: async (configService, logger) => {
        const config = (0, mongoose_config_1.getMongooseConfig)(configService, logger);
        return {
            ...config,
            connectionFactory: (connection) => {
                if (connection.readyState === 1) {
                    logger.log('[Mongoose Loader] Already connected to MongoDB');
                }
                connection.on('connected', () => {
                    logger.log('[Mongoose Loader] Connected to MongoDB');
                });
                connection.on('disconnected', () => {
                    logger.log('[Mongoose Loader] Disconnected from MongoDB');
                });
                connection.on('error', (err) => {
                    logger.error('[Mongoose Loader] Connection error:', err);
                });
                return connection;
            },
        };
    },
    inject: [config_1.ConfigService, nestjs_pino_1.Logger],
});
exports.UserMongooseFactoriesLoader = mongoose_1.MongooseModule.forFeatureAsync([
    {
        name: 'User',
        useFactory: () => {
            return user_schema_model_1.UserSchemaModel;
        },
    },
]);
exports.AuthMongooseFactoriesLoader = mongoose_1.MongooseModule.forFeatureAsync([
    {
        name: 'Auth',
        useFactory: () => {
            return auth_schema_model_1.AuthSchemaModel;
        },
    },
]);
exports.AuditTrailMongooseFactoriesLoader = mongoose_1.MongooseModule.forFeatureAsync([
    {
        name: 'AuditTrail',
        useFactory: () => {
            return audit_trail_schema_model_1.AuditTrailSchemaModel;
        }
    }
]);
exports.DeviceSessionMongooseFactoriesLoader = mongoose_1.MongooseModule.forFeatureAsync([
    {
        name: 'DeviceSession',
        useFactory: () => {
            return device_session_schema_model_1.DeviceSessionSchemaModel;
        }
    }
]);
exports.RefreshTokenMongooseFactoriesLoader = mongoose_1.MongooseModule.forFeatureAsync([
    {
        name: 'RefreshToken',
        useFactory: () => {
            return refresh_token_schema_model_1.RefreshTokenSchemaModel;
        }
    }
]);
//# sourceMappingURL=mongoose.loader.module.js.map