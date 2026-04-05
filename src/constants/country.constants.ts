/**
 * Country Codes Constants
 *
 * This file contains all supported country codes with their metadata
 * including country name, region, and expected phone number length.
 */

export interface CountryInfo {
  country: string;
  region: string;
  length: number;
  flag?: string; // ISO 3166-1 alpha-2 country code for flag emoji
  currency?: string; // ISO 4217 currency code
  timezone?: string; // Primary timezone
}

// Comprehensive list of country codes with their details
export const COUNTRY_CODES: Record<string, CountryInfo> = {
  // Africa
  '+234': {
    country: 'Nigeria',
    region: 'Africa',
    length: 11,
    flag: '🇳🇬',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
  },
  '+27': {
    country: 'South Africa',
    region: 'Africa',
    length: 9,
    flag: '🇿🇦',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
  },
  '+254': {
    country: 'Kenya',
    region: 'Africa',
    length: 9,
    flag: '🇰🇪',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
  },
  '+233': {
    country: 'Ghana',
    region: 'Africa',
    length: 9,
    flag: '🇬🇭',
    currency: 'GHS',
    timezone: 'Africa/Accra',
  },
  '+256': {
    country: 'Uganda',
    region: 'Africa',
    length: 9,
    flag: '🇺🇬',
    currency: 'UGX',
    timezone: 'Africa/Kampala',
  },
  '+251': {
    country: 'Ethiopia',
    region: 'Africa',
    length: 9,
    flag: '🇪🇹',
    currency: 'ETB',
    timezone: 'Africa/Addis_Ababa',
  },
  '+20': {
    country: 'Egypt',
    region: 'Africa',
    length: 10,
    flag: '🇪🇬',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
  },
  '+212': {
    country: 'Morocco',
    region: 'Africa',
    length: 9,
    flag: '🇲🇦',
    currency: 'MAD',
    timezone: 'Africa/Casablanca',
  },
  '+225': {
    country: 'Ivory Coast',
    region: 'Africa',
    length: 8,
    flag: '🇨🇮',
    currency: 'XOF',
    timezone: 'Africa/Abidjan',
  },
  '+237': {
    country: 'Cameroon',
    region: 'Africa',
    length: 9,
    flag: '🇨🇲',
    currency: 'XAF',
    timezone: 'Africa/Douala',
  },

  // North America
  '+1': {
    country: 'US/Canada',
    region: 'North America',
    length: 10,
    flag: '🇺🇸',
    currency: 'USD',
    timezone: 'America/New_York',
  },
  '+52': {
    country: 'Mexico',
    region: 'North America',
    length: 10,
    flag: '🇲🇽',
    currency: 'MXN',
    timezone: 'America/Mexico_City',
  },

  // Europe
  '+44': {
    country: 'UK',
    region: 'Europe',
    length: 10,
    flag: '🇬🇧',
    currency: 'GBP',
    timezone: 'Europe/London',
  },
  '+33': {
    country: 'France',
    region: 'Europe',
    length: 9,
    flag: '🇫🇷',
    currency: 'EUR',
    timezone: 'Europe/Paris',
  },
  '+49': {
    country: 'Germany',
    region: 'Europe',
    length: 11,
    flag: '🇩🇪',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
  },
  '+39': {
    country: 'Italy',
    region: 'Europe',
    length: 10,
    flag: '🇮🇹',
    currency: 'EUR',
    timezone: 'Europe/Rome',
  },
  '+34': {
    country: 'Spain',
    region: 'Europe',
    length: 9,
    flag: '🇪🇸',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
  '+31': {
    country: 'Netherlands',
    region: 'Europe',
    length: 9,
    flag: '🇳🇱',
    currency: 'EUR',
    timezone: 'Europe/Amsterdam',
  },
  '+46': {
    country: 'Sweden',
    region: 'Europe',
    length: 9,
    flag: '🇸🇪',
    currency: 'SEK',
    timezone: 'Europe/Stockholm',
  },
  '+47': {
    country: 'Norway',
    region: 'Europe',
    length: 8,
    flag: '🇳🇴',
    currency: 'NOK',
    timezone: 'Europe/Oslo',
  },
  '+45': {
    country: 'Denmark',
    region: 'Europe',
    length: 8,
    flag: '🇩🇰',
    currency: 'DKK',
    timezone: 'Europe/Copenhagen',
  },
  '+358': {
    country: 'Finland',
    region: 'Europe',
    length: 9,
    flag: '🇫🇮',
    currency: 'EUR',
    timezone: 'Europe/Helsinki',
  },
  '+48': {
    country: 'Poland',
    region: 'Europe',
    length: 9,
    flag: '🇵🇱',
    currency: 'PLN',
    timezone: 'Europe/Warsaw',
  },
  '+420': {
    country: 'Czech Republic',
    region: 'Europe',
    length: 9,
    flag: '🇨🇿',
    currency: 'CZK',
    timezone: 'Europe/Prague',
  },
  '+36': {
    country: 'Hungary',
    region: 'Europe',
    length: 9,
    flag: '🇭🇺',
    currency: 'HUF',
    timezone: 'Europe/Budapest',
  },
  '+43': {
    country: 'Austria',
    region: 'Europe',
    length: 11,
    flag: '🇦🇹',
    currency: 'EUR',
    timezone: 'Europe/Vienna',
  },
  '+41': {
    country: 'Switzerland',
    region: 'Europe',
    length: 9,
    flag: '🇨🇭',
    currency: 'CHF',
    timezone: 'Europe/Zurich',
  },
  '+32': {
    country: 'Belgium',
    region: 'Europe',
    length: 9,
    flag: '🇧🇪',
    currency: 'EUR',
    timezone: 'Europe/Brussels',
  },
  '+351': {
    country: 'Portugal',
    region: 'Europe',
    length: 9,
    flag: '🇵🇹',
    currency: 'EUR',
    timezone: 'Europe/Lisbon',
  },
  '+30': {
    country: 'Greece',
    region: 'Europe',
    length: 10,
    flag: '🇬🇷',
    currency: 'EUR',
    timezone: 'Europe/Athens',
  },
  '+90': {
    country: 'Turkey',
    region: 'Europe',
    length: 10,
    flag: '🇹🇷',
    currency: 'TRY',
    timezone: 'Europe/Istanbul',
  },
  '+7': {
    country: 'Russia',
    region: 'Europe',
    length: 10,
    flag: '🇷🇺',
    currency: 'RUB',
    timezone: 'Europe/Moscow',
  },

  // Asia
  '+81': {
    country: 'Japan',
    region: 'Asia',
    length: 10,
    flag: '🇯🇵',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
  },
  '+86': {
    country: 'China',
    region: 'Asia',
    length: 11,
    flag: '🇨🇳',
    currency: 'CNY',
    timezone: 'Asia/Shanghai',
  },
  '+91': {
    country: 'India',
    region: 'Asia',
    length: 10,
    flag: '🇮🇳',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  },
  '+82': {
    country: 'South Korea',
    region: 'Asia',
    length: 10,
    flag: '🇰🇷',
    currency: 'KRW',
    timezone: 'Asia/Seoul',
  },
  '+65': {
    country: 'Singapore',
    region: 'Asia',
    length: 8,
    flag: '🇸🇬',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
  },
  '+60': {
    country: 'Malaysia',
    region: 'Asia',
    length: 9,
    flag: '🇲🇾',
    currency: 'MYR',
    timezone: 'Asia/Kuala_Lumpur',
  },
  '+66': {
    country: 'Thailand',
    region: 'Asia',
    length: 9,
    flag: '🇹🇭',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
  },
  '+84': {
    country: 'Vietnam',
    region: 'Asia',
    length: 9,
    flag: '🇻🇳',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
  },
  '+63': {
    country: 'Philippines',
    region: 'Asia',
    length: 10,
    flag: '🇵🇭',
    currency: 'PHP',
    timezone: 'Asia/Manila',
  },
  '+62': {
    country: 'Indonesia',
    region: 'Asia',
    length: 9,
    flag: '🇮🇩',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
  },
  '+880': {
    country: 'Bangladesh',
    region: 'Asia',
    length: 10,
    flag: '🇧🇩',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
  },
  '+92': {
    country: 'Pakistan',
    region: 'Asia',
    length: 10,
    flag: '🇵🇰',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
  },
  '+971': {
    country: 'UAE',
    region: 'Asia',
    length: 9,
    flag: '🇦🇪',
    currency: 'AED',
    timezone: 'Asia/Dubai',
  },
  '+966': {
    country: 'Saudi Arabia',
    region: 'Asia',
    length: 9,
    flag: '🇸🇦',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
  },
  '+972': {
    country: 'Israel',
    region: 'Asia',
    length: 9,
    flag: '🇮🇱',
    currency: 'ILS',
    timezone: 'Asia/Jerusalem',
  },
  '+98': {
    country: 'Iran',
    region: 'Asia',
    length: 10,
    flag: '🇮🇷',
    currency: 'IRR',
    timezone: 'Asia/Tehran',
  },
  '+95': {
    country: 'Myanmar',
    region: 'Asia',
    length: 10,
    flag: '🇲🇲',
    currency: 'MMK',
    timezone: 'Asia/Yangon',
  },
  '+855': {
    country: 'Cambodia',
    region: 'Asia',
    length: 9,
    flag: '🇰🇭',
    currency: 'KHR',
    timezone: 'Asia/Phnom_Penh',
  },
  '+856': {
    country: 'Laos',
    region: 'Asia',
    length: 10,
    flag: '🇱🇦',
    currency: 'LAK',
    timezone: 'Asia/Vientiane',
  },
  '+977': {
    country: 'Nepal',
    region: 'Asia',
    length: 10,
    flag: '🇳🇵',
    currency: 'NPR',
    timezone: 'Asia/Kathmandu',
  },
  '+94': {
    country: 'Sri Lanka',
    region: 'Asia',
    length: 9,
    flag: '🇱🇰',
    currency: 'LKR',
    timezone: 'Asia/Colombo',
  },

  // Oceania
  '+61': {
    country: 'Australia',
    region: 'Oceania',
    length: 9,
    flag: '🇦🇺',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
  },
  '+64': {
    country: 'New Zealand',
    region: 'Oceania',
    length: 9,
    flag: '🇳🇿',
    currency: 'NZD',
    timezone: 'Pacific/Auckland',
  },
  '+675': {
    country: 'Papua New Guinea',
    region: 'Oceania',
    length: 8,
    flag: '🇵🇬',
    currency: 'PGK',
    timezone: 'Pacific/Port_Moresby',
  },
  '+679': {
    country: 'Fiji',
    region: 'Oceania',
    length: 7,
    flag: '🇫🇯',
    currency: 'FJD',
    timezone: 'Pacific/Fiji',
  },

  // South America
  '+55': {
    country: 'Brazil',
    region: 'South America',
    length: 11,
    flag: '🇧🇷',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
  },
  '+54': {
    country: 'Argentina',
    region: 'South America',
    length: 10,
    flag: '🇦🇷',
    currency: 'ARS',
    timezone: 'America/Argentina/Buenos_Aires',
  },
  '+57': {
    country: 'Colombia',
    region: 'South America',
    length: 10,
    flag: '🇨🇴',
    currency: 'COP',
    timezone: 'America/Bogota',
  },
  '+51': {
    country: 'Peru',
    region: 'South America',
    length: 9,
    flag: '🇵🇪',
    currency: 'PEN',
    timezone: 'America/Lima',
  },
  '+56': {
    country: 'Chile',
    region: 'South America',
    length: 9,
    flag: '🇨🇱',
    currency: 'CLP',
    timezone: 'America/Santiago',
  },
  '+58': {
    country: 'Venezuela',
    region: 'South America',
    length: 10,
    flag: '🇻🇪',
    currency: 'VES',
    timezone: 'America/Caracas',
  },
  '+593': {
    country: 'Ecuador',
    region: 'South America',
    length: 9,
    flag: '🇪🇨',
    currency: 'USD',
    timezone: 'America/Guayaquil',
  },
  '+595': {
    country: 'Paraguay',
    region: 'South America',
    length: 9,
    flag: '🇵🇾',
    currency: 'PYG',
    timezone: 'America/Asuncion',
  },
  '+598': {
    country: 'Uruguay',
    region: 'South America',
    length: 8,
    flag: '🇺🇾',
    currency: 'UYU',
    timezone: 'America/Montevideo',
  },
  '+591': {
    country: 'Bolivia',
    region: 'South America',
    length: 8,
    flag: '🇧🇴',
    currency: 'BOB',
    timezone: 'America/La_Paz',
  },
  '+507': {
    country: 'Panama',
    region: 'South America',
    length: 8,
    flag: '🇵🇦',
    currency: 'PAB',
    timezone: 'America/Panama',
  },
  '+506': {
    country: 'Costa Rica',
    region: 'South America',
    length: 8,
    flag: '🇨🇷',
    currency: 'CRC',
    timezone: 'America/Costa_Rica',
  },
  '+503': {
    country: 'El Salvador',
    region: 'South America',
    length: 8,
    flag: '🇸🇻',
    currency: 'USD',
    timezone: 'America/El_Salvador',
  },
  '+502': {
    country: 'Guatemala',
    region: 'South America',
    length: 8,
    flag: '🇬🇹',
    currency: 'GTQ',
    timezone: 'America/Guatemala',
  },
  '+504': {
    country: 'Honduras',
    region: 'South America',
    length: 8,
    flag: '🇭🇳',
    currency: 'HNL',
    timezone: 'America/Tegucigalpa',
  },
  '+505': {
    country: 'Nicaragua',
    region: 'South America',
    length: 8,
    flag: '🇳🇮',
    currency: 'NIO',
    timezone: 'America/Managua',
  },
} as const;

// Type definitions
export type CountryCode = keyof typeof COUNTRY_CODES;

// Default country code (Nigeria)
export const DEFAULT_COUNTRY_CODE: CountryCode = '+234';

// Regions
export const REGIONS = {
  AFRICA: 'Africa',
  NORTH_AMERICA: 'North America',
  SOUTH_AMERICA: 'South America',
  EUROPE: 'Europe',
  ASIA: 'Asia',
  OCEANIA: 'Oceania',
} as const;

export type Region = (typeof REGIONS)[keyof typeof REGIONS];

// Helper functions
export function getCountryByCode(countryCode: string): CountryInfo | null {
  return COUNTRY_CODES[countryCode] || null;
}

export function getCountriesByRegion(
  region: Region,
): Array<{ code: CountryCode; info: CountryInfo }> {
  return Object.entries(COUNTRY_CODES)
    .filter(([, info]) => info.region === region)
    .map(([code, info]) => ({ code: code as CountryCode, info }));
}

export function getAllCountryCodes(): Array<{
  code: CountryCode;
  info: CountryInfo;
}> {
  return Object.entries(COUNTRY_CODES).map(([code, info]) => ({
    code: code as CountryCode,
    info,
  }));
}

export function isSupportedCountryCode(
  countryCode: string,
): countryCode is CountryCode {
  return countryCode in COUNTRY_CODES;
}

export function getCountryFlag(countryCode: string): string | null {
  const country = getCountryByCode(countryCode);
  return country?.flag || null;
}

export function getCountryCurrency(countryCode: string): string | null {
  const country = getCountryByCode(countryCode);
  return country?.currency || null;
}

export function getCountryTimezone(countryCode: string): string | null {
  const country = getCountryByCode(countryCode);
  return country?.timezone || null;
}
