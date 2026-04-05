"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneConfigurationException = exports.MissingCountryCodeException = exports.InvalidPhoneCharactersException = exports.PhoneTooLongException = exports.PhoneTooShortException = exports.NormalizationFailedException = exports.UnsupportedCountryException = exports.InvalidPhoneFormatException = exports.PhoneException = exports.PhoneErrorCode = void 0;
const common_1 = require("@nestjs/common");
var PhoneErrorCode;
(function (PhoneErrorCode) {
    PhoneErrorCode["INVALID_FORMAT"] = "INVALID_FORMAT";
    PhoneErrorCode["UNSUPPORTED_COUNTRY"] = "UNSUPPORTED_COUNTRY";
    PhoneErrorCode["NORMALIZATION_FAILED"] = "NORMALIZATION_FAILED";
    PhoneErrorCode["TOO_SHORT"] = "TOO_SHORT";
    PhoneErrorCode["TOO_LONG"] = "TOO_LONG";
    PhoneErrorCode["INVALID_CHARACTERS"] = "INVALID_CHARACTERS";
    PhoneErrorCode["MISSING_COUNTRY_CODE"] = "MISSING_COUNTRY_CODE";
    PhoneErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
})(PhoneErrorCode || (exports.PhoneErrorCode = PhoneErrorCode = {}));
class PhoneException extends common_1.HttpException {
    code;
    phone;
    countryCode;
    suggestion;
    metadata;
    constructor(code, message, status = common_1.HttpStatus.BAD_REQUEST, options) {
        super({
            code,
            message,
            phone: options?.phone,
            countryCode: options?.countryCode,
            suggestion: options?.suggestion,
            metadata: options?.metadata,
        }, status);
        this.name = 'PhoneException';
        this.code = code;
        this.phone = options?.phone;
        this.countryCode = options?.countryCode;
        this.suggestion = options?.suggestion;
        this.metadata = options?.metadata;
    }
    toJSON() {
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
exports.PhoneException = PhoneException;
class InvalidPhoneFormatException extends PhoneException {
    constructor(phone, reason) {
        super(PhoneErrorCode.INVALID_FORMAT, `Invalid phone number format: ${reason}`, common_1.HttpStatus.BAD_REQUEST, {
            phone,
            suggestion: 'Please provide a valid phone number with country code',
        });
        this.name = 'InvalidPhoneFormatException';
    }
}
exports.InvalidPhoneFormatException = InvalidPhoneFormatException;
class UnsupportedCountryException extends PhoneException {
    constructor(countryCode, supportedCountries) {
        super(PhoneErrorCode.UNSUPPORTED_COUNTRY, `Unsupported country code: ${countryCode}`, common_1.HttpStatus.BAD_REQUEST, {
            countryCode,
            suggestion: `Supported countries: ${supportedCountries.join(', ')}`,
            metadata: { supportedCountries },
        });
        this.name = 'UnsupportedCountryException';
    }
}
exports.UnsupportedCountryException = UnsupportedCountryException;
class NormalizationFailedException extends PhoneException {
    constructor(phone, reason) {
        super(PhoneErrorCode.NORMALIZATION_FAILED, `Failed to normalize phone number: ${reason}`, common_1.HttpStatus.BAD_REQUEST, {
            phone,
            suggestion: 'Please check the phone number format and try again',
        });
        this.name = 'NormalizationFailedException';
    }
}
exports.NormalizationFailedException = NormalizationFailedException;
class PhoneTooShortException extends PhoneException {
    constructor(phone, minLength) {
        super(PhoneErrorCode.TOO_SHORT, `Phone number is too short. Minimum length: ${minLength}`, common_1.HttpStatus.BAD_REQUEST, {
            phone,
            suggestion: `Phone number must be at least ${minLength} characters long`,
            metadata: { minLength, actualLength: phone.length },
        });
        this.name = 'PhoneTooShortException';
    }
}
exports.PhoneTooShortException = PhoneTooShortException;
class PhoneTooLongException extends PhoneException {
    constructor(phone, maxLength) {
        super(PhoneErrorCode.TOO_LONG, `Phone number is too long. Maximum length: ${maxLength}`, common_1.HttpStatus.BAD_REQUEST, {
            phone,
            suggestion: `Phone number must be at most ${maxLength} characters long`,
            metadata: { maxLength, actualLength: phone.length },
        });
        this.name = 'PhoneTooLongException';
    }
}
exports.PhoneTooLongException = PhoneTooLongException;
class InvalidPhoneCharactersException extends PhoneException {
    constructor(phone, invalidChars) {
        super(PhoneErrorCode.INVALID_CHARACTERS, `Phone number contains invalid characters: ${invalidChars.join(', ')}`, common_1.HttpStatus.BAD_REQUEST, {
            phone,
            suggestion: 'Please use only digits, spaces, hyphens, parentheses, and plus signs',
            metadata: { invalidChars },
        });
        this.name = 'InvalidPhoneCharactersException';
    }
}
exports.InvalidPhoneCharactersException = InvalidPhoneCharactersException;
class MissingCountryCodeException extends PhoneException {
    constructor(phone) {
        super(PhoneErrorCode.MISSING_COUNTRY_CODE, 'Phone number is missing country code', common_1.HttpStatus.BAD_REQUEST, {
            phone,
            suggestion: 'Please include the country code (e.g., +234 for Nigeria)',
        });
        this.name = 'MissingCountryCodeException';
    }
}
exports.MissingCountryCodeException = MissingCountryCodeException;
class PhoneConfigurationException extends PhoneException {
    constructor(message, metadata) {
        super(PhoneErrorCode.CONFIGURATION_ERROR, `Phone configuration error: ${message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
            suggestion: 'Please check the phone configuration settings',
            metadata,
        });
        this.name = 'PhoneConfigurationException';
    }
}
exports.PhoneConfigurationException = PhoneConfigurationException;
//# sourceMappingURL=phone.exception.js.map