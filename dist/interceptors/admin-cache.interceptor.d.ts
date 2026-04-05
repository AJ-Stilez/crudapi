import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class AdminCacheInterceptor implements NestInterceptor {
    private cache;
    private readonly TTL;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
