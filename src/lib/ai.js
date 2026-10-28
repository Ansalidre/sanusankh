/*
 * Client für die Serverfunktion /api/assistant (netlify/functions/assistant.mjs).
 * Übersetzungen werden pro Sprache und Inhalt in sessionStorage gecacht.
 * Alle Funktionen werfen bei Fehlern – die Aufrufer zeigen dann den deutschen Text.
 */

const ENDPOINT = "/api/assistant";
const MAX_TEXTS = 30;
const CACHE_NS = "sanusankh.v1.tr";

async function post(body) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // leere oder ungültige Antwort
  }
  if (!res.ok || !data) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export async function askAssistant({ question, language, context }) {
  const data = await post({ mode: "ask", question: String(question).slice(0, 1000), language, context });
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

function cacheGet(key) {
  try {
    const raw = window.sessionStorage.getItem(`${CACHE_NS}.${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cacheSet(key, value) {
  try {
    window.sessionStorage.setItem(`${CACHE_NS}.${key}`, JSON.stringify(value));
  } catch {
    // Speicher voll oder gesperrt – dann eben ohne Cache
  }
}

export function getCachedTranslation(kind, lang, id) {
  return cacheGet(`${kind}.${lang}.${id}`);
}

/**
 * Übersetzt alle Strings an den angegebenen Stellen eines tief kopierten Objekts.
 * `collect(copy)` liefert eine Liste von [obj, key]-Paaren, deren Werte übersetzt werden.
 */
async function translateObject(kind, id, source, lang, collect) {
  if (lang === "de") return source;
  const cached = getCachedTranslation(kind, lang, id);
  if (cached) return cached;
  const copy = structuredClone(source);
  const refs = collect(copy).filter(([obj, key]) => typeof obj[key] === "string" && obj[key].trim());
  const translated = await translateTexts(
    refs.map(([obj, key]) => obj[key]),
    lang,
  );
  refs.forEach(([obj, key], i) => {
    obj[key] = translated[i];
  });
  cacheSet(`${kind}.${lang}.${id}`, copy);
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

/** Übersetzt ein Feld (z. B. `summary`) einer Liste von Einträgen; Ergebnis: { [id]: text }. */
export function translateField(kind, items, idKey, field, lang) {
  const source = Object.fromEntries(items.map((item) => [item[idKey], item[field]]));
  return translateObject(kind, `list.${field}`, source, lang, (map) => Object.keys(map).map((k) => [map, k]));
}
