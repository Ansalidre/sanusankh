/*
 * Oberflächentexte nachschlagen. Die Texte selbst liegen je Sprache in src/locales/<code>.js,
 * die Liste der Sprachen in src/data/languages.js.
 */
import { DEFAULT_LANG, getLanguage } from "@/data/languages";

const isText = (value) => typeof value === "string" && value.trim() !== "";

/**
 * Text zu `key` in `lang`. Fehlt er oder ist er leer, gilt der deutsche Text – nie ein leerer
 * String oder der Schlüsselname (nur wenn der Schlüssel auch auf Deutsch fehlt: Programmierfehler).
 * `{name}`-Platzhalter werden aus `vars` ersetzt.
 */
export function translate(lang, key, vars) {
  const own = getLanguage(lang).messages[key];
  let text = isText(own) ? own : getLanguage(DEFAULT_LANG).messages[key];
  if (!isText(text)) {
    if (__DEV__) console.warn(`[i18n] Schlüssel fehlt auch auf Deutsch: ${key}`);
    return key;
  }
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value ?? ""));
    }
  }
  return text;
}
