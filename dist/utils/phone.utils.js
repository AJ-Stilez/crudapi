"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGIONS = exports.DEFAULT_COUNTRY_CODE = exports.COUNTRY_CODES = exports.getCountryTimezone = exports.getCountryCurrency = exports.getCountryFlag = exports.isSupportedCountryCode = exports.getAllCountryCodes = exports.getCountriesByRegion = exports.getCountryByCode = void 0;
exports.fetchPhoneNumberLookup = fetchPhoneNumberLookup;
exports.extractCountryCode = extractCountryCode;
exports.formatPhoneNumberWithCountryCode = formatPhoneNumberWithCountryCode;
exports.validatePhoneNumber = validatePhoneNumber;
exports.normalizePhoneNumber = normalizePhoneNumber;
exports.isInternationalFormat = isInternationalFormat;
exports.toInternationalFormat = toInternationalFormat;
exports.formatPhoneNumberWithCountryDetails = formatPhoneNumberWithCountryDetails;
exports.validateAndFormatPhoneNumberWithDetails = validateAndFormatPhoneNumberWithDetails;
exports.validateLocalPhoneNumber = validateLocalPhoneNumber;
exports.validatePhoneNumberWithExceptions = validatePhoneNumberWithExceptions;
const mobileNumberPrefix = __importStar(require("../shared/data/telephone-providers.json"));
const country_constants_1 = require("../constants/country.constants");
Object.defineProperty(exports, "COUNTRY_CODES", { enumerable: true, get: function () { return country_constants_1.COUNTRY_CODES; } });
Object.defineProperty(exports, "DEFAULT_COUNTRY_CODE", { enumerable: true, get: function () { return country_constants_1.DEFAULT_COUNTRY_CODE; } });
Object.defineProperty(exports, "getAllCountryCodes", { enumerable: true, get: function () { return country_constants_1.getAllCountryCodes; } });
Object.defineProperty(exports, "getCountriesByRegion", { enumerable: true, get: function () { return country_constants_1.getCountriesByRegion; } });
Object.defineProperty(exports, "getCountryByCode", { enumerable: true, get: function () { return country_constants_1.getCountryByCode; } });
Object.defineProperty(exports, "getCountryCurrency", { enumerable: true, get: function () { return country_constants_1.getCountryCurrency; } });
Object.defineProperty(exports, "getCountryFlag", { enumerable: true, get: function () { return country_constants_1.getCountryFlag; } });
Object.defineProperty(exports, "getCountryTimezone", { enumerable: true, get: function () { return country_constants_1.getCountryTimezone; } });
Object.defineProperty(exports, "isSupportedCountryCode", { enumerable: true, get: function () { return country_constants_1.isSupportedCountryCode; } });
Object.defineProperty(exports, "REGIONS", { enumerable: true, get: function () { return country_constants_1.REGIONS; } });
const phone_exception_1 = require("../exception/phone.exception");
function fetchPhoneNumberLookup(phoneNumber) {
    let value;
    let prefix;
    prefix = phoneNumber.slice(0, 4);
    value = mobileNumberPrefix[prefix];
    if (value == undefined) {
        prefix = phoneNumber.slice(0, 5);
        value = mobileNumberPrefix[prefix];
    }
    return { provider: value ?? 'Not available', isAvailable: !!value };
}
function extractCountryCode(phoneNumber) {
    try {
        const cleanedNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
        if (!cleanedNumber || cleanedNumber.length < 7) {
            return {
                countryCode: country_constants_1.DEFAULT_COUNTRY_CODE,
                localNumber: phoneNumber,
                isValid: false,
            };
        }
        if (cleanedNumber.startsWith('+')) {
            const sortedCodes = Object.keys(country_constants_1.COUNTRY_CODES).sort((a, b) => b.length - a.length);
            for (const code of sortedCodes) {
                if (cleanedNumber.startsWith(code)) {
                    const localNumber = cleanedNumber.substring(code.length);
                    const countryInfo = country_constants_1.COUNTRY_CODES[code];
                    const isValidLength = localNumber.length >= countryInfo.length - code.length + 1;
                    return {
                        countryCode: code,
                        localNumber,
                        countryInfo,
                        isValid: isValidLength && /^\d+$/.test(localNumber),
                    };
                }
            }
            const unknownCode = cleanedNumber.match(/^\+(\d{1,4})/)?.[1];
            if (unknownCode) {
                return {
                    countryCode: `+${unknownCode}`,
                    localNumber: cleanedNumber.substring(unknownCode.length + 1),
                    isValid: false,
                };
            }
            return {
                countryCode: country_constants_1.DEFAULT_COUNTRY_CODE,
                localNumber: cleanedNumber.substring(1),
                countryInfo: country_constants_1.COUNTRY_CODES[country_constants_1.DEFAULT_COUNTRY_CODE],
                isValid: false,
            };
        }
        const sortedCodes = Object.keys(country_constants_1.COUNTRY_CODES).sort((a, b) => b.length - a.length);
        for (const code of sortedCodes) {
            const codeWithoutPlus = code.substring(1);
            if (cleanedNumber.startsWith(codeWithoutPlus)) {
                const localNumber = cleanedNumber.substring(codeWithoutPlus.length);
                const countryInfo = country_constants_1.COUNTRY_CODES[code];
                const isValidLength = localNumber.length >= countryInfo.length - code.length + 1;
                return {
                    countryCode: code,
                    localNumber,
                    countryInfo,
                    isValid: isValidLength && /^\d+$/.test(localNumber),
                };
            }
        }
        if (cleanedNumber.match(/^(07|08|09|01)\d{9}$/)) {
            return {
                countryCode: country_constants_1.DEFAULT_COUNTRY_CODE,
                localNumber: cleanedNumber,
                countryInfo: country_constants_1.COUNTRY_CODES[country_constants_1.DEFAULT_COUNTRY_CODE],
                isValid: true,
            };
        }
        return {
            countryCode: country_constants_1.DEFAULT_COUNTRY_CODE,
            localNumber: cleanedNumber,
            countryInfo: country_constants_1.COUNTRY_CODES[country_constants_1.DEFAULT_COUNTRY_CODE],
            isValid: false,
        };
    }
    catch (error) {
        return {
            countryCode: country_constants_1.DEFAULT_COUNTRY_CODE,
            localNumber: phoneNumber,
            countryInfo: country_constants_1.COUNTRY_CODES[country_constants_1.DEFAULT_COUNTRY_CODE],
            isValid: false,
        };
    }
}
function formatPhoneNumberWithCountryCode(countryCode, localNumber) {
    let cleanedLocalNumber;
    if (countryCode === '+234' && localNumber.startsWith('0')) {
        cleanedLocalNumber = localNumber.substring(1);
    }
    else {
        cleanedLocalNumber = localNumber.replace(/^0+/, '');
    }
    return `${countryCode}${cleanedLocalNumber}`;
}
function validatePhoneNumber(phoneNumber, countryCode) {
    try {
        const { countryCode: extractedCode, localNumber, countryInfo, isValid, } = extractCountryCode(phoneNumber);
        if (countryCode && extractedCode !== countryCode) {
            return {
                isValid: false,
                error: `Expected country code ${countryCode}, but found ${extractedCode}`,
            };
        }
        if (localNumber.length < 7) {
            return {
                isValid: false,
                error: 'Phone number is too short',
                countryInfo,
            };
        }
        if (localNumber.length > 15) {
            return {
                isValid: false,
                error: 'Phone number is too long',
                countryInfo,
            };
        }
        if (!/^\d+$/.test(localNumber)) {
            return {
                isValid: false,
                error: 'Phone number contains invalid characters',
                countryInfo,
            };
        }
        let errorMessage = undefined;
        if (!isValid) {
            const { countryCode: extractedCode } = extractCountryCode(phoneNumber);
            if (extractedCode === country_constants_1.DEFAULT_COUNTRY_CODE &&
                !phoneNumber.startsWith('+')) {
                const cleanedNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
                if (cleanedNumber.match(/^(07|08|09|01)/)) {
                    errorMessage =
                        'Invalid Nigerian phone number format. Please use 11 digits starting with 07, 08, 09, or 01';
                }
                else {
                    errorMessage =
                        'Please provide the phone number with country code (e.g., +234 for Nigeria, +1 for US/Canada) or specify the country code separately';
                }
            }
            else {
                errorMessage = 'Invalid phone number format';
            }
        }
        return {
            isValid,
            error: errorMessage,
            countryInfo,
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: 'Invalid phone number format',
        };
    }
}
function normalizePhoneNumber(phoneNumber) {
    const { countryCode, localNumber, isValid } = extractCountryCode(phoneNumber);
    if (!isValid) {
        throw new phone_exception_1.InvalidPhoneFormatException(phoneNumber, 'Unable to parse phone number format');
    }
    return formatPhoneNumberWithCountryCode(countryCode, localNumber);
}
function isInternationalFormat(phoneNumber) {
    return phoneNumber.startsWith('+');
}
function toInternationalFormat(localNumber, countryCode = country_constants_1.DEFAULT_COUNTRY_CODE) {
    return formatPhoneNumberWithCountryCode(countryCode, localNumber);
}
function formatPhoneNumberWithCountryDetails(phoneNumber) {
    const { countryCode, localNumber, countryInfo } = extractCountryCode(phoneNumber);
    const flag = (0, country_constants_1.getCountryFlag)(countryCode);
    const countryName = countryInfo?.country || 'Unknown';
    return `${flag || ''} ${countryName} ${formatPhoneNumberWithCountryCode(countryCode, localNumber)}`;
}
function validateAndFormatPhoneNumberWithDetails(phoneNumber) {
    const { countryCode, localNumber, countryInfo } = extractCountryCode(phoneNumber);
    const validation = validatePhoneNumber(phoneNumber);
    return {
        isValid: validation.isValid,
        formattedNumber: formatPhoneNumberWithCountryCode(countryCode, localNumber),
        countryCode,
        localNumber,
        countryInfo,
        flag: (0, country_constants_1.getCountryFlag)(countryCode) || undefined,
        currency: (0, country_constants_1.getCountryCurrency)(countryCode) || undefined,
        timezone: (0, country_constants_1.getCountryTimezone)(countryCode) || undefined,
        error: validation.error,
    };
}
function validateLocalPhoneNumber(localNumber, countryCode) {
    try {
        const cleanedNumber = localNumber.replace(/[\s\-\(\)\.]/g, '');
        if (!cleanedNumber || cleanedNumber.length < 7) {
            throw new phone_exception_1.PhoneTooShortException(localNumber, 7);
        }
        if (!(0, country_constants_1.isSupportedCountryCode)(countryCode)) {
            const supportedCountries = Object.keys(country_constants_1.COUNTRY_CODES);
            throw new phone_exception_1.UnsupportedCountryException(countryCode, supportedCountries);
        }
        const countryInfo = country_constants_1.COUNTRY_CODES[countryCode];
        if (cleanedNumber.length < 7) {
            throw new phone_exception_1.PhoneTooShortException(localNumber, 7);
        }
        if (cleanedNumber.length > 15) {
            throw new phone_exception_1.PhoneTooLongException(localNumber, 15);
        }
        if (!/^\d+$/.test(cleanedNumber)) {
            const invalidChars = [...new Set(cleanedNumber.replace(/\d/g, ''))];
            throw new phone_exception_1.InvalidPhoneCharactersException(localNumber, invalidChars);
        }
        const expectedLength = countryInfo.length - countryCode.length + 1;
        const isValidLength = cleanedNumber.length >= expectedLength - 2 &&
            cleanedNumber.length <= expectedLength + 2;
        return {
            isValid: isValidLength,
            error: isValidLength
                ? undefined
                : `Expected ${expectedLength} digits for ${countryInfo.country} phone numbers`,
            countryInfo,
        };
    }
    catch (error) {
        if (error instanceof phone_exception_1.InvalidPhoneFormatException ||
            error instanceof phone_exception_1.UnsupportedCountryException ||
            error instanceof phone_exception_1.PhoneTooShortException ||
            error instanceof phone_exception_1.PhoneTooLongException ||
            error instanceof phone_exception_1.InvalidPhoneCharactersException) {
            throw error;
        }
        return {
            isValid: false,
            error: 'Invalid phone number format',
        };
    }
}
function validatePhoneNumberWithExceptions(phoneNumber, countryCode) {
    try {
        const { countryCode: extractedCode, localNumber, countryInfo, isValid, } = extractCountryCode(phoneNumber);
        if (countryCode && extractedCode !== countryCode) {
            throw new phone_exception_1.InvalidPhoneFormatException(phoneNumber, `Expected country code ${countryCode}, but found ${extractedCode}`);
        }
        if (!isValid) {
            throw new phone_exception_1.InvalidPhoneFormatException(phoneNumber, 'Phone number format is invalid');
        }
        if (!(0, country_constants_1.isSupportedCountryCode)(extractedCode)) {
            const supportedCountries = Object.keys(country_constants_1.COUNTRY_CODES);
            throw new phone_exception_1.UnsupportedCountryException(extractedCode, supportedCountries);
        }
        const cleanedLocalNumber = localNumber.replace(/[\s\-\(\)\.]/g, '');
        if (cleanedLocalNumber.length < 7) {
            throw new phone_exception_1.PhoneTooShortException(phoneNumber, 7);
        }
        if (cleanedLocalNumber.length > 15) {
            throw new phone_exception_1.PhoneTooLongException(phoneNumber, 15);
        }
        if (!/^\d+$/.test(cleanedLocalNumber)) {
            const invalidChars = [...new Set(cleanedLocalNumber.replace(/\d/g, ''))];
            throw new phone_exception_1.InvalidPhoneCharactersException(phoneNumber, invalidChars);
        }
        return {
            isValid: true,
            countryInfo,
        };
    }
    catch (error) {
        if (error instanceof phone_exception_1.InvalidPhoneFormatException ||
            error instanceof phone_exception_1.UnsupportedCountryException ||
            error instanceof phone_exception_1.PhoneTooShortException ||
            error instanceof phone_exception_1.PhoneTooLongException ||
            error instanceof phone_exception_1.InvalidPhoneCharactersException) {
            throw error;
        }
        throw new phone_exception_1.InvalidPhoneFormatException(phoneNumber, 'Unknown validation error');
    }
}
//# sourceMappingURL=phone.utils.js.map