import { HttpException, HttpStatus } from '@nestjs/common';
export declare enum PhoneErrorCode {
    INVALID_FORMAT = "INVALID_FORMAT",
    UNSUPPORTED_COUNTRY = "UNSUPPORTED_COUNTRY",
    NORMALIZATION_FAILED = "NORMALIZATION_FAILED",
    TOO_SHORT = "TOO_SHORT",
    TOO_LONG = "TOO_LONG",
    INVALID_CHARACTERS = "INVALID_CHARACTERS",
    MISSING_COUNTRY_CODE = "MISSING_COUNTRY_CODE",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
}
export interface PhoneError {
    code: PhoneErrorCode;
    message: string;
    phone?: string;
    countryCode?: string;
    suggestion?: string;
    metadata?: Record<string, unknown>;
}
export declare class PhoneException extends HttpException {
    readonly code: PhoneErrorCode;
    readonly phone?: string;
    readonly countryCode?: string;
    readonly suggestion?: string;
    readonly metadata?: Record<string, unknown>;
    constructor(code: PhoneErrorCode, message: string, status?: HttpStatus, options?: {
        phone?: string;
        countryCode?: string;
        suggestion?: string;
        metadata?: Record<string, unknown>;
    });
    toJSON(): PhoneError;
}
export declare class InvalidPhoneFormatException extends PhoneException {
    constructor(phone: string, reason: string);
}
export declare class UnsupportedCountryException extends PhoneException {
    constructor(countryCode: string, supportedCountries: string[]);
}
export declare class NormalizationFailedException extends PhoneException {
    constructor(phone: string, reason: string);
}
export declare class PhoneTooShortException extends PhoneException {
    constructor(phone: string, minLength: number);
}
export declare class PhoneTooLongException extends PhoneException {
    constructor(phone: string, maxLength: number);
}
export declare class InvalidPhoneCharactersException extends PhoneException {
    constructor(phone: string, invalidChars: string[]);
}
export declare class MissingCountryCodeException extends PhoneException {
    constructor(phone: string);
}
export declare class PhoneConfigurationException extends PhoneException {
    constructor(message: string, metadata?: Record<string, unknown>);
}
