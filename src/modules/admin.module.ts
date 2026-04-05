import { Module } from "@nestjs/common";
import { AdminOnlyGuard } from "src/guards/admin-only.guard";

@Module({
    providers: [AdminOnlyGuard]
})
export class AdminModule {}