export const LANGUAGES = [
  { code: "de", label: "Deutsch", flag: "🇩🇪", dir: "ltr", speech: "de-DE" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr", speech: "en-GB" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", dir: "ltr", speech: "tr-TR" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl", speech: "ar-SA" },
  { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr", speech: "ru-RU" },
  { code: "uk", label: "Українська", flag: "🇺🇦", dir: "ltr", speech: "uk-UA" },
  { code: "pl", label: "Polski", flag: "🇵🇱", dir: "ltr", speech: "pl-PL" },
];

export const DEFAULT_LANG = "de";

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

export function getLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
