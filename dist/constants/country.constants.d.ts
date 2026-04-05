export interface CountryInfo {
    country: string;
    region: string;
    length: number;
    flag?: string;
    currency?: string;
    timezone?: string;
}
export declare const COUNTRY_CODES: Record<string, CountryInfo>;
export type CountryCode = keyof typeof COUNTRY_CODES;
export declare const DEFAULT_COUNTRY_CODE: CountryCode;
export declare const REGIONS: {
    readonly AFRICA: "Africa";
    readonly NORTH_AMERICA: "North America";
    readonly SOUTH_AMERICA: "South America";
    readonly EUROPE: "Europe";
    readonly ASIA: "Asia";
    readonly OCEANIA: "Oceania";
};
export type Region = (typeof REGIONS)[keyof typeof REGIONS];
export declare function getCountryByCode(countryCode: string): CountryInfo | null;
export declare function getCountriesByRegion(region: Region): Array<{
    code: CountryCode;
    info: CountryInfo;
}>;
export declare function getAllCountryCodes(): Array<{
    code: CountryCode;
    info: CountryInfo;
}>;
export declare function isSupportedCountryCode(countryCode: string): countryCode is CountryCode;
export declare function getCountryFlag(countryCode: string): string | null;
export declare function getCountryCurrency(countryCode: string): string | null;
export declare function getCountryTimezone(countryCode: string): string | null;
