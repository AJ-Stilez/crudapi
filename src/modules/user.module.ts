import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchemaModel } from 'src/schema/model/user.schema.model';
import { UserService } from 'src/services/user.service';
import { AuthModule } from './auth.module';
import { UserMongooseFactoriesLoader } from 'src/loader/mongoose.loader.module';
import { AuditTrailModule } from './audit-trail.module';
import { UserController } from 'src/controllers/user.controller';
import { PerformanceModule } from './performance.module';

@Module({
  imports: [UserMongooseFactoriesLoader, forwardRef(() => AuthModule), AuditTrailModule, PerformanceModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
