/**
 * Refresh Token Encryption Utilities
 *
 * Encrypts and decrypts refresh tokens with a secret prefix/suffix
 * that only the backend knows. Frontend stores the encrypted token,
 * appends a secret, and sends it. Backend removes the secret before decrypting.
 */

import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { getSecurityConfig } from 'src/config/security.config';

/**
 * Secret prefix that frontend must include (but doesn't know what it means)
 * Format: PREFIX_ENCRYPTED_TOKEN_SUFFIX
 */
const REFRESH_TOKEN_PREFIX = 'RT_';
const REFRESH_TOKEN_SUFFIX = '_CRUDAPI';

/**
 * Gets the frontend secret that must be appended to the token
 * Frontend will append this secret before sending the token
 */
function getFrontendSecret(): string {
  const config = getSecurityConfig();
  const secret = config.refreshTokenFrontendSecret;
 
  if (!secret) {
    throw new BadRequestException(
      'REFRESH_TOKEN_FRONTEND_SECRET environment variable is required',
    );
  }

  return secret;
}

/**
 * Gets the encryption key for tokens
 * Uses dedicated TOKEN_ENCRYPTION_KEY if available, otherwise falls back to JWT secret
 * Ensures key is 32 bytes/64 hex chars
 */
function getTokenEncryptionKey(): string {
  const config = getSecurityConfig();
  // Prefer dedicated encryption key, fallback to JWT secret
  let key = config.tokenEncryptionKey || config.jwtSecret || '';

  // Ensure key is 32 bytes (64 hex characters)
  if (key.length !== 64 || !/^[0-9a-fA-F]+$/.test(key)) {
    // Hash the key to get a consistent 32-byte key
    key = crypto.createHash('sha256').update(key).digest('hex');
  }

  return key;
}

/**
 * Gets the encryption key for refresh tokens (alias for consistency)
 */
function getRefreshTokenEncryptionKey(): string {
  return getTokenEncryptionKey();
}

/**
 * Encrypts a refresh token ID
 * Returns encrypted token that frontend will append its secret to
 * @param tokenId - The refresh token ID to encrypt
 * @returns Encrypted token with prefix and suffix (frontend will append secret)
 * Format: RT_{encrypted}_ESTATE (frontend appends: RT_{encrypted}_ESTATE_{FRONTEND_SECRET})
 */
export function encryptRefreshToken(tokenId: string): string {
  try {
    const key = getRefreshTokenEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-ctr',
      Buffer.from(key, 'hex'),
      iv,
    );

    let encrypted = cipher.update(tokenId, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Format: IV:ENCRYPTED_DATA
    const encryptedData = iv.toString('hex') + ':' + encrypted.toString('hex');

    // Add prefix and suffix (frontend will append its secret after this)
    return `${REFRESH_TOKEN_PREFIX}${encryptedData}${REFRESH_TOKEN_SUFFIX}`;
  } catch (error) {
    throw new BadRequestException('Failed to encrypt refresh token');
  }
}

/**
 * Decrypts a refresh token from header
 * Frontend appends its secret, backend removes it, then decrypts
 * @param encryptedToken - The encrypted token from header (with prefix/suffix/frontend-secret)
 * Format: RT_{encrypted}_ESTATE_{FRONTEND_SECRET}
 * @returns The decrypted refresh token ID
 */
export function decryptRefreshToken(encryptedToken: string): string {
  try {
    const frontendSecret = getFrontendSecret();

    // Validate that token ends with frontend secret
    if (!encryptedToken.endsWith(frontendSecret)) {
      throw new BadRequestException(
        'Invalid refresh token format: missing or invalid frontend secret',
      );
    }

    // Remove frontend secret
    const tokenWithoutSecret = encryptedToken.slice(
      0,
      encryptedToken.length - frontendSecret.length,
    );

    // Validate prefix and suffix
    if (!tokenWithoutSecret.startsWith(REFRESH_TOKEN_PREFIX)) {
      throw new BadRequestException(
        'Invalid refresh token format: missing prefix',
      );
    }

    if (!tokenWithoutSecret.endsWith(REFRESH_TOKEN_SUFFIX)) {
      throw new BadRequestException(
        'Invalid refresh token format: missing suffix',
      );
    }

    // Extract encrypted data (remove prefix and suffix)
    const encryptedData = tokenWithoutSecret.slice(
      REFRESH_TOKEN_PREFIX.length,
      tokenWithoutSecret.length - REFRESH_TOKEN_SUFFIX.length,
    );

    // Decrypt
    const key = getRefreshTokenEncryptionKey();
    const textParts = encryptedData.split(':');

    if (textParts.length !== 2) {
      throw new BadRequestException(
        'Invalid refresh token format: invalid encryption',
      );
    }

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');

    const decipher = crypto.createDecipheriv(
      'aes-256-ctr',
      Buffer.from(key, 'hex'),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Failed to decrypt refresh token');
  }
}

/**
 * Encrypts an access token (JWT)
 * Simple encryption without prefix/suffix - just encrypts the token
 * @param accessToken - The JWT access token to encrypt
 * @returns Encrypted access token
 */
export function encryptAccessToken(accessToken: string): string {
  try {
    const key = getTokenEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-ctr',
      Buffer.from(key, 'hex'),
      iv,
    );

    let encrypted = cipher.update(accessToken, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Format: IV:ENCRYPTED_DATA
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    throw new BadRequestException('Failed to encrypt access token');
  }
}

/**
 * Decrypts an access token (JWT)
 * @param encryptedToken - The encrypted access token
 * @returns The decrypted JWT access token
 */
export function decryptAccessToken(encryptedToken: string): string {
  try {
    const key = getTokenEncryptionKey();
    const textParts = encryptedToken.split(':');

    if (textParts.length !== 2) {
      throw new BadRequestException(
        'Invalid access token format: invalid encryption',
      );
    }

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');

    const decipher = crypto.createDecipheriv(
      'aes-256-ctr',
      Buffer.from(key, 'hex'),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Failed to decrypt access token');
  }
}
