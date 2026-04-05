import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { config } from 'process';
import { Observable } from 'rxjs';
import { LoggerMiddleware } from 'src/middlewares/logger.middleware';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  private readonly logger = new Logger(AdminOnlyGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    this.logger.log(`Incoming request to ${request.originalUrl}`);

    if (!apiKey) {
      this.logger.warn(`Missing API key from IP: ${request.ip}`);
      throw new UnauthorizedException('X-API-KEY missing');
    }

    const apiKeyConfig = this.configService.get<string>('API_KEY');

    if (!apiKeyConfig) {
      this.logger.error('API_KEY is not configured');
      throw new Error('API_KEY is not configured');
    }

    this.logger.log('Admin access granted');
    return apiKey === apiKeyConfig;
  }
}
