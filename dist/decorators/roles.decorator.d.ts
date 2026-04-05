import { AccessType } from 'src/enums/access_type';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: AccessType[]) => import("@nestjs/common").CustomDecorator<string>;
