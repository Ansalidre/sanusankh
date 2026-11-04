// Prüft die gepflegten Inhalte in src/content/*.json (Länder, Hausapotheke, Vorsorge) und die Erste-Hilfe-Themen.
// Aufruf: npm run check:content – vor jedem Build bzw. nach jeder Inhaltsänderung.
import { readFileSync } from "node:fs";

const load = (name) => JSON.parse(readFileSync(new URL(`../src/content/${name}`, import.meta.url), "utf8"));
const de = readFileSync(new URL("../src/locales/de.js", import.meta.url), "utf8");
const guides = readFileSync(new URL("../src/data/firstAidGuides.js", import.meta.url), "utf8");

let problems = 0;
const fail = (where, msg) => {
  console.error(`[${where}] ${msg}`);
  problems++;
};

const isHttps = (v) => /^https:\/\/[^\s]+$/.test(v);
// Die Hausapotheke enthält keine Arzneimittel, Dosierungen oder Anwendungshinweise.
const MEDICAL = /\d+(?:[.,]\d+)?\s*(?:mg|µg|mcg|g|ml|i\.?\s?e\.?|tabletten?|kapseln?|tropfen|stück)\b|\b(?:mal|x)\s+(?:täglich|pro tag)|\bdosis\b|\bdosierung\b|\bmittel gegen\b|\barznei|\bmedikament|\bwirkstoff/i;
const ORGS = ["drk", "johanniter", "malteser"];

// --- Länder ---
const countryData = load("countries.json");
const KINDS = ["emergency", "ambulance", "fire", "police", "oncall", "advice", "poison", "crisis", "crisisAlt"];
const codes = new Set();
for (const c of countryData.countries) {
  const where = `countries/${c.code}`;
  if (!/^[A-Z]{2}$/.test(c.code)) fail(where, "code muss ein ISO-3166-Code aus zwei Großbuchstaben sein");
  if (codes.has(c.code)) fail(where, "doppelter Ländercode");
  codes.add(c.code);
  if (!c.emergency) fail(where, "emergency (Notrufnummer) fehlt");
  if (!de.includes(`"country.${c.code}"`)) fail(where, `Ländername fehlt in src/locales/de.js (country.${c.code})`);
  for (const n of c.numbers || []) {
    if (!KINDS.includes(n.kind)) fail(where, `unbekannte Nummernart "${n.kind}" (erlaubt: ${KINDS.join(", ")})`);
    if (!n.number && !n.regions?.length) fail(where, `${n.kind}: number oder regions fehlt`);
    for (const r of n.regions || []) if (!r.region || !r.phone) fail(where, `${n.kind}: Region ohne region/phone`);
  }
  if (c.pharmacyDuty?.url && !isHttps(c.pharmacyDuty.url)) fail(where, "pharmacyDuty.url muss mit https:// beginnen");
}
if (!codes.has(countryData.defaultCountry)) fail("countries", "defaultCountry ist nicht in der Liste");

const knownCountry = (code) => code === "*" || codes.has(code);

// --- Hausapotheke ---
const ids = new Set();
for (const item of load("medicineCabinet.json").items) {
  const where = `medicineCabinet/${item.id}`;
  if (!item.id || ids.has(item.id)) fail(where, "id fehlt oder ist doppelt");
  ids.add(item.id);
  if (!knownCountry(item.country)) fail(where, `unbekanntes Land "${item.country}"`);
  if (item.kind !== "supply") fail(where, 'kind muss "supply" sein – Arzneimittel gehören nicht in die Checkliste');
  if (!item.title?.trim() || !item.description?.trim()) fail(where, "title/description fehlt");
  if (MEDICAL.test(`${item.title} ${item.description}`)) fail(where, "enthält Arzneimittel, Dosierung oder Anwendungshinweis – nicht erlaubt");
}

// --- Vorsorge ---
for (const item of load("careInfo.json").items) {
  const where = `careInfo/${item.id}`;
  if (!knownCountry(item.country)) fail(where, `unbekanntes Land "${item.country}"`);
  if (!["directive", "insurance", "funeral"].includes(item.topic)) fail(where, `unbekanntes topic "${item.topic}"`);
  if (!item.sections?.length) fail(where, "sections fehlt");
  for (const l of item.links || []) if (!l.label || !isHttps(l.url)) fail(where, `Link ungültig: ${l.url}`);
}

// --- Erste-Hilfe-Themen: nur Links auf anerkannte Hilfsorganisationen ---
let topics = 0;
for (const m of guides.matchAll(/slug: "([^"]+)"[\s\S]*?links: \[([^\]]*)\]/g)) {
  topics++;
  const links = [...m[2].matchAll(/org: "([^"]+)", url: "([^"]+)"/g)];
  if (!links.length) fail(`guides/${m[1]}`, "keine Links");
  for (const [, org, url] of links) {
    if (!ORGS.includes(org)) fail(`guides/${m[1]}`, `unbekannte Organisation "${org}"`);
    if (!isHttps(url)) fail(`guides/${m[1]}`, `Link ungültig: ${url}`);
  }
}
if (/\bsteps\s*:/.test(guides)) fail("guides", "eigene Anleitungsschritte (steps) sind nicht erlaubt");

// --- Messwerte-Tagebuch: die Texte bewerten keine Werte (MDR) ---
// Erlaubt ist nur der feste Hinweis, dass es keine Hinweise zu Medikamenten oder Insulin gibt (meas.noAdvice).
const EVALUATING =
  /zu hoch|zu niedrig|erhöht|auffällig|kritisch|gefährlich|bedenklich|normal|grenzwert|zielwert|richtwert|referenz|trend|anstieg|überwach|auswert|kontroll|analys|insulin|medikament|dosis|therapie/i;
let measTexts = 0;
for (const m of de.matchAll(/^\s*"(meas\.[\w.]+)": "(.*)",$/gm)) {
  measTexts++;
  if (m[1] !== "meas.noAdvice" && EVALUATING.test(m[2])) fail(`locales/de ${m[1]}`, `bewertender Begriff: „${m[2].match(EVALUATING)[0]}“`);
}
if (!de.includes('"meas.hint": "Das Tagebuch speichert nur deine Werte. Besprich sie mit deinem Arzt. Bei akuten Beschwerden 112."')) {
  fail("locales/de meas.hint", "fester Hinweis fehlt oder wurde geändert");
}

console.log(`${codes.size} Länder, ${ids.size} Hausapotheken-Einträge, ${topics} Erste-Hilfe-Themen, ${measTexts} Tagebuch-Texte geprüft.`);
console.log(`${problems} Probleme.`);
process.exit(problems ? 1 : 0);
