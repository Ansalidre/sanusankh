/*
 * Zentrale Sprachkonfiguration. Neue Sprache: Übersetzungsdatei in src/locales/ anlegen,
 * hier importieren und eintragen, `npm run check:i18n` ausführen (siehe README).
 * Komponenten lesen Sprachen nur über diese Liste – dort ist nichts zu ändern.
 */
import ar from "@/locales/ar";
import de from "@/locales/de";
import en from "@/locales/en";
import fr from "@/locales/fr";
import it from "@/locales/it";
import pl from "@/locales/pl";
import ru from "@/locales/ru";
import tr from "@/locales/tr";
import uk from "@/locales/uk";

export const LANGUAGES = [
  { code: "de", label: "Deutsch", flag: "🇩🇪", dir: "ltr", speech: "de-DE", messages: de },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr", speech: "en-GB", messages: en },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", dir: "ltr", speech: "tr-TR", messages: tr },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl", speech: "ar-SA", messages: ar },
  { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr", speech: "ru-RU", messages: ru },
  { code: "uk", label: "Українська", flag: "🇺🇦", dir: "ltr", speech: "uk-UA", messages: uk },
  { code: "pl", label: "Polski", flag: "🇵🇱", dir: "ltr", speech: "pl-PL", messages: pl },
  { code: "it", label: "Italiano", flag: "🇮🇹", dir: "ltr", speech: "it-IT", messages: it },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr", speech: "fr-FR", messages: fr },
];

/** Standard- und Rückfallsprache: fehlt ein Text in einer Sprache, wird der deutsche gezeigt. */
export const DEFAULT_LANG = "de";

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

export function getLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
