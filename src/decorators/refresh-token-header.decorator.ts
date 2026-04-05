import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { handleAndThrowError } from 'src/utils/error.utils';

/**
 * Custom decorator to extract the X-Refresh-Token header from the request.
 *
 * @example
 * ```ts
 * @Post('refresh')
 * async refreshToken(@RefreshTokenHeader() refreshToken: string) {
 *   // refreshToken contains the value from X-Refresh-Token header
 * }
 * ```
 *
 * @returns The value of the X-Refresh-Token header
 * @throws HttpException with status 400 (BAD_REQUEST) if header is missing.
 */
export const RefreshTokenHeader = createParamDecorator<string>(
  (data: string, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const refreshToken = request.headers['x-refresh-token'] as string;

    if (!refreshToken) {
      return handleAndThrowError(
        new HttpException(
          'Refresh token is required in X-Refresh-Token header',
          HttpStatus.BAD_REQUEST,
        ),
        null,
        'Refresh token is missing from header',
      );
    }

    return refreshToken;
  },
);
