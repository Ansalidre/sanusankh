// Prüft die gepflegten Inhalte in src/content/*.json (Länder, Hausapotheke, Vorsorge, Anbieter).
// Aufruf: npm run check:content – vor jedem Build bzw. nach jeder Inhaltsänderung.
import { readFileSync } from "node:fs";

const load = (name) => JSON.parse(readFileSync(new URL(`../src/content/${name}`, import.meta.url), "utf8"));
const de = readFileSync(new URL("../src/locales/de.js", import.meta.url), "utf8");

let problems = 0;
const fail = (where, msg) => {
  console.error(`[${where}] ${msg}`);
  problems++;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (v) => ISO_DATE.test(v) && !Number.isNaN(Date.parse(v));
const isHttps = (v) => /^https:\/\/[^\s]+$/.test(v);
// Dosierungen und Einnahmeanweisungen sind in der Hausapotheke nicht erlaubt.
const DOSAGE = /\d+(?:[.,]\d+)?\s*(?:mg|µg|mcg|g|ml|i\.?\s?e\.?|tabletten?|kapseln?|tropfen|stück)\b|\b(?:mal|x)\s+(?:täglich|pro tag)|\bdosis\b|\bdosierung\b/i;

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

// gemeinsame Prüfung für den Freigabestatus
function checkReview(where, item) {
  if (!["reviewed", "unreviewed"].includes(item.status)) fail(where, 'status muss "reviewed" oder "unreviewed" sein');
  if (item.status === "reviewed") {
    if (!item.reviewedBy?.trim()) fail(where, "geprüft, aber reviewedBy (Name der prüfenden Person) fehlt");
    if (!isDate(item.reviewedAt)) fail(where, "geprüft, aber reviewedAt ist kein Datum (YYYY-MM-DD)");
  }
}

// --- Hausapotheke ---
const ids = new Set();
for (const item of load("medicineCabinet.json").items) {
  const where = `medicineCabinet/${item.id}`;
  if (!item.id || ids.has(item.id)) fail(where, "id fehlt oder ist doppelt");
  ids.add(item.id);
  if (!knownCountry(item.country)) fail(where, `unbekanntes Land "${item.country}"`);
  if (!["supply", "medicine"].includes(item.kind)) fail(where, 'kind muss "supply" oder "medicine" sein');
  if (!item.title?.trim() || !item.description?.trim()) fail(where, "title/description fehlt");
  if (item.kind === "medicine" && item.country === "*") fail(where, "Arzneimittel immer länderspezifisch eintragen, nicht für alle Länder");
  if (DOSAGE.test(`${item.title} ${item.description}`)) fail(where, "enthält eine Dosierung/Einnahmeanweisung – nicht erlaubt");
  checkReview(where, item);
}

// --- Vorsorge ---
for (const item of load("careInfo.json").items) {
  const where = `careInfo/${item.id}`;
  if (!knownCountry(item.country)) fail(where, `unbekanntes Land "${item.country}"`);
  if (!["directive", "insurance", "funeral"].includes(item.topic)) fail(where, `unbekanntes topic "${item.topic}"`);
  if (!item.sections?.length) fail(where, "sections fehlt");
  for (const l of item.links || []) if (!l.label || !isHttps(l.url)) fail(where, `Link ungültig: ${l.url}`);
  checkReview(where, item);
}

// --- Anbieter ---
const providerIds = new Set();
for (const p of load("providers.json").providers) {
  const where = `providers/${p.id}`;
  if (!p.id || providerIds.has(p.id)) fail(where, "id fehlt oder ist doppelt");
  providerIds.add(p.id);
  // Kooperations-Bestatter liegen auf dem Server (Admin-Ansicht), nicht in dieser Datei.
  if (p.type !== "insurance") fail(where, 'type muss "insurance" sein – Bestatter werden in der Admin-Ansicht gepflegt');
  if (!codes.has(p.country)) fail(where, `unbekanntes Land "${p.country}"`);
  if (!p.name?.trim()) fail(where, "name fehlt");
  if (p.website && !isHttps(p.website)) fail(where, "website muss mit https:// beginnen");
  if (p.logo && !isHttps(p.logo)) fail(where, "logo muss eine https-Adresse sein");
  if (p.partner) {
    if (!isDate(p.contractFrom) || !isDate(p.contractTo)) fail(where, "Partner: contractFrom/contractTo (YYYY-MM-DD) fehlen");
    else if (p.contractFrom > p.contractTo) fail(where, "contractFrom liegt nach contractTo");
  }
  if (p.tracking && /(?:^|&)(?:email|mail|name|phone|tel|user|uid|id)=/i.test(p.tracking)) {
    fail(where, "tracking darf keine personenbezogenen Parameter enthalten");
  }
  if (p.demo) console.warn(`[${where}] Hinweis: Demo-Eintrag – erscheint nur in Entwicklungs-Builds`);
}

console.log(`${codes.size} Länder, ${ids.size} Hausapotheken-Einträge, ${providerIds.size} Anbieter geprüft.`);
console.log(`${problems} Probleme.`);
process.exit(problems ? 1 : 0);
