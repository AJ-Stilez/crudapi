/**
 * Mongoose Configuration
 *
 * This module provides optimized Mongoose configuration for the estate management system.
 * It includes connection pooling, performance optimizations, and monitoring capabilities
 * to ensure optimal database performance and reliability.
 *
 * @module MongooseConfig
 */

import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { handleAndThrowError } from 'src/utils/error.utils';
import { Logger } from 'nestjs-pino';


/**
 * Enhanced Mongoose configuration options with performance optimizations
 *
 * This configuration includes:
 * - Connection pooling for better resource management
 * - Performance optimizations for faster queries
 * - Monitoring and debugging capabilities
 * - Automatic index creation and management
 *
 * @param configService - NestJS configuration service for environment variables
 * @param logger - Logger instance for structured logging
 * @returns MongooseModuleOptions with optimized settings
 *
 * @example
 * ```typescript
 * import { getMongooseConfig } from './mongoose.config';
 *
 * const mongooseConfig = getMongooseConfig(configService, logger);
 * MongooseModule.forRootAsync({
 *   useFactory: () => mongooseConfig,
 *   inject: [ConfigService, Logger],
 * })
 * ```
 */
export function getMongooseConfig(
  configService: ConfigService,
  logger: Logger,
): MongooseModuleOptions {
  const mongoUri = configService.get<string>('DATABASE_URI');

  if (!mongoUri) {
    return handleAndThrowError(
      new Error('DATABASE_URI environment variable is required'),
      null,
      'Configuration error',
    );
  }

  return {
    uri: mongoUri,
    connectionFactory: (connection) => {
      // Enable query debugging in development
      if (process.env.NODE_ENV === 'development') {
        connection.set('debug', true);
      }

      // Set connection-level options for better performance
      connection.set('bufferCommands', false); // Disable command buffering
      // connection.set('bufferMaxEntries', 0); // Disable buffer max entries

      // Configure connection pool for optimal performance
      connection.set('poolSize', 10); // Connection pool size
      connection.set('serverSelectionTimeoutMS', 5000); // Server selection timeout
      connection.set('socketTimeoutMS', 45000); // Socket timeout
      connection.set('family', 4); // Force IPv4

      // Enable query optimization
      connection.set('autoIndex', true); // Auto-create indexes
      connection.set('autoCreate', true); // Auto-create collections

      // Performance monitoring
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
    // Additional connection options
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    maxPoolSize: 10, // Maximum connection pool size
    minPoolSize: 2, // Minimum connection pool size
    maxIdleTimeMS: 30000, // Maximum idle time for connections
    serverSelectionTimeoutMS: 5000, // Server selection timeout
    socketTimeoutMS: 45000, // Socket timeout
    family: 4, // Force IPv4
    retryWrites: true, // Enable retry writes
    w: 'majority', // Write concern
    readPreference: 'primary', // Read preference
    // Performance optimizations
    bufferCommands: false, // Disable command buffering
    // bufferMaxEntries: 0, // Disable buffer max entries
    autoIndex: true, // Auto-create indexes
    autoCreate: true, // Auto-create collections
  };
}
