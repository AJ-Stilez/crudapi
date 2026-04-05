import * as mobileNumberPrefix from 'src/shared/data/telephone-providers.json';

import { COUNTRY_CODES, CountryCode, CountryInfo, DEFAULT_COUNTRY_CODE, getAllCountryCodes, getCountriesByRegion, getCountryByCode, getCountryCurrency, getCountryFlag, getCountryTimezone, isSupportedCountryCode, Region, REGIONS } from 'src/constants/country.constants';
import { InvalidPhoneCharactersException, InvalidPhoneFormatException, PhoneTooLongException, PhoneTooShortException, UnsupportedCountryException } from 'src/exception/phone.exception';

export function fetchPhoneNumberLookup(phoneNumber: string) {
  let value: string;
  let prefix: string;
  prefix = phoneNumber.slice(0, 4);
  value = mobileNumberPrefix[prefix];
  if (value == undefined) {
    prefix = phoneNumber.slice(0, 5);
    value = mobileNumberPrefix[prefix];
  }
  return { provider: value ?? 'Not available', isAvailable: !!value };
}

/**
 * Extracts country code and local number from a phone number
 * @param phoneNumber - The phone number to parse
 * @returns Object containing country code and local number
 */
export function extractCountryCode(phoneNumber: string): {
  countryCode: string;
  localNumber: string;
  countryInfo?: CountryInfo;
  isValid: boolean;
} {
  try {
    // Remove any spaces, dashes, parentheses, and other formatting
    const cleanedNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '');

    // Validate input
    if (!cleanedNumber || cleanedNumber.length < 7) {
      return {
        countryCode: DEFAULT_COUNTRY_CODE,
        localNumber: phoneNumber,
        isValid: false,
      };
    }

    // Check if number starts with + (international format)
    if (cleanedNumber.startsWith('+')) {
      // Try to match with known country codes (longest first to avoid partial matches)
      const sortedCodes = Object.keys(COUNTRY_CODES).sort(
        (a, b) => b.length - a.length,
      ) as CountryCode[];

      for (const code of sortedCodes) {
        if (cleanedNumber.startsWith(code)) {
          const localNumber = cleanedNumber.substring(code.length);

          // Basic validation for local number length
          const countryInfo = COUNTRY_CODES[code];
          const isValidLength =
            localNumber.length >= countryInfo.length - code.length + 1;

          return {
            countryCode: code,
            localNumber,
            countryInfo,
            isValid: isValidLength && /^\d+$/.test(localNumber),
          };
        }
      }

      // If no specific country code found, try to guess based on length
      const unknownCode = cleanedNumber.match(/^\+(\d{1,4})/)?.[1];
      if (unknownCode) {
        return {
          countryCode: `+${unknownCode}`,
          localNumber: cleanedNumber.substring(unknownCode.length + 1),
          isValid: false,
        };
      }

      // Default to Nigeria for unknown international numbers
      return {
        countryCode: DEFAULT_COUNTRY_CODE,
        localNumber: cleanedNumber.substring(1),
        countryInfo: COUNTRY_CODES[DEFAULT_COUNTRY_CODE],
        isValid: false,
      };
    }

    // If no + prefix, try to match with known country codes first
    const sortedCodes = Object.keys(COUNTRY_CODES).sort(
      (a, b) => b.length - a.length,
    ) as CountryCode[];

    for (const code of sortedCodes) {
      const codeWithoutPlus = code.substring(1); // Remove the + prefix
      if (cleanedNumber.startsWith(codeWithoutPlus)) {
        const localNumber = cleanedNumber.substring(codeWithoutPlus.length);

        // Basic validation for local number length
        const countryInfo = COUNTRY_CODES[code];
        const isValidLength =
          localNumber.length >= countryInfo.length - code.length + 1;

        return {
          countryCode: code,
          localNumber,
          countryInfo,
          isValid: isValidLength && /^\d+$/.test(localNumber),
        };
      }
    }

    // If no country code match found, check if it's a Nigerian local number
    // Nigerian mobile numbers typically start with 07, 08, 09, or 01 and are 11 digits total
    if (cleanedNumber.match(/^(07|08|09|01)\d{9}$/)) {
      // This is a valid Nigerian local number
      return {
        countryCode: DEFAULT_COUNTRY_CODE,
        localNumber: cleanedNumber,
        countryInfo: COUNTRY_CODES[DEFAULT_COUNTRY_CODE],
        isValid: true,
      };
    }

    // For other local numbers, require explicit country code
    return {
      countryCode: DEFAULT_COUNTRY_CODE,
      localNumber: cleanedNumber,
      countryInfo: COUNTRY_CODES[DEFAULT_COUNTRY_CODE],
      isValid: false, // Require explicit country code for non-Nigerian local numbers
    };
  } catch (error) {
    // Fallback for any errors
    return {
      countryCode: DEFAULT_COUNTRY_CODE,
      localNumber: phoneNumber,
      countryInfo: COUNTRY_CODES[DEFAULT_COUNTRY_CODE],
      isValid: false,
    };
  }
}

