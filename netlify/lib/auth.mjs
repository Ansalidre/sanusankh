/*
 * Admin-Anmeldung mit einem gemeinsamen Passwort (ADMIN_PASSWORD, mind. 12 Zeichen).
 *
 * - Vergleich zeitkonstant (safeEqual)
 * - Nach jedem Fehlversuch wachsende Verzögerung; nach 5 Fehlversuchen in 15 Minuten
 *   ist der Login von dieser Herkunft 15 Minuten gesperrt
 * - Sitzung: zufälliges Token im HttpOnly-Cookie, serverseitig nur als Hash gespeichert;
 *   Ablauf nach 30 Minuten Inaktivität bzw. spätestens nach 8 Stunden
 *
 * TODO: Mehrere Admin-Konten (eigene Zugänge, Rollen, Protokoll wer was geändert hat).
 * TODO: Eigener Partner-Zugang, über den Bestatter Codes selbst einlösen und Auftragswerte melden.
 */
import { clientKey, randomToken, safeEqual, sha256, sleep } from "./http.mjs";
import { counters, sessions } from "./storage/index.mjs";

export const COOKIE = "sa_admin";
const IDLE_MS = 30 * 60 * 1000;
const ABSOLUTE_MS = 8 * 60 * 60 * 1000;
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MIN_PASSWORD = 12;

export function adminConfigured() {
  return (process.env.ADMIN_PASSWORD || "").length >= MIN_PASSWORD;
}

function cookie(req, value, maxAgeSeconds) {
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

function readCookie(req) {
  const header = req.headers.get("cookie") || "";
  const match = header.split(/;\s*/).find((part) => part.startsWith(`${COOKIE}=`));
  return match ? match.slice(COOKIE.length + 1) : "";
}

/**
 * Prüft das Passwort. Ergebnis:
 *   { ok: true, setCookie, expiresAt } | { ok: false, status: 401 | 429 | 503, error, retryAfter? }
 */
export async function login(req, context, password) {
  if (!adminConfigured()) return { ok: false, status: 503, error: "not_configured" };

  const key = `login-${clientKey(context)}`;
  const now = Date.now();
  const entry = await counters.get(key);
  const state = entry && entry.until > now ? entry : { fails: 0, until: now + WINDOW_MS };
  if (state.fails >= MAX_FAILS) {
    return { ok: false, status: 429, error: "locked", retryAfter: Math.ceil((state.until - now) / 1000) };
  }

  if (typeof password !== "string" || !safeEqual(password, process.env.ADMIN_PASSWORD)) {
    const fails = state.fails + 1;
    // Nach dem letzten erlaubten Fehlversuch beginnt die Sperrfrist neu.
    await counters.save(key, { fails, until: fails >= MAX_FAILS ? now + WINDOW_MS : state.until });
    await sleep(Math.min(250 * 2 ** fails, 4000));
    return fails >= MAX_FAILS
      ? { ok: false, status: 429, error: "locked", retryAfter: WINDOW_MS / 1000 }
      : { ok: false, status: 401, error: "wrong_password", attemptsLeft: MAX_FAILS - fails };
  }

  await counters.remove(key);
  const token = randomToken(32);
  const session = { createdAt: now, lastSeen: now, expiresAt: now + ABSOLUTE_MS };
  await sessions.save(sha256(token), session);
  pruneSessions(now).catch(() => {});
  return { ok: true, setCookie: cookie(req, token, ABSOLUTE_MS / 1000), expiresAt: nextExpiry(session) };
}

function nextExpiry(session) {
  return Math.min(session.lastSeen + IDLE_MS, session.expiresAt);
}

/** Liefert die gültige Sitzung (und verlängert die Inaktivitätsfrist) oder null. */
export async function currentSession(req) {
  const token = readCookie(req);
  if (!token) return null;
  const id = sha256(token);
  const session = await sessions.get(id);
  const now = Date.now();
  if (!session || nextExpiry(session) < now) {
    if (session) await sessions.remove(id);
    return null;
  }
  const updated = { ...session, lastSeen: now };
  await sessions.save(id, updated);
  return { id, expiresAt: nextExpiry(updated) };
}

export async function logout(req) {
  const token = readCookie(req);
  if (token) await sessions.remove(sha256(token));
  return cookie(req, "", 0);
}

async function pruneSessions(now) {
  for (const id of await sessions.list()) {
    const session = await sessions.get(id);
    if (!session || nextExpiry(session) < now) await sessions.remove(id);
  }
}
