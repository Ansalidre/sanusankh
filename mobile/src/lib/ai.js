/*
 * Client für die Serverfunktion (netlify/functions/assistant.mjs im Hauptprojekt).
 * Adresse über EXPO_PUBLIC_API_URL; ohne Adresse werfen alle Funktionen – die Aufrufer zeigen dann den deutschen Text.
 * Übersetzungen werden pro Sprache und Inhalt für die Dauer der App-Sitzung im Arbeitsspeicher gecacht.
 */

const ENDPOINT = process.env.EXPO_PUBLIC_API_URL || "";
const MAX_TEXTS = 30;
const TIMEOUT_MS = 45000;

export const aiAvailable = Boolean(ENDPOINT);

async function post(body) {
  if (!ENDPOINT) throw new Error("no_endpoint");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      // leere oder ungültige Antwort
    }
    if (!res.ok || !data) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function askAssistant({ question, language, country, context }) {
  const data = await post({ mode: "ask", question: String(question).slice(0, 1000), language, country, context });
  if (typeof data.answer !== "string") throw new Error("invalid_response");
  return { answer: data.answer, urgent: data.urgent === true };
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

export function translateGuide(guide, lang) {
  return translateObject("guide", guide.slug, guide, lang, (g) => [
    [g, "forWhom"],
    [g, "summary"],
    ...(g.steps || []).flatMap((s) => [
      [s, "title"],
      [s, "text"],
    ]),
  ]);
}

export function translateFlow(flow, lang) {
  return translateObject("flow", flow.slug, flow, lang, (f) => {
    const refs = [[f, "summary"]];
    for (const node of Object.values(f.nodes || {})) {
      if (node.question) refs.push([node, "question"]);
      for (const option of node.options || []) refs.push([option, "label"]);
      const r = node.result;
      if (r) {
        refs.push([r, "title"], [r, "reason"]);
        (r.advice || []).forEach((_, i) => refs.push([r.advice, i]));
        if (r.action) refs.push([r.action, "label"]);
      }
    }
    return refs;
  });
}

/** Hausapotheke eines Landes: Titel und Beschreibung (Quelle und Prüfvermerk bleiben im Original). */
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

/** Übersetzt ein Feld (z. B. `summary`) einer Liste von Einträgen; Ergebnis: { [id]: text }. */
export function translateField(kind, items, idKey, field, lang) {
  const source = Object.fromEntries(items.map((item) => [item[idKey], item[field]]));
  return translateObject(kind, `list.${field}`, source, lang, (map) => Object.keys(map).map((k) => [map, k]));
}