/**
 * Formats a phone number with country code
 * @param countryCode - The country code
 * @param localNumber - The local number
 * @returns Formatted phone number
 */
export function formatPhoneNumberWithCountryCode(
  countryCode: string,
  localNumber: string,
): string {
  // For Nigerian numbers, remove the leading 0 when adding +234
  // For other countries, remove all leading zeros
  let cleanedLocalNumber;
  if (countryCode === '+234' && localNumber.startsWith('0')) {
    cleanedLocalNumber = localNumber.substring(1);
  } else {
    cleanedLocalNumber = localNumber.replace(/^0+/, '');
  }
  return `${countryCode}${cleanedLocalNumber}`;
}

/**
 * Validates a phone number format
 * @param phoneNumber - The phone number to validate
 * @param countryCode - Optional country code for validation
 * @returns Validation result
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode?: string,
): {
  isValid: boolean;
  error?: string;
  countryInfo?: CountryInfo;
} {
  try {
    const {
      countryCode: extractedCode,
      localNumber,
      countryInfo,
      isValid,
    } = extractCountryCode(phoneNumber);

    // If specific country code was requested, check if it matches
    if (countryCode && extractedCode !== countryCode) {
      return {
        isValid: false,
        error: `Expected country code ${countryCode}, but found ${extractedCode}`,
      };
    }

    // Check if the number is too short or too long
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

    // Check if local number contains only digits
    if (!/^\d+$/.test(localNumber)) {
      return {
        isValid: false,
        error: 'Phone number contains invalid characters',
        countryInfo,
      };
    }

    // If the number is invalid and we couldn't match a country code, provide a helpful error
    let errorMessage = undefined as string | undefined;
    if (!isValid) {
      const { countryCode: extractedCode } = extractCountryCode(phoneNumber);
      if (
        extractedCode === DEFAULT_COUNTRY_CODE &&
        !phoneNumber.startsWith('+')
      ) {
        // Check if it looks like a Nigerian number but doesn't match the pattern
        const cleanedNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
        if (cleanedNumber.match(/^(07|08|09|01)/)) {
          errorMessage =
            'Invalid Nigerian phone number format. Please use 11 digits starting with 07, 08, 09, or 01';
        } else {
          errorMessage =
            'Please provide the phone number with country code (e.g., +234 for Nigeria, +1 for US/Canada) or specify the country code separately';
        }
      } else {
        errorMessage = 'Invalid phone number format';
      }
    }

    return {
      isValid,
      error: errorMessage,
      countryInfo,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid phone number format',
    };
  }
}

/**
 * Normalizes a phone number to international format
 * @param phoneNumber - The phone number to normalize
 * @returns Normalized phone number
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  const { countryCode, localNumber, isValid } = extractCountryCode(phoneNumber);

  if (!isValid) {
    throw new InvalidPhoneFormatException(
      phoneNumber,
      'Unable to parse phone number format',
    );
  }

  return formatPhoneNumberWithCountryCode(countryCode, localNumber);
}

/**
 * Checks if a phone number is in international format
 * @param phoneNumber - The phone number to check
 * @returns True if the number is in international format
 */
export function isInternationalFormat(phoneNumber: string): boolean {
  return phoneNumber.startsWith('+');
}

/**
 * Converts a local number to international format
 * @param localNumber - The local number
 * @param countryCode - The country code to use
 * @returns International format phone number
 */
export function toInternationalFormat(
  localNumber: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  return formatPhoneNumberWithCountryCode(countryCode, localNumber);
}

/**
 * Formats a phone number with country flag and name
 * @param phoneNumber - The phone number to format
 * @returns Formatted string with flag, country name, and phone number
 */
export function formatPhoneNumberWithCountryDetails(
  phoneNumber: string,
): string {
  const { countryCode, localNumber, countryInfo } =
    extractCountryCode(phoneNumber);
  const flag = getCountryFlag(countryCode);
  const countryName = countryInfo?.country || 'Unknown';

  return `${flag || ''} ${countryName} ${formatPhoneNumberWithCountryCode(
    countryCode,
    localNumber,
  )}`;
}

/**
 * Validates and formats a phone number with full country information
 * @param phoneNumber - The phone number to validate and format
 * @returns Object with validation result and formatted information
 */
export function validateAndFormatPhoneNumberWithDetails(phoneNumber: string): {
  isValid: boolean;
  formattedNumber: string;
  countryCode: string;
  localNumber: string;
  countryInfo?: CountryInfo;
  flag?: string;
  currency?: string;
  timezone?: string;
  error?: string;
} {
  const { countryCode, localNumber, countryInfo } =
    extractCountryCode(phoneNumber);
  const validation = validatePhoneNumber(phoneNumber);

  return {
    isValid: validation.isValid,
    formattedNumber: formatPhoneNumberWithCountryCode(countryCode, localNumber),
    countryCode,
    localNumber,
    countryInfo,
    flag: getCountryFlag(countryCode) || undefined as string | undefined,
    currency: getCountryCurrency(countryCode) || undefined as string | undefined,
    timezone: getCountryTimezone(countryCode) || undefined as string | undefined,
    error: validation.error,
  };
}

