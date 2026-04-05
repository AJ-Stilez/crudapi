/**
 *  _____ _ _ _            _   _       _ _
 * / ____| (_) |          | | | |     (_) |
 * | |  __| |_| |_ ___  ___| |_| |_ __  _| |_
 * | | |_ | | | __/ _ \/ __| __| __| '_ \| __|
 * | |__| | | | ||  __/\__ \ |_| |_| | | | |_
 *  \_____|_|_|\__\___||___/\__|\__|_| |_|\__|
 *
 * Global Utilities - The Swiss Army Knife of Helper Functions
 *
 * @module GlobalUtils
 * @internal
 *
 * 🎯 Did you know? This file contains utilities so powerful, they make
 *    other utilities jealous! 💪
 */
import { BadRequestException, ValidationError } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

import * as CryptoJS from 'crypto-js';
import { Validate } from 'class-validator';
import { isValidEmail } from 'src/utils/helper.utils';
import { handleAndThrowError } from 'src/utils/error.utils';
import dayjs from 'dayjs';

const AES_SECRET_KEY = process.env.QR_AES_SECRET || 'super-secure-key';
const AUDIT_LOG_SECRET_KEY =
  process.env.AUDIT_LOG_AES_SECRET ||
  process.env.QR_AES_SECRET ||
  'super-secure-key';

export function encryptQrData(data: string): string {
  return CryptoJS.AES.encrypt(data, AES_SECRET_KEY).toString();
}

export function decryptQrData(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, AES_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypts audit log data (e.g., codeSnapshot) using AES encryption.
 * Uses a separate secret key for audit logs to maintain separation of concerns.
 *
 * @param data - The plain text data to encrypt
 * @returns The encrypted data as a string
 */
export function encryptAuditLogData(data: string): string {
  return CryptoJS.AES.encrypt(data, AUDIT_LOG_SECRET_KEY).toString();
}

/**
 * Decrypts audit log data (e.g., codeSnapshot) using AES decryption.
 *
 * @param encrypted - The encrypted data
 * @returns The decrypted plain text data
 * @throws Error if decryption fails
 */
export function decryptAuditLogData(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, AUDIT_LOG_SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) {
    // Pure utility function - use handleAndThrowError with null logger
    // Caller should handle the error appropriately
    handleAndThrowError(
      new Error('Failed to decrypt audit log data - invalid encrypted format'),
      null,
      'Failed to decrypt audit log data - invalid encrypted format',
    );
  }

  return decrypted;
}

interface RetryOptions<T> {
  retries?: number;
  delay?: number;
  maxDelay?: number;
  jitter?: boolean;
  timeoutPerAttempt?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retryable?: (error: any, attempt: number) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRetry?: (error: any, attempt: number, nextDelay: number) => void;
  fallback?: () => Promise<T>;
  signal?: AbortSignal;
}

export const multerDefaultConfig = {
  storage: diskStorage({
    destination: './uploads', // Where to store the files
    filename: (req, file, cb) => {
      const uniqueSuffix =
        dayjs().valueOf() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new BadRequestException('Only CSV files are allowed!'), false);
    }
    cb(null, true);
  },
};

export const GLOBAL_CHARACTERS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const generateRandomNumber = (min: number, max: number) => {
  const difference = max - min;
  let rand = Math.random();
  rand = Math.floor(rand * difference);
  rand = rand + min;
  return rand;
};

