import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import multer from 'multer';

/**
 * Runs Multer only when the request is multipart/form-data.
 * When the client sends application/json, Multer is skipped so req.body
 * stays as parsed by body-parser (preserving all fields including countryCode).
 *
 * Use on routes that accept both JSON and multipart:
 * @UseInterceptors(ConditionalFilesInterceptor('selfie', 1))
 */
export function ConditionalFilesInterceptor(
  fieldName: string,
  maxCount = 1,
): Type<NestInterceptor> {
  class Interceptor implements NestInterceptor {
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<unknown> {
      const request = context.switchToHttp().getRequest();
      const contentType = (request.headers['content-type'] || '').toLowerCase();
      const isMultipart = contentType.includes('multipart/form-data');

      if (!isMultipart) {
        return next.handle();
      }

      // Multer's types don't expose the default as callable; at runtime it is
      const createMulter = multer as (opts?: object) => {
        array: (
          name: string,
          count: number,
        ) => (req: unknown, res: unknown, cb: (err?: Error) => void) => void;
      };
      const multerHandler = createMulter().array(fieldName, maxCount);

      return from(
        new Promise<void>((resolve, reject) => {
          multerHandler(
            request,
            context.switchToHttp().getResponse(),
            (err) => {
              if (err) reject(err);
              else resolve();
            },
          );
        }),
      ).pipe(switchMap(() => next.handle()));
    }
  }

  return Interceptor;
}
