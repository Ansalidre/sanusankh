/*
 * Zugriff auf die Serverfunktionen im Hauptprojekt (netlify/functions/*.mjs).
 * EXPO_PUBLIC_API_URL ist die Basisadresse, z. B. https://DEINE-SEITE.netlify.app/api
 * (ältere Werte mit „/assistant“ am Ende werden weiter akzeptiert).
 *
 * Fehler haben `code`: "no_endpoint" | "offline" (keine Verbindung/Zeitüberschreitung) | Fehlercode des Servers.
 */

const BASE = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/+$/, "").replace(/\/assistant$/, "");
const TIMEOUT_MS = 20000;

export const apiAvailable = Boolean(BASE);

/**
 * Adresse der schlichten Webseite mit Impressum und Datenschutzerklärung (gleiche Domain wie der Server).
 * EXPO_PUBLIC_SITE_URL überschreibt die aus EXPO_PUBLIC_API_URL abgeleitete Adresse.
 */
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || BASE.replace(/\/api$/, "")).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(code, status, data) {
    super(code);
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

export async function api(path, { method = "GET", body, timeout = TIMEOUT_MS } = {}) {
  if (!BASE) throw new ApiError("no_endpoint", 0);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError("offline", 0);
  } finally {
    clearTimeout(timer);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // leere oder ungültige Antwort
  }
  if (!res.ok || !data) throw new ApiError(data?.error || `http_${res.status}`, res.status, data);
  return data;
}
