"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongooseConfig = getMongooseConfig;
const error_utils_1 = require("../utils/error.utils");
function getMongooseConfig(configService, logger) {
    const mongoUri = configService.get('DATABASE_URI');
    if (!mongoUri) {
        return (0, error_utils_1.handleAndThrowError)(new Error('DATABASE_URI environment variable is required'), null, 'Configuration error');
    }
    return {
        uri: mongoUri,
        connectionFactory: (connection) => {
            if (process.env.NODE_ENV === 'development') {
                connection.set('debug', true);
            }
            connection.set('bufferCommands', false);
            connection.set('poolSize', 10);
            connection.set('serverSelectionTimeoutMS', 5000);
            connection.set('socketTimeoutMS', 45000);
            connection.set('family', 4);
            connection.set('autoIndex', true);
            connection.set('autoCreate', true);
            connection.on('connected', () => {
                logger.log('MongoDB connected successfully');
            });
            connection.on('error', (error) => {
                logger.error('MongoDB connection error:', error);
            });
            connection.on('disconnected', () => {
                logger.log('MongoDB disconnected');
            });
            return connection;
        },
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        w: 'majority',
        readPreference: 'primary',
        bufferCommands: false,
        autoIndex: true,
        autoCreate: true,
    };
}
//# sourceMappingURL=mongoose.config.js.map