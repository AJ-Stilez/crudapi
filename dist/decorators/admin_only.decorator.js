"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOnly = void 0;
const common_1 = require("@nestjs/common");
const admin_only_guard_1 = require("../guards/admin-only.guard");
const AdminOnly = () => (0, common_1.UseGuards)(admin_only_guard_1.AdminOnlyGuard);
exports.AdminOnly = AdminOnly;
//# sourceMappingURL=admin_only.decorator.js.map