import { AuthService } from '../services/auth.service';
import { AuthenticateValidator } from '../dtos/authenticate.dto';
import { Logger } from 'nestjs-pino';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService, logger: Logger);
    authenticate(data: AuthenticateValidator, req: Request, ip: string): Promise<{
        accessToken: string | null;
        refreshToken: string | undefined;
        user: import("../types/auth.types").UserResponse;
        deviceSession: import("../schema/class/device-session.schema.class").DeviceSession | undefined;
    }>;
    private getLocationFromIP;
    refreshToken(encryptedRefreshToken: string, req: Request, ip: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
