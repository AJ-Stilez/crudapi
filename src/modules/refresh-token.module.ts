import { Module } from "@nestjs/common";
import { RefreshTokenMongooseFactoriesLoader } from "src/loader/mongoose.loader.module";
import { RefreshTokenService } from "src/services/refresh-token.service";
import { AuditTrailModule } from "./audit-trail.module";

@Module({
    imports: [RefreshTokenMongooseFactoriesLoader, AuditTrailModule],
    providers: [RefreshTokenService,],
    exports: [RefreshTokenService],
})

export class RefreshTokenModule {}