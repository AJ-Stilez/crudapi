import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

function transformResponse(data: any, cached: boolean) {
  return {
    count: Array.isArray(data) ? data.length : 1,
    responseData: data,
    cached,
  };
}

@Injectable()
export class AdminCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 30_000; // 30 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // 1️⃣ Cache only GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    // 2️⃣ Admin-safe cache key
    const key = `admin:${user.userId}:${url}`;

    const cached = this.cache.get(key);

    // 3️⃣ Return cached response if valid
    if (cached && cached.expiresAt > Date.now()) {
      return of(transformResponse(cached.value, true));
    }

    // 4️⃣ Cache miss → continue to controller
    return next.handle().pipe(
      tap((response) => {
        this.cache.set(key, {
          value: response,
          expiresAt: Date.now() + this.TTL,
        });
      }),

      map((data) => transformResponse(data, false)),
    );
  }
}
