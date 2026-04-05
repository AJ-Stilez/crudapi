import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
export declare function getMongooseConfig(configService: ConfigService, logger: Logger): MongooseModuleOptions;