/**
 * Validates a local phone number with explicit country code
 * @param localNumber - The local phone number (without country code)
 * @param countryCode - The country code to use
 * @returns Validation result
 */
export function validateLocalPhoneNumber(
  localNumber: string,
  countryCode: string,
): {
  isValid: boolean;
  error?: string;
  countryInfo?: CountryInfo;
} {
  try {
    // Clean the local number
    const cleanedNumber = localNumber.replace(/[\s\-\(\)\.]/g, '');

    // Validate input
    if (!cleanedNumber || cleanedNumber.length < 7) {
      throw new PhoneTooShortException(localNumber, 7);
    }

    // Check if country code is supported
    if (!isSupportedCountryCode(countryCode)) {
      const supportedCountries = Object.keys(COUNTRY_CODES);
      throw new UnsupportedCountryException(countryCode, supportedCountries);
    }

    const countryInfo = COUNTRY_CODES[countryCode];

    // Check if the number is too short or too long
    if (cleanedNumber.length < 7) {
      throw new PhoneTooShortException(localNumber, 7);
    }

    if (cleanedNumber.length > 15) {
      throw new PhoneTooLongException(localNumber, 15);
    }

    // Check if local number contains only digits
    if (!/^\d+$/.test(cleanedNumber)) {
      const invalidChars = [...new Set(cleanedNumber.replace(/\d/g, ''))];
      throw new InvalidPhoneCharactersException(localNumber, invalidChars);
    }

    // Basic validation for local number length based on country
    const expectedLength = countryInfo.length - countryCode.length + 1;
    const isValidLength =
      cleanedNumber.length >= expectedLength - 2 &&
      cleanedNumber.length <= expectedLength + 2;

    return {
      isValid: isValidLength,
      error: isValidLength
        ? undefined
        : `Expected ${expectedLength} digits for ${countryInfo.country} phone numbers`,
      countryInfo,
    };
  } catch (error) {
    // If it's already a phone exception, re-throw it
    if (
      error instanceof InvalidPhoneFormatException ||
      error instanceof UnsupportedCountryException ||
      error instanceof PhoneTooShortException ||
      error instanceof PhoneTooLongException ||
      error instanceof InvalidPhoneCharactersException
    ) {
      throw error;
    }

    return {
      isValid: false,
      error: 'Invalid phone number format',
    };
  }
}

/**
 * Validates a phone number and throws specific exceptions for different error types
 * @param phoneNumber - The phone number to validate
 * @param countryCode - Optional country code for validation
 * @throws InvalidPhoneFormatException, UnsupportedCountryException, PhoneTooShortException, PhoneTooLongException, InvalidPhoneCharactersException
 */
export function validatePhoneNumberWithExceptions(
  phoneNumber: string,
  countryCode?: string,
): {
  isValid: boolean;
  countryInfo?: CountryInfo;
} {
  try {
    const {
      countryCode: extractedCode,
      localNumber,
      countryInfo,
      isValid,
    } = extractCountryCode(phoneNumber);

    // If specific country code was requested, check if it matches
    if (countryCode && extractedCode !== countryCode) {
      throw new InvalidPhoneFormatException(
        phoneNumber,
        `Expected country code ${countryCode}, but found ${extractedCode}`,
      );
    }

    if (!isValid) {
      throw new InvalidPhoneFormatException(
        phoneNumber,
        'Phone number format is invalid',
      );
    }

    // Check if country code is supported
    if (!isSupportedCountryCode(extractedCode)) {
      const supportedCountries = Object.keys(COUNTRY_CODES);
      throw new UnsupportedCountryException(extractedCode, supportedCountries);
    }

    // Validate local number length
    const cleanedLocalNumber = localNumber.replace(/[\s\-\(\)\.]/g, '');

    if (cleanedLocalNumber.length < 7) {
      throw new PhoneTooShortException(phoneNumber, 7);
    }

    if (cleanedLocalNumber.length > 15) {
      throw new PhoneTooLongException(phoneNumber, 15);
    }

    // Check for invalid characters
    if (!/^\d+$/.test(cleanedLocalNumber)) {
      const invalidChars = [...new Set(cleanedLocalNumber.replace(/\d/g, ''))];
      throw new InvalidPhoneCharactersException(phoneNumber, invalidChars);
    }

    return {
      isValid: true,
      countryInfo,
    };
  } catch (error) {
    // Re-throw phone exceptions
    if (
      error instanceof InvalidPhoneFormatException ||
      error instanceof UnsupportedCountryException ||
      error instanceof PhoneTooShortException ||
      error instanceof PhoneTooLongException ||
      error instanceof InvalidPhoneCharactersException
    ) {
      throw error;
    }

    // Wrap other errors
    throw new InvalidPhoneFormatException(
      phoneNumber,
      'Unknown validation error',
    );
  }
}

// Re-export essential functions from country constants for convenience
export {
  getCountryByCode,
  getCountriesByRegion,
  getAllCountryCodes,
  isSupportedCountryCode,
  getCountryFlag,
  getCountryCurrency,
  getCountryTimezone,
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  REGIONS,
  type CountryCode,
  type CountryInfo,
  type Region,
};
