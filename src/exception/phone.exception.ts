import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Phone Number Error Codes
 *
 * Specific error codes for phone number validation and normalization.
 * Provides better error handling and debugging capabilities.
 */
export enum PhoneErrorCode {
  INVALID_FORMAT = 'INVALID_FORMAT',
  UNSUPPORTED_COUNTRY = 'UNSUPPORTED_COUNTRY',
  NORMALIZATION_FAILED = 'NORMALIZATION_FAILED',
  TOO_SHORT = 'TOO_SHORT',
  TOO_LONG = 'TOO_LONG',
  INVALID_CHARACTERS = 'INVALID_CHARACTERS',
  MISSING_COUNTRY_CODE = 'MISSING_COUNTRY_CODE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

/**
 * Phone error interface for structured error responses
 */
export interface PhoneError {
  code: PhoneErrorCode;
  message: string;
  phone?: string;
  countryCode?: string;
  suggestion?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base class for phone-related exceptions
 */
export class PhoneException extends HttpException {
  public readonly code: PhoneErrorCode;
  public readonly phone?: string;
  public readonly countryCode?: string;
  public readonly suggestion?: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    code: PhoneErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    options?: {
      phone?: string;
      countryCode?: string;
      suggestion?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    super(
      {
        code,
        message,
        phone: options?.phone,
        countryCode: options?.countryCode,
        suggestion: options?.suggestion,
        metadata: options?.metadata,
      },
      status,
    );
    this.name = 'PhoneException';
    this.code = code;
    this.phone = options?.phone;
    this.countryCode = options?.countryCode;
    this.suggestion = options?.suggestion;
    this.metadata = options?.metadata;
  }

  toJSON(): PhoneError {
    return {
      code: this.code,
      message: this.message,
      phone: this.phone,
      countryCode: this.countryCode,
      suggestion: this.suggestion,
      metadata: this.metadata,
    };
  }
}

/**
 * Specific exception for invalid phone number format
 */
export class InvalidPhoneFormatException extends PhoneException {
  constructor(phone: string, reason: string) {
    super(
      PhoneErrorCode.INVALID_FORMAT,
      `Invalid phone number format: ${reason}`,
      HttpStatus.BAD_REQUEST,
      {
        phone,
        suggestion: 'Please provide a valid phone number with country code',
      },
    );
    this.name = 'InvalidPhoneFormatException';
  }
}

/**
 * Specific exception for unsupported country codes
 */
export class UnsupportedCountryException extends PhoneException {
  constructor(countryCode: string, supportedCountries: string[]) {
    super(
      PhoneErrorCode.UNSUPPORTED_COUNTRY,
      `Unsupported country code: ${countryCode}`,
      HttpStatus.BAD_REQUEST,
      {
        countryCode,
        suggestion: `Supported countries: ${supportedCountries.join(', ')}`,
        metadata: { supportedCountries },
      },
    );
    this.name = 'UnsupportedCountryException';
  }
}

/**
 * Specific exception for normalization failures
 */
export class NormalizationFailedException extends PhoneException {
  constructor(phone: string, reason: string) {
    super(
      PhoneErrorCode.NORMALIZATION_FAILED,
      `Failed to normalize phone number: ${reason}`,
      HttpStatus.BAD_REQUEST,
      {
        phone,
        suggestion: 'Please check the phone number format and try again',
      },
    );
    this.name = 'NormalizationFailedException';
  }
}

/**
 * Specific exception for phone numbers that are too short
 */
export class PhoneTooShortException extends PhoneException {
  constructor(phone: string, minLength: number) {
    super(
      PhoneErrorCode.TOO_SHORT,
      `Phone number is too short. Minimum length: ${minLength}`,
      HttpStatus.BAD_REQUEST,
      {
        phone,
        suggestion: `Phone number must be at least ${minLength} characters long`,
        metadata: { minLength, actualLength: phone.length },
      },
    );
    this.name = 'PhoneTooShortException';
  }
}

/**
 * Specific exception for phone numbers that are too long
 */
export class PhoneTooLongException extends PhoneException {
  constructor(phone: string, maxLength: number) {
    super(
      PhoneErrorCode.TOO_LONG,
      `Phone number is too long. Maximum length: ${maxLength}`,
      HttpStatus.BAD_REQUEST,
      {
        phone,
        suggestion: `Phone number must be at most ${maxLength} characters long`,
        metadata: { maxLength, actualLength: phone.length },
      },
    );
    this.name = 'PhoneTooLongException';
  }
}

/**
 * Specific exception for invalid characters in phone numbers
 */
export class InvalidPhoneCharactersException extends PhoneException {
  constructor(phone: string, invalidChars: string[]) {
    super(
      PhoneErrorCode.INVALID_CHARACTERS,
      `Phone number contains invalid characters: ${invalidChars.join(', ')}`,
      HttpStatus.BAD_REQUEST,
      {
        phone,
        suggestion:
          'Please use only digits, spaces, hyphens, parentheses, and plus signs',
        metadata: { invalidChars },
      },
    );
    this.name = 'InvalidPhoneCharactersException';
  }
}

/**
 * Specific exception for missing country codes
 */
export class MissingCountryCodeException extends PhoneException {
  constructor(phone: string) {
    super(
      PhoneErrorCode.MISSING_COUNTRY_CODE,
      'Phone number is missing country code',
      HttpStatus.BAD_REQUEST,
      {
        phone,
        suggestion: 'Please include the country code (e.g., +234 for Nigeria)',
      },
    );
    this.name = 'MissingCountryCodeException';
  }
}

/**
 * Specific exception for configuration errors
 */
export class PhoneConfigurationException extends PhoneException {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(
      PhoneErrorCode.CONFIGURATION_ERROR,
      `Phone configuration error: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        suggestion: 'Please check the phone configuration settings',
        metadata,
      },
    );
    this.name = 'PhoneConfigurationException';
  }
}
