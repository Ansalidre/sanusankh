/*
 * Zugriff auf die gepflegten Inhalte in src/content/*.json (Länder, Hausapotheke, Vorsorge).
 * Länderspezifisches hängt am LAND (ISO-Code), nicht an der Sprache. Prüfung: npm run check:content.
 */
import careData from "@/content/careInfo.json";
import cabinetData from "@/content/medicineCabinet.json";
import countryData from "@/content/countries.json";

export const COUNTRIES = countryData.countries;
export const DEFAULT_COUNTRY = countryData.defaultCountry;
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code);

/** Notruf, der in allen unterstützten Ländern funktioniert (EU-weit, Schweiz, Türkei). */
export const FALLBACK_EMERGENCY = countryData.fallbackEmergency;

export function getCountry(code) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY);
}

export function findNumber(country, kind) {
  return country.numbers.find((n) => n.kind === kind) || null;
}

/** Eintrag für ärztlichen Rat außerhalb von Notfällen (DE: 116117, AT: 1450) oder null. */
export function oncallEntry(country) {
  return findNumber(country, "oncall") || findNumber(country, "advice");
}

export function oncallNumber(country) {
  return oncallEntry(country)?.number ?? null;
}

const appliesTo = (code) => (item) => item.country === "*" || item.country === code;

/** Checkliste der Hausapotheke für ein Land (nur Verbandsmaterial und Hilfsmittel, keine Arzneimittel). */
export function cabinetItems(code) {
  return cabinetData.items.filter(appliesTo(code));
}

/** Vorsorge-Text zu einem Thema: zuerst länderspezifisch, sonst allgemein ("*"), sonst null. */
export function careInfo(code, topic) {
  const items = careData.items.filter((item) => item.topic === topic);
  return items.find((item) => item.country === code) || items.find((item) => item.country === "*") || null;
}
