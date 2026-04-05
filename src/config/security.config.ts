import { registerAs } from '@nestjs/config';
import { JWT_ACCESS_TOKEN_EXPIRATION } from 'src/constants/security.constant';

const {
  JWT_TOKEN,
  BASIC_USERNAME,
  BASIC_PASSWORD,
//   GATE_ID_ENCRYPTION_KEY,
 
  TOKEN_ENCRYPTION_KEY, // Separate key for token encryption (optional, falls back to JWT secret)
} = process.env;

const REFRESH_TOKEN_FRONTEND_SECRET = process.env.REFRESH_TOKEN_FRONTEND_SECRET;

console.log(process.env)

export type SecurityConfig = {
  jwtSecret: string;
  basicUsername?: string;
  basicPassword?: string;
  gateIdEncryptionKey?: string;
  refreshTokenFrontendSecret?: string;
  tokenEncryptionKey?: string; // Separate key for token encryption
};

export const getJwtSecret = () => JWT_TOKEN;
export const getSecurityConfigName = () => 'security';

// export const getSecurityConfig = () => ({
//   jwtSecret: getJwtSecret(),
//   expiresIn: JWT_ACCESS_TOKEN_EXPIRATION,
//   basicUsername: BASIC_USERNAME,
//   basicPassword: BASIC_PASSWORD,
// //   gateIdEncryptionKey: GATE_ID_ENCRYPTION_KEY,
//   refreshTokenFrontendSecret: REFRESH_TOKEN_FRONTEND_SECRET,
//   tokenEncryptionKey: TOKEN_ENCRYPTION_KEY, // Separate key for token encryption
// });

export const getSecurityConfig = () => {
  const jwtSecret = process.env.JWT_TOKEN;
  const expiresIn: number = parseInt(JWT_ACCESS_TOKEN_EXPIRATION, 10);
  const refreshTokenFrontendSecret = process.env.REFRESH_TOKEN_FRONTEND_SECRET;

  if (!jwtSecret) throw new Error('JWT_TOKEN is not set in environment variables');
  if (!expiresIn) throw new Error('JWT_ACCESS_TOKEN_EXPIRATION is not set in environment variables');
 if (isNaN(expiresIn)) throw new Error('JWT_ACCESS_TOKEN_EXPIRATION is not a valid number');

  return {
    jwtSecret,
    expiresIn,
    basicUsername: BASIC_USERNAME,
    basicPassword: BASIC_PASSWORD,
    // gateIdEncryptionKey: GATE_ID_ENCRYPTION_KEY,
    refreshTokenFrontendSecret,
    tokenEncryptionKey: TOKEN_ENCRYPTION_KEY,
  };
};

export default registerAs(getSecurityConfigName(), getSecurityConfig);