export function pickRandomArrayItem<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export const randomNumbers = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const randomCharacters = (length: any, chars: string | any[]) => {
  let result = '';
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatRequestBody = (body: any) => {
  const body_proc = { ...body };
  if (body_proc.password)
    body_proc.password = body_proc.password.replace(/./g, '*');
  if (body_proc.confirmPassword)
    body_proc.confirmPassword = body_proc.confirmPassword.replace(/./g, '*');
  return body_proc;
};

export const getDurationInMilliseconds = (start: [number, number]) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

/**
 * A utility function to format and structure validation errors into a human-readable format.
 * This function processes nested validation errors and constructs a hierarchical structure.
 *
 * The function supports errors from `class-validator` or similar libraries that allow nested errors
 * in validation objects.
 *
 * It is designed to handle both simple and deeply nested validation errors. The errors are formatted
 * to return clear, human-readable messages, and the nested errors are preserved without flattening.
 *
 * @param {ValidationError[]} errors - The array of validation errors to be formatted.
 * @returns {any[]} - A structured array of formatted errors, preserving nested structures.
 *
 * @example
 * // Example of how to use this function:
 * const errors = [
 *   {
 *     property: 'address',
 *     value: '',
 *     children: [
 *       {
 *         property: 'street',
 *         value: '',
 *         constraints: { isNotEmpty: 'Street is required' }
 *       },
 *       {
 *         property: 'city',
 *         value: '',
 *         constraints: { isNotEmpty: 'City is required' }
 *       }
 *     ]
 *   },
 *   {
 *     property: 'email',
 *     value: 'invalid-email',
 *     constraints: { isEmail: 'Invalid email address' }
 *   }
 * ];
 *
 * const formattedErrors = formatValidationErrors(errors);
 * console.log(JSON.stringify(formattedErrors, null, 2));
 *
 * // Output:
 * [
 *   {
 *     "error": "address has wrong value ",
 *     "children": [
 *       {
 *         "error": "street has wrong value ",
 *         "message": "Street is required"
 *       },
 *       {
 *         "error": "city has wrong value ",
 *         "message": "City is required"
 *       }
 *     ]
 *   },
 *   {
 *     "error": "email has wrong value invalid-email",
 *     "message": "Invalid email address"
 *   }
 * ]
 *
 * @remarks
 * - The function maintains the error hierarchy (i.e., nested errors are not flattened).
 * - The function checks if there are any child errors (`error.children`), and if so, it recursively processes
 * them, keeping them nested inside the parent error.
 * - If the `constraints` property is available for the error, it will be joined into a single message.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatValidationErrors = (errors: ValidationError[]): any[] => {
  return errors.map((error) => {
    if (error.children && error.children.length > 0) {
      const nestedErrors = formatValidationErrors(error.children);
      if (Array.isArray(error.value)) {
        return nestedErrors.map((nestedError) => ({
          error: `${error.property} contains invalid elements`,
          children: nestedError.children,
        }));
      } else {
        return {
          error: `${error.property} has wrong value`,
          children: nestedErrors,
        };
      }
    } else {
      const valueDisplay =
        typeof error.value === 'object'
          ? JSON.stringify(error.value)
          : String(error.value);
      return {
        error: `${error.property} has wrong value ${valueDisplay}`,
        message: Object.values(error.constraints || {}).join(', '),
      };
    }
  });
};

export const cleanupArrayData = (
  arr: Record<string, unknown>[],
): Record<string, unknown>[] => {
  // Remove any key-value pair where the key is an empty string or value is empty
  return arr.map((dto) => {
    return Object.fromEntries(
      Object.entries(dto).filter(([key, value]) => key !== '' && value !== ''),
    );
  });
};

/**
 * Advanced retry mechanism with exponential backoff, jitter, timeout, abort support, and more.
 * - Performs a retry with exponential backoff, jitter, timeout per attempt, and abort support.
 *
 * This function tries to execute a provided async function (`fn`) up to a maximum number of retries.
 * It introduces exponential backoff for delay between retries, with optional jitter to add randomness.
 * Additionally, you can specify per-attempt timeout, error handling logic, and even a fallback function
 * when all retries fail.
 *
 * ### Key Features:
 * - **Exponential Backoff**: The delay between retries doubles each time, with an optional maximum delay (`maxDelay`).
 * - **Jitter**: Adds randomness to the delay to prevent retry storms, which can improve system resilience.
 * - **Timeout per attempt**: Each retry can have a timeout, so the function will reject if it takes too long.
 * - **Abort support**: The function listens for an external `AbortSignal` to cancel the retry attempts.
 * - **Customizable retry behavior**: You can define a predicate `retryable` to determine if an error should lead to a retry.
 * - **Fallback behavior**: If all retries fail, a `fallback` function can be executed instead of throwing the error.
 *
 * @template T - The type of the result returned by the async function.
 * @param fn - The async function that will be retried. It receives the current retry `attempt` number.
 * @param options - Configuration options for retry behavior:
 *   - `retries` - Max attempts (default: `3`)
 *   - `delay` - Initial delay in ms (default: `500`)
 *   - `maxDelay` - Maximum backoff delay in ms (default: `10000`)
 *   - `jitter` - Adds randomness to delay (default: `true`)
 *   - `timeoutPerAttempt` - Per-call timeout in ms
 *   - `retryable` - Predicate `(error, attempt) => boolean` to filter errors
 *   - `onRetry` - Callback for retry events `(error, attempt, delay)`
 *   - `fallback` - Function to call when retries are exhausted
 *   - `signal` - AbortSignal to cancel retries externally
 *
 * @returns A promise that resolves with the result of the `fn` function or the fallback if retries are exhausted.
 * @throws Throws the last encountered error if all retry attempts fail and no fallback is provided.
 *
 * @example
 * ```ts
 * const controller = new AbortController();
 *
 * try {
 *   const result = await retryWithBackoffAdvanced(
 *     async (attempt) => {
 *       console.log(`Attempt ${attempt}`);
 *       return await fetchSomething();
 *     },
 *     {
 *       retries: 5,
 *       delay: 1000,
 *       maxDelay: 8000,
 *       jitter: true,
 *       timeoutPerAttempt: 3000,
 *       signal: controller.signal,
 *       retryable: (error, attempt) => error.isRetryable ?? true,
 *       onRetry: (error, attempt, nextDelay) => {
 *         console.warn(`Retry #${attempt} failed. Retrying in ${nextDelay}ms.`);
 *       },
 *       fallback: async () => {
 *         console.warn('All retries failed. Using fallback.');
 *         return 'default value';
 *       },
 *     },
 *   );
 *   console.log('Result:', result);
 * } catch (err) {
 *   console.error('Final error:', err);
 * }
 * ```
 */
export async function retryWithBackoffAdvanced<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions<T> = {},
): Promise<T> {
  const {
    retries = 3,
    delay = 500,
    maxDelay = 10_000,
    jitter = true,
    timeoutPerAttempt,
    retryable = () => true,
    onRetry,
    fallback,
    signal,
  } = options;

  let attempt = 0;

  const run = async (currentDelay: number): Promise<T> => {
    if (signal?.aborted) {
      return handleAndThrowError(
        new Error('Retry aborted'),
        null,
        'Retry aborted',
      );
    }

    attempt++;

    try {
      return timeoutPerAttempt
        ? await Promise.race([
            fn(attempt),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error('Attempt timed out')),
                timeoutPerAttempt,
              ),
            ),
          ])
        : await fn(attempt);
    } catch (error) {
      if (attempt > retries || !retryable(error, attempt)) {
        if (fallback) return fallback();
        throw error;
      }

      const nextDelay = jitter
        ? Math.min(maxDelay, currentDelay * (0.5 + Math.random()))
        : Math.min(maxDelay, currentDelay);

      onRetry?.(error, attempt, nextDelay);

      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, nextDelay);
        if (signal) {
          signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              reject(new Error('Retry aborted'));
            },
            { once: true },
          );
        }
      });

      return run(currentDelay * 2);
    }
  };

  return run(delay);
}

