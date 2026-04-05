import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Logger, LoggerModule } from 'nestjs-pino';
import { getMongooseConfig } from 'src/config/mongoose.config';
import { AuditTrailSchemaModel } from 'src/schema/model/audit-trail.schema.model';
import { AuthSchemaModel } from 'src/schema/model/auth.schema.model';
import { DeviceSessionSchemaModel } from 'src/schema/model/device-session.schema.model';
import { RefreshTokenSchemaModel } from 'src/schema/model/refresh-token.schema.model';
import { UserSchemaModel } from 'src/schema/model/user.schema.model';

export const MongooseModuleLoader = MongooseModule.forRootAsync({
  imports: [ConfigModule, LoggerModule],
  useFactory: async (configService: ConfigService, logger: Logger) => {
    const config = getMongooseConfig(configService, logger);

    return {
      ...config,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      connectionFactory: (connection: any) => {
        // Enable query debugging in development
        // if (process.env.NODE_ENV === 'development') {
        //   connection.set('debug', true);
        // } else {
        //   connection.set('debug', false);
        // }
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
  inject: [ConfigService, Logger],
});

export const UserMongooseFactoriesLoader = MongooseModule.forFeatureAsync([
  {
    name: 'User',
    useFactory: () => {
      return UserSchemaModel;
    },
  },
]);

export const AuthMongooseFactoriesLoader = MongooseModule.forFeatureAsync([
  {
    name: 'Auth',
    useFactory: () => {
      return AuthSchemaModel;
    },
  },
]);

export const AuditTrailMongooseFactoriesLoader = MongooseModule.forFeatureAsync([
  {
    name: 'AuditTrail',
    useFactory: () => {
      return AuditTrailSchemaModel;
    }
  }
])

export const DeviceSessionMongooseFactoriesLoader = MongooseModule.forFeatureAsync([
  {
    name: 'DeviceSession',
    useFactory: () => {
      return DeviceSessionSchemaModel;
    }
  }
])

export const RefreshTokenMongooseFactoriesLoader = MongooseModule.forFeatureAsync([
  {
    name: 'RefreshToken',
    useFactory: () => {
      return RefreshTokenSchemaModel;
    }
  }
])
