/*
 * Zugriff auf die gepflegten Inhalte in src/content/*.json (Länder, Hausapotheke, Vorsorge, Anbieter).
 * Länderspezifisches hängt am LAND (ISO-Code), nicht an der Sprache. Prüfung: npm run check:content.
 */
import careData from "@/content/careInfo.json";
import cabinetData from "@/content/medicineCabinet.json";
import countryData from "@/content/countries.json";
import providerData from "@/content/providers.json";

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

/**
 * Hausapotheke für ein Land. Arzneimittel ohne fachliche Freigabe erscheinen nur in Entwicklungs-
 * Builds (dort mit „Ungeprüft“-Kennzeichnung); im Store-Build fehlen sie, bis status "reviewed" ist.
 */
export function cabinetItems(code) {
  return cabinetData.items.filter(appliesTo(code)).filter((item) => item.kind !== "medicine" || item.status === "reviewed" || __DEV__);
}

/** Gibt es für das Land fachlich geprüfte Arzneimittel-Empfehlungen? */
export function hasReviewedMedicines(code) {
  return cabinetData.items.some((item) => item.country === code && item.kind === "medicine" && item.status === "reviewed");
}

/** Vorsorge-Text zu einem Thema: zuerst länderspezifisch, sonst allgemein ("*"), sonst null. */
export function careInfo(code, topic) {
  const items = careData.items.filter((item) => item.topic === topic);
  return items.find((item) => item.country === code) || items.find((item) => item.country === "*") || null;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Kooperation läuft gerade (Partner + innerhalb des Vertragszeitraums). */
export function isActivePartner(provider, date = today()) {
  if (!provider.partner) return false;
  if (provider.contractFrom && date < provider.contractFrom) return false;
  if (provider.contractTo && date > provider.contractTo) return false;
  return true;
}

/** Aktive Anbieter eines Typs im Land; Partner zuerst (nach Priorität), Demo-Einträge nur in Entwicklungs-Builds. */
export function providersFor(code, type) {
  const date = today();
  return providerData.providers
    .filter((p) => p.type === type && p.country === code && p.active && (!p.demo || __DEV__))
    .sort((a, b) => {
      const pa = isActivePartner(a, date);
      const pb = isActivePartner(b, date);
      if (pa !== pb) return pa ? -1 : 1;
      return (a.priority ?? 99) - (b.priority ?? 99);
    });
}

/** Sterbegeld-Kachel nur, wenn es im Land mindestens einen aktiven Kooperationspartner gibt. */
export function hasInsurancePartner(code) {
  return providersFor(code, "insurance").some((p) => isActivePartner(p));
}

/** Website mit den im Datensatz hinterlegten Tracking-Parametern (keine personenbezogenen Daten). */
export function providerUrl(provider) {
  if (!provider.website) return "";
  if (!provider.tracking || !isActivePartner(provider)) return provider.website;
  return `${provider.website}${provider.website.includes("?") ? "&" : "?"}${provider.tracking}`;
}
