import { HttpException, HttpStatus } from '@nestjs/common';
// import { DEFAULT_INTERNAL_ERROR_MESSAGE } from 'src/constants/app.constants';
// import { SentryTrackerService } from 'src/services/providers/sentry-tracker.service';
import type { Logger } from 'nestjs-pino';

/**
 *  ______                    _
 * |  ____|                  | |
 * | |__   _ __ ___  ___ _ __| |_
 * |  __| | '__/ _ \/ _ \ '__| __|
 * | |____| | |  __/  __/ |  | |_
 * |______|_|  \___|\___|_|   \__|
 *
 * Error Utilities - The Guardians of Graceful Failure
 *
 * @module ErrorUtils
 * @internal
 *
 * 🛡️ These utilities are like the bodyguards of your app -
 *    they handle the bad guys (errors) with style! 💪
 */

/**
 * Handles and rethrows an error with optional logging, Sentry reporting, and fallback messaging.
 *
 * This utility function standardizes error handling by:
 * - Logging the error using the provided logger.
 * - Optionally sending the error to Sentry via `SentryTrackerService`.
 * - Re-throwing the original `HttpException` if applicable.
 * - Otherwise, throwing a new `HttpException` with the fallback message and status code.
 *
 * @param error - The error to handle. Can be any unknown value, including native `Error` or `HttpException`.
 * @param logger - A logger instance used to log the error and stack trace.
 * @param fallbackMessage - A default message to include in the thrown `HttpException` if the error is not already an `HttpException`. Defaults to `'An unexpected error occurred'`.
 * @param errorStatus - An optional HTTP status code to use when throwing a fallback `HttpException`. Defaults to `HttpStatus.INTERNAL_SERVER_ERROR` (500).
 * @param publishToSentry - If `true`, attempts to publish the error to Sentry using `SentryTrackerService`. Defaults to `false`.
 *
 * @param loggerMessage
 * @throws {HttpException} - Rethrows the original `HttpException` if detected; otherwise throws a new one with the fallback message and status.
 *
 * @example
 * // Full usage with Sentry and a custom error message and status
 * try {
 *   await userService.createUser(payload);
 * } catch (error) {
 *   handleAndThrowError(error, this.logger, 'User creation failed', HttpStatus.BAD_REQUEST, true);
 * }
 *
 * @example
 * // Basic usage with default message and default 500 status
 * try {
 *   await fileService.processUpload(file);
 * } catch (error) {
 *   handleAndThrowError(error, this.logger);
 * }
 *
 * @example
 * // Usage without Sentry, custom fallback message and 403 status
 * try {
 *   await authService.authorizeUser(token);
 * } catch (error) {
 *   handleAndThrowError(error, this.logger, 'Unauthorized access', HttpStatus.FORBIDDEN);
 * }
 *
 * @example
 * // Rethrowing an HttpException (preserves original status and message)
 * try {
 *   throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
 * } catch (error) {
 *   handleAndThrowError(error, this.logger); // Logs and rethrows the same HttpException
 * }
 *
 * @example
 * // Handling a native Error object (converts to HttpException)
 * try {
 *   throw new Error('Something broke');
 * } catch (error) {
 *   handleAndThrowError(error, this.logger, 'A general failure occurred', HttpStatus.SERVICE_UNAVAILABLE);
 * }
 */
export function handleAndThrowError(
  error: unknown,
  logger: Logger | null = null,
  fallbackMessage = 'An unexpected error occurred',
  errorStatus?: number,
  publishToSentry = false,
  loggerMessage = 'An unexpected error occurred',
): never {
  if (publishToSentry) {
    // try {
    //   const sentryTracker = SentryTrackerService.getInstance();
    //   sentryTracker?.captureException?.(error);
    // } catch (sentryError) {
    //   if (logger) {
    //     logger.warn('Failed to send error to Sentry', sentryError);
    //   }
    // }
  }

  if (error instanceof HttpException) {
    if (logger) {
      logger.error({ err: error, stack: error.stack }, error.message);
    }
    // eslint-disable-next-line no-restricted-syntax
    throw error;
  }

  const stack = error instanceof Error ? error.stack : undefined;

  if (logger) {
    logger.error(
      {
        err: error,
        stack,
        status: errorStatus ?? HttpStatus.INTERNAL_SERVER_ERROR,
      },
      loggerMessage ?? fallbackMessage,
    );
  }
  // eslint-disable-next-line residential/use-handle-and-throw-error
  throw new HttpException(
    fallbackMessage,
    errorStatus ?? HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const getErrorMessage = (err: any) => {
//   if (err instanceof HttpException) return err;
//   return err?.errors?.[0]?.message ?? DEFAULT_INTERNAL_ERROR_MESSAGE;
// };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorStatusCode = (err: any): number => {
  if (err instanceof HttpException) {
    return err.getStatus();
  }
  return HttpStatus.INTERNAL_SERVER_ERROR;
};
