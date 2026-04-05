import { COUNTRY_CODES, CountryCode, CountryInfo, DEFAULT_COUNTRY_CODE, getAllCountryCodes, getCountriesByRegion, getCountryByCode, getCountryCurrency, getCountryFlag, getCountryTimezone, isSupportedCountryCode, Region, REGIONS } from 'src/constants/country.constants';
export declare function fetchPhoneNumberLookup(phoneNumber: string): {
    provider: string;
    isAvailable: boolean;
};
export declare function extractCountryCode(phoneNumber: string): {
    countryCode: string;
    localNumber: string;
    countryInfo?: CountryInfo;
    isValid: boolean;
};
export declare function formatPhoneNumberWithCountryCode(countryCode: string, localNumber: string): string;
export declare function validatePhoneNumber(phoneNumber: string, countryCode?: string): {
    isValid: boolean;
    error?: string;
    countryInfo?: CountryInfo;
};
export declare function normalizePhoneNumber(phoneNumber: string): string;
export declare function isInternationalFormat(phoneNumber: string): boolean;
export declare function toInternationalFormat(localNumber: string, countryCode?: string): string;
export declare function formatPhoneNumberWithCountryDetails(phoneNumber: string): string;
export declare function validateAndFormatPhoneNumberWithDetails(phoneNumber: string): {
    isValid: boolean;
    formattedNumber: string;
    countryCode: string;
    localNumber: string;
    countryInfo?: CountryInfo;
    flag?: string;
    currency?: string;
    timezone?: string;
    error?: string;
};
export declare function validateLocalPhoneNumber(localNumber: string, countryCode: string): {
    isValid: boolean;
    error?: string;
    countryInfo?: CountryInfo;
};
export declare function validatePhoneNumberWithExceptions(phoneNumber: string, countryCode?: string): {
    isValid: boolean;
    countryInfo?: CountryInfo;
};
export { getCountryByCode, getCountriesByRegion, getAllCountryCodes, isSupportedCountryCode, getCountryFlag, getCountryCurrency, getCountryTimezone, COUNTRY_CODES, DEFAULT_COUNTRY_CODE, REGIONS, type CountryCode, type CountryInfo, type Region, };
