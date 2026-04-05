"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("../services/app.service");
const auth_module_1 = require("./auth.module");
const profile_module_1 = require("./profile.module");
const app_controller_1 = require("../controllers/app.controller");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const bot_update_1 = require("../bot.update");
const logger_middleware_1 = require("../middlewares/logger.middleware");
const payment_module_1 = require("./payment.module");
const webhook_1 = require("../webhook/webhook");
const admin_module_1 = require("./admin.module");
const mongoose_loader_module_1 = require("../loader/mongoose.loader.module");
const nestjs_pino_1 = require("nestjs-pino");
const environment_utils_1 = require("../utils/environment.utils");
const config_loader_module_1 = require("../loader/config.loader.module");
const performance_module_1 = require("./performance.module");
const user_module_1 = require("./user.module");
const audit_trail_module_1 = require("./audit-trail.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_utils_1 = require("../utils/event.utils");
const refresh_token_module_1 = require("./refresh-token.module");
const web_crawler_module_1 = require("./web-crawler.module");
const EventsEmitterModulesLoader = event_emitter_1.EventEmitterModule.forRoot(event_utils_1.EventEmitterDefaultConfigOptions);
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    autoLogging: false,
                    level: (0, environment_utils_1.isProduction)() ? 'info' : 'debug',
                    transport: (0, environment_utils_1.isDevelopment)()
                        ? {
                            target: 'pino-pretty',
                        }
                        : undefined,
                },
            }),
            config_loader_module_1.ConfigLoaderModule,
            mongoose_loader_module_1.MongooseModuleLoader,
            nestjs_telegraf_1.TelegrafModule.forRoot({
                token: process.env.BOT_TOKEN || 'UNDEFINED',
            }),
            web_crawler_module_1.WebCrawlerModule,
            EventsEmitterModulesLoader,
            refresh_token_module_1.RefreshTokenModule,
            audit_trail_module_1.AuditTrailModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            payment_module_1.PaymentModule,
            performance_module_1.PerformanceModule,
            profile_module_1.ProfileModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController, webhook_1.WebhookController],
        providers: [app_service_1.AppService, bot_update_1.BotUpdate],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map