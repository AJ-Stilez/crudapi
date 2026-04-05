import { ConfigModule } from '@nestjs/config';
import securityConfig from 'src/config/security.config';

export const ConfigLoaderModule = ConfigModule.forRoot({
  load: [securityConfig],
  isGlobal: true,
  cache: true,
});
