import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditTrailInterceptor } from 'src/interceptors/audit-trail.interceptor';
import { AuditTrailMongooseFactoriesLoader } from 'src/loader/mongoose.loader.module';
import { AuditTrailService } from 'src/services/audit-trail.service';

@Module({
  imports: [AuditTrailMongooseFactoriesLoader],
  providers: [
    AuditTrailService,
    { provide: APP_INTERCEPTOR, useClass: AuditTrailInterceptor },
  ],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}
