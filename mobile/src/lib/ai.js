/*
 * Client für die KI-Serverfunktion (netlify/functions/assistant.mjs im Hauptprojekt).
 * Ohne EXPO_PUBLIC_API_URL werfen alle Funktionen – die Aufrufer zeigen dann den deutschen Text.
 * Übersetzungen werden pro Sprache und Inhalt für die Dauer der App-Sitzung im Arbeitsspeicher gecacht.
 */
import { api } from "@/lib/api";

const MAX_TEXTS = 30;
const TIMEOUT_MS = 45000;

function post(body) {
  return api("/assistant", { method: "POST", body, timeout: TIMEOUT_MS });
}

export async function askAssistant({ question, language, country }) {
  const data = await post({ mode: "ask", question: String(question).slice(0, 1000), language, country });
  if (typeof data.answer !== "string") throw new Error("invalid_response");
  return { answer: data.answer };
}

export async function translateTexts(texts, language) {
  if (language === "de" || texts.length === 0) return texts;
  const chunks = [];
  for (let i = 0; i < texts.length; i += MAX_TEXTS) chunks.push(texts.slice(i, i + MAX_TEXTS));
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const data = await post({ mode: "translate", texts: chunk, language });
      // Stub (kein API-Key) und Server-Fallback liefern den Originaltext – das gilt als „nicht übersetzt“.
      if (data.stub || data.fallback) throw new Error("not_translated");
      if (!Array.isArray(data.translations) || data.translations.length !== chunk.length) {
        throw new Error("invalid_response");
      }
      return data.translations.map((t, i) => (typeof t === "string" && t.trim() ? t : chunk[i]));
    }),
  );
  return results.flat();
}

const cache = new Map();

export function getCachedTranslation(kind, lang, id) {
  return cache.get(`${kind}.${lang}.${id}`) ?? null;
}

/**
 * Übersetzt alle Strings an den angegebenen Stellen eines tief kopierten Objekts.
 * `collect(copy)` liefert eine Liste von [obj, key]-Paaren, deren Werte übersetzt werden.
 */
async function translateObject(kind, id, source, lang, collect) {
  if (lang === "de") return source;
  const cached = getCachedTranslation(kind, lang, id);
  if (cached) return cached;
  const copy = JSON.parse(JSON.stringify(source));
  const refs = collect(copy).filter(([obj, key]) => typeof obj[key] === "string" && obj[key].trim());
  const translated = await translateTexts(
    refs.map(([obj, key]) => obj[key]),
    lang,
  );
  refs.forEach(([obj, key], i) => {
    obj[key] = translated[i];
  });
  cache.set(`${kind}.${lang}.${id}`, copy);
  return copy;
}

/** Hausapotheke eines Landes: Titel und Beschreibung. */
export function translateCabinet(items, lang) {
  return translateObject("cabinet", items.map((i) => i.id).join(","), items, lang, (list) =>
    list.flatMap((item) => [
      [item, "title"],
      [item, "description"],
    ]),
  );
}

/** Vorsorge-Text (Abschnitte und Link-Beschriftungen). */
export function translateCare(info, lang) {
  return translateObject("care", info.id, info, lang, (i) => [
    ...(i.sections || []).flatMap((s) => [
      [s, "heading"],
      [s, "text"],
    ]),
    ...(i.links || []).map((l) => [l, "label"]),
  ]);
}

/** Leistungen und Rabattbedingungen eines Kooperations-Bestatters. */
export function translatePartner(partner, lang) {
  return translateObject("partner", `${partner.id}.${partner.fetchedAt || ""}`, partner, lang, (p) => [
    ...(p.discount ? [[p.discount, "conditions"]] : []),
    ...(p.services || []).flatMap((s) => [
      [s, "title"],
      [s, "description"],
    ]),
  ]);
}
