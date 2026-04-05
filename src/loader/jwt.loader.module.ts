import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getSecurityConfig } from 'src/config/security.config';

// export const JwtModuleLoader = JwtModule.registerAsync({
//   imports: [ConfigModule],
//   useFactory: async () => ({
//     // secret: config_service.get<SecurityConfig>('security').jwtSecret,
//     secret: getSecurityConfig().jwtSecret,
//     signOptions: { expiresIn: getSecurityConfig().expiresIn},
//   }),
//   inject: [ConfigService],
// });

export const JwtModuleLoader = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (): Promise<JwtModuleOptions> => {
    const security = getSecurityConfig(); // Type-safe now

    return {
      secret: security.jwtSecret,
      signOptions: { expiresIn: security.expiresIn }, // string type guaranteed
    };
  },
  inject: [ConfigService],
});
