import { UserService } from 'src/services/user.service';
import { CreateUserValidator } from 'src/validators/create-user.validator';
import type { Request } from 'express';
import { AnyObject } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthService } from 'src/services/auth.service';
import { Logger } from 'nestjs-pino';
export declare class UserController {
    private readonly userService;
    private readonly authService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(userService: UserService, authService: AuthService, eventEmitter: EventEmitter2, logger: Logger);
    createUser(selfie: Array<Express.Multer.File> | undefined, data: CreateUserValidator, req: Request): Promise<AnyObject>;
    private processCreateUser;
}
