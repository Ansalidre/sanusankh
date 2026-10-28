import { createContext, createElement, useCallback, useContext, useMemo, useState } from "react";
import { getLocales } from "expo-localization";
import { DEFAULT_LANG, LANGUAGE_CODES, getLanguage } from "@/data/languages";
import { COUNTRY_CODES, DEFAULT_COUNTRY, getCountry, oncallNumber } from "@/lib/content";
import { translate } from "@/lib/translations";
import { prefs } from "@/lib/storage";

const I18nContext = createContext(null);

function deviceLocales() {
  try {
    return getLocales();
  } catch {
    return []; // Gerätesprache nicht ermittelbar
  }
}

/** Gespeicherte Sprache, sonst die erste unterstützte Gerätesprache, sonst Deutsch. */
function initialLang() {
  const stored = prefs.get().lang;
  if (LANGUAGE_CODES.includes(stored)) return stored;
  const device = deviceLocales()
    .map((l) => l.languageCode)
    .find((code) => LANGUAGE_CODES.includes(code));
  return device || DEFAULT_LANG;
}

/** Vorschlag aus der Geräteregion (nicht aus der Sprache!) – der Nutzer bestätigt ihn beim ersten Start. */
export function suggestedCountry() {
  const region = deviceLocales()
    .map((l) => l.regionCode)
    .find((code) => COUNTRY_CODES.includes(code));
  return region || DEFAULT_COUNTRY;
}

function initialCountry() {
  const stored = prefs.get().country;
  return COUNTRY_CODES.includes(stored) ? stored : suggestedCountry();
}

/**
 * Sprache, Leserichtung und Land. RTL wird nicht über I18nManager (Neustart nötig), sondern über
 * `direction` im Layout gesetzt – so wechselt Arabisch sofort (siehe components/ui/Text.js, Screen.js).
 * Das Land ist unabhängig von der Sprache und bestimmt Nummern und länderspezifische Inhalte.
 */
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const [countryCode, setCountryState] = useState(initialCountry);
  const [countryConfirmed, setCountryConfirmed] = useState(() => COUNTRY_CODES.includes(prefs.get().country));
  const language = getLanguage(lang);
  const country = getCountry(countryCode);

  const setLang = useCallback((code) => {
    if (!LANGUAGE_CODES.includes(code)) return;
    prefs.set({ lang: code });
    setLangState(code);
  }, []);

  const setCountry = useCallback((code) => {
    if (!COUNTRY_CODES.includes(code)) return;
    prefs.set({ country: code });
    setCountryState(code);
    setCountryConfirmed(true);
  }, []);

  const oncall = oncallNumber(country);

  // {oncall} und {country} stehen in jedem Text zur Verfügung (z. B. „{oncall} anrufen“).
  const t = useCallback(
    (key, vars) => translate(lang, key, { oncall, country: translate(lang, `country.${country.code}`), ...vars }),
    [lang, oncall, country.code],
  );

  const value = useMemo(
    () => ({ lang, language, dir: language.dir, rtl: language.dir === "rtl", setLang, t, country, oncall, setCountry, countryConfirmed }),
    [lang, language, setLang, t, country, oncall, setCountry, countryConfirmed],
  );

  return createElement(I18nContext.Provider, { value }, children);
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
  return value[lang] || value[DEFAULT_LANG] || "";
}
