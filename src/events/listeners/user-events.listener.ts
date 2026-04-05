import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from 'nestjs-pino';
import { AuthService } from 'src/services/auth.service';

import { NEW_USER_CREATED_FOR_AUTH } from 'src/events/user.event';

import type { NewUserAuthCreated } from 'src/events/user.event';
import { omitFields } from 'src/utils/global.utils';

@Injectable()
export class UserEventsListener {
  constructor(
    private readonly authService: AuthService,
    // private readonly authenticationNotificationService: AuthenticationNotificationService,
    // private readonly appTokenService: AppTokenService,
    private readonly logger: Logger,
  ) {}

  @OnEvent(NEW_USER_CREATED_FOR_AUTH)
  public async onboardedAndSetupUserAuthEventListener(
    payload: NewUserAuthCreated,
  ) {
    const plainPayload = JSON.parse(JSON.stringify(payload));

    // Set default roles and permissions based on user type
    let roles: string[] = [];
    let permissions: string[] = [];

    switch (plainPayload.userType) {
      case 'user':
        roles = ['user'];
        permissions = ['view_profile', 'update_profile', 'edit_profile'];
        break;
      // case 'partner':
      //   roles = ['partner'];
      //   permissions = [
      //     'view_profile',
      //     'update_profile',
      //     'manage_estates',
      //     'view_residents',
      //   ];
      //   break;
      // case 'guard':
      //   roles = ['guard'];
      //   permissions = ['scan', 'view_profile', 'view_scan_history'];
      //   break;
      default:
        roles = ['user'];
        permissions = ['view_profile'];
    }

    const authUserObject = {
      identifier: plainPayload.identifier,
      userId: plainPayload.userId,
      email: plainPayload.email,
      phone: plainPayload.phone,
      password: plainPayload.password,
      userType: plainPayload.userType,
      roles: plainPayload.roles || roles,
      permissions: plainPayload.permissions || permissions,
      assignedEstates: plainPayload.assignedEstates || [],
      emailConfirmedAt: plainPayload.emailConfirmedAt,
      phoneConfirmedAt: plainPayload.phoneConfirmedAt,
    };
    await this.authService.create(authUserObject);

    // send the user a welcome email here
    // if (plainPayload?.firstName && plainPayload?.email) {
    //   await this.authenticationNotificationService.sendNewUserMessage(
    //     plainPayload?.firstName,
    //     plainPayload?.email,
    //   );
    // }
    // if (plainPayload?.token) {
    //   await this.appTokenService.deleteOne({
    //     _id: plainPayload?.token.id,
    //     code: plainPayload?.code,
    //     purpose: plainPayload?.token.purpose,
    //   });
    // }
  }
}
