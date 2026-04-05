import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
export declare class AdminOnlyGuard implements CanActivate {
    private readonly reflector;
    private readonly configService;
    private readonly logger;
    constructor(reflector: Reflector, configService: ConfigService);
    canActivate(context: ExecutionContext): boolean;
}
