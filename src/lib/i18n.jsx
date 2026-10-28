/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANG, LANGUAGE_CODES, getLanguage } from "@/data/languages";
import { translate } from "@/lib/translations";
import { prefs } from "@/lib/storage";

const I18nContext = createContext(null);

function initialLang() {
  const stored = prefs.get().lang;
  if (LANGUAGE_CODES.includes(stored)) return stored;
  return DEFAULT_LANG;
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const language = getLanguage(lang);

  useEffect(() => {
    document.documentElement.lang = language.code;
    document.documentElement.dir = language.dir;
  }, [language]);

  const setLang = useCallback((code) => {
    if (!LANGUAGE_CODES.includes(code)) return;
    prefs.set({ lang: code });
    setLangState(code);
  }, []);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const value = useMemo(
    () => ({ lang, language, dir: language.dir, rtl: language.dir === "rtl", setLang, t }),
    [lang, language, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n muss innerhalb von <I18nProvider> verwendet werden");
  return ctx;
}

/** Liest/setzt die dauerhafte Bestätigung des Haftungshinweises. */
export function useDisclaimerAccepted() {
  const [accepted, setAccepted] = useState(() => prefs.get().disclaimerAccepted === true);
  const accept = useCallback(() => {
    prefs.set({ disclaimerAccepted: true });
    setAccepted(true);
  }, []);
  return [accepted, accept];
}

/** Wählt aus einem `{ de, en, … }`-Objekt den passenden Text, Fallback Deutsch. */
export function pick(value, lang) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value[DEFAULT_LANG] ?? "";
}
