import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class AdminInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    // ⬅️ Runs AFTER guards, BEFORE controller
    console.log(
      `Admin ${request.user?.userId} requested ${request.method} ${request.url}`,
    );

    return next.handle().pipe(
      // ⬅️ Runs AFTER controller
      tap(() => {
        const duration = Date.now() - start;
        console.log(`Handled in ${duration}ms`);
      }),

      // ⬅️ Transform response
      map(data => ({
        success: true,
        count: Array.isArray(data) ? data.length : undefined,
        data,
      })),
    );
  }
}
