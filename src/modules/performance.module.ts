import { Module } from '@nestjs/common';
import { CacheService } from 'src/services/cache/cache.services';
import { InMemoryCacheProvider } from 'src/services/cache/providers/in-memory-cache.provider';
import { TokenMappingService } from 'src/services/cache/token-mapping.services';
import { CACHE_PROVIDER } from 'src/types/cache-provider.types';

@Module({
  providers: [
    { provide: CACHE_PROVIDER, useClass: InMemoryCacheProvider },
    InMemoryCacheProvider,
    CacheService,
    TokenMappingService
  ],
  exports: [CacheService, TokenMappingService],
})
export class PerformanceModule {}
