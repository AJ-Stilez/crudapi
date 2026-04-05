import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthSchema, AuthUser } from 'src/entities/auth.entity';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { PerformanceModule } from './performance.module';
import { AuthSchemaModel } from 'src/schema/model/auth.schema.model';
import { AuthCacheService } from 'src/services/cache/auth-cache.service';
import { AuthMongooseFactoriesLoader } from 'src/loader/mongoose.loader.module';
import { DeviceSessionModule } from './device-session.module';
import { UserEventsListener } from 'src/events/listeners/user-events.listener';
import { RefreshTokenModule } from './refresh-token.module';
import { UserModule } from './user.module';
import { AuditTrailModule } from './audit-trail.module';
import { JwtModuleLoader } from 'src/loader/jwt.loader.module';

@Module({
  imports: [
    AuthMongooseFactoriesLoader,
    forwardRef(() => UserModule),
    AuditTrailModule,
    RefreshTokenModule,
    PerformanceModule,
    PassportModule,
    DeviceSessionModule,
    JwtModuleLoader,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthCacheService, UserEventsListener],
  exports: [AuthService, JwtModuleLoader],
})
export class AuthModule {}