/**
 * Retries an asynchronous function with exponential backoff.
 *
 * This utility is useful for retrying operations that may fail temporarily,
 * such as network requests or database operations.
 *
 * @template T - The return type of the asynchronous function.
 * @param fn - The asynchronous function to execute.
 * @param retries - Number of retry attempts. Defaults to `3`.
 * @param delay - Initial delay between retries in milliseconds. Defaults to `500ms`.
 *
 * @returns A promise that resolves with the result of the function or rejects after all retries fail.
 *
 * @throws The last error encountered if all retry attempts are exhausted.
 *
 * @example
 * ```ts
 * const result = await retryWithBackoff(() => fetchData(), 5, 1000);
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2); // Exponential backoff
  }
}

/**
 * Retrieves a nested value from an object using dot notation.
 *
 * @param obj - The object to extract the value from.
 * @param path - A dot-separated string representing the path to the value (e.g., `"profile.name"`).
 * @returns The value at the specified path or `undefined` if it doesn't exist.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNestedValue(obj: any, path: string): any {
  return path
    .split('.')
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function omitFields<T extends Record<string, any>, K extends keyof T>(
  payload: T,
  keysToOmit: K[],
): Omit<T, K> {
  const result = { ...payload };
  for (const key of keysToOmit) {
    delete result[key];
  }
  return result;
}

// Custom validator for email or phone
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IsEmailOrPhone(validationOptions?: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (object: any, propertyName: string) {
    Validate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (value: any) => {
        if (!value) return false;
        return isValidEmail(value) || /^\+?[\d\s\-\(\)]+$/.test(value);
      },
      {
        message: 'Identifier must be a valid email address or phone number',
        ...validationOptions,
      },
    )(object, propertyName);
  };
}
