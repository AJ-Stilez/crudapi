import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { AuthModule } from './auth.module';
import { ProfileModule } from './profile.module';
import { AppController } from 'src/controllers/app.controller';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from 'src/bot.update';
import { LoggerMiddleware } from 'src/middlewares/logger.middleware';
import { PaymentModule } from './payment.module';
import { WebhookController } from 'src/webhook/webhook';
import { AdminModule } from './admin.module';
import { MongooseModuleLoader } from 'src/loader/mongoose.loader.module';
import { LoggerModule } from 'nestjs-pino';
import { isDevelopment, isProduction } from 'src/utils/environment.utils';
import { ConfigLoaderModule } from 'src/loader/config.loader.module';
import { PerformanceModule } from './performance.module';
import { UserModule } from './user.module';
import { AuditTrailModule } from './audit-trail.module';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitterDefaultConfigOptions } from 'src/utils/event.utils';
import { RefreshTokenModule } from './refresh-token.module';
import { WebCrawlerModule } from './web-crawler.module';

const EventsEmitterModulesLoader = EventEmitterModule.forRoot(
  EventEmitterDefaultConfigOptions,
);

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        level: isProduction() ? 'info' : 'debug',
        transport: isDevelopment()
          ? {
              target: 'pino-pretty',
            }
          : undefined,
      },
    }),

    ConfigLoaderModule,
    MongooseModuleLoader,
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN || 'UNDEFINED',
    }),
    WebCrawlerModule,
    EventsEmitterModulesLoader,
    RefreshTokenModule,
    AuditTrailModule,
    UserModule,
    AuthModule,
    PaymentModule,
    PerformanceModule,
    ProfileModule,
    AdminModule,
  ],
  controllers: [AppController, WebhookController],
  providers: [AppService, BotUpdate],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
