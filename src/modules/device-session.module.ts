import { Module } from "@nestjs/common";
import { DeviceSessionMongooseFactoriesLoader } from "src/loader/mongoose.loader.module";
import { DeviceSessionService } from "src/services/device-session.service";

@Module({
    imports: [DeviceSessionMongooseFactoriesLoader],
    providers: [DeviceSessionService],
    exports: [DeviceSessionService],
})

export class DeviceSessionModule {}