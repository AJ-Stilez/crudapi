import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) return true;

    const user = context.switchToHttp().getRequest().user;

    console.log(user);

    if (!user || !user.permissions) {
      throw new ForbiddenException('You do not have the permission to access this page');
    }

    const hasPermission =  required.every((permission) => user.permissions.includes(permission));

      if (!hasPermission) {
      throw new ForbiddenException('You do not have enough permission entry to access this page');
    }

    return true;
  }
}
