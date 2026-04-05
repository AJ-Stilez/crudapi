import { UseGuards } from "@nestjs/common";
import { AdminOnlyGuard } from "src/guards/admin-only.guard";

export const AdminOnly = () => UseGuards(AdminOnlyGuard);