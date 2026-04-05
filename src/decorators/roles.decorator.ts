import { SetMetadata } from '@nestjs/common';
import { AccessType } from 'src/enums/access_type';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AccessType[]) => SetMetadata(ROLES_KEY, roles);
