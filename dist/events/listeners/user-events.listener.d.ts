import { Logger } from 'nestjs-pino';
import { AuthService } from 'src/services/auth.service';
import type { NewUserAuthCreated } from 'src/events/user.event';
export declare class UserEventsListener {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService, logger: Logger);
    onboardedAndSetupUserAuthEventListener(payload: NewUserAuthCreated): Promise<void>;
}
