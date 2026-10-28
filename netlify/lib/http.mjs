/* Gemeinsame Helfer für die Serverfunktionen. */
import crypto from "node:crypto";

const PUBLIC_CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
};

export function json(status, body, { headers = {}, cors = false } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(cors ? PUBLIC_CORS : {}),
      ...headers,
    },
  });
}

/** Antwort auf CORS-Vorabanfragen der öffentlichen Endpunkte (App läuft auch im Browser). */
export function preflight() {
  return new Response(null, { status: 204, headers: PUBLIC_CORS });
}

export async function readJson(req, maxBytes = 20000) {
  const text = await req.text();
  if (text.length > maxBytes) throw Object.assign(new Error("too_large"), { status: 413 });
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error("invalid_json"), { status: 400 });
  }
}

export function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

/** Zeitkonstanter Vergleich zweier Zeichenketten (über ihre Hashes, damit die Länge nichts verrät). */
export function safeEqual(a, b) {
  return crypto.timingSafeEqual(Buffer.from(sha256(a), "hex"), Buffer.from(sha256(b), "hex"));
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

/**
 * Pseudonymer Schlüssel für die Herkunft einer Anfrage (z. B. für Zähler gegen Missbrauch).
 * Die IP-Adresse wird nie gespeichert, nur ein täglich wechselnder Hash mit Server-Geheimnis.
 */
export function clientKey(context) {
  const secret = process.env.HASH_SECRET || process.env.ADMIN_PASSWORD || "sanusankh-dev";
  const day = new Date().toISOString().slice(0, 10);
  return sha256(`${secret}|${day}|${context?.ip || "unknown"}`).slice(0, 32);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
