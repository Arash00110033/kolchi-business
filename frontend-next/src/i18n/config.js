export const SUPPORTED_LOCALES = [
  "fa",
  "en",
  "es",
  "it",
  "he",
  "zh",
  "ja",
  "ar",
];

export const RTL_LOCALES = ["fa", "ar", "he"];

export const DEFAULT_LOCALE = "fa";

export function isRTL(locale) {
  return RTL_LOCALES.includes(locale);
}