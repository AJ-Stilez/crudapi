import * as argon from 'argon2';
import { Worker } from 'worker_threads';
import { join } from 'path';

/**
 * Password policy interface for validation
 */
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength?: number;
  disallowedWords?: string[];
}

/**
 * Hashes a password using Argon2.
 *
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon.hash(password);
}

/**
 * Verifies a password against a hash using Argon2 with worker thread.
 *
 * @param hash - The hashed password to verify against
 * @param password - The plain text password to verify
 * @returns Promise resolving to boolean indicating if password matches
 */
export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const workerPath = join(__dirname, '../workers/argon-worker.js');
    const worker = new Worker(workerPath, {
      workerData: { hash, password },
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

/**
 * Checks if a password meets the required strength criteria.
 *
 * @param password - The password to validate
 * @returns boolean indicating if password meets strength requirements
 */
export function isPasswordStrong(password: string): boolean {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

/**
 * Generates a random password with specified criteria.
 *
 * @param length - Length of the password (default: 12)
 * @param includeSpecialChars - Whether to include special characters (default: true)
 * @returns A randomly generated password
 */
export function generateRandomPassword(
  length = 12,
  includeSpecialChars = true,
): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = lowercase + uppercase + numbers;
  if (includeSpecialChars) {
    chars += special;
  }

  let password = '';

  // Ensure at least one character from each required category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  if (includeSpecialChars) {
    password += special[Math.floor(Math.random() * special.length)];
  }

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Validates a password against a custom policy.
 *
 * @param password - The password to validate
 * @param policy - The password policy to validate against
 * @returns Object with validation result and details
 */
export function validatePasswordPolicy(
  password: string,
  policy: PasswordPolicy,
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(
      `Password must be at least ${policy.minLength} characters long`,
    );
  }

  if (policy.maxLength && password.length > policy.maxLength) {
    errors.push(
      `Password must be no more than ${policy.maxLength} characters long`,
    );
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
    errors.push(
      'Password must contain at least one special character (@$!%*?&)',
    );
  }

  if (policy.disallowedWords) {
    const lowerPassword = password.toLowerCase();
    for (const word of policy.disallowedWords) {
      if (lowerPassword.includes(word.toLowerCase())) {
        errors.push(`Password cannot contain the word "${word}"`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Hashes a password with a provided salt using Argon2.
 *
 * @param password - The plain text password
 * @param salt - The salt to use for hashing
 * @returns Promise resolving to the hashed password
 */
export async function hashPasswordWithSalt(
  password: string,
  salt: string,
): Promise<string> {
  const combinedPassword = password + salt;
  return await argon.hash(combinedPassword);
}

/**
 * Generates a secure password reset token.
 *
 * @param length - Length of the token (default: 32)
 * @returns A secure random token
 */
export function generatePasswordResetToken(length = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }

  return token;
}

/**
 * Generates a secure salt for password hashing.
 *
 * @param length - Length of the salt (default: 16)
 * @returns A secure random salt
 */
export function generateSalt(length = 16): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';

  for (let i = 0; i < length; i++) {
    salt += chars[Math.floor(Math.random() * chars.length)];
  }

  return salt;
}
