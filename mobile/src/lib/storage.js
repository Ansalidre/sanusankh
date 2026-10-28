/*
 * Lokaler Speicher (AsyncStorage). Beim App-Start lädt `initStorage()` alles in den Arbeitsspeicher;
 * danach sind alle Lesezugriffe synchron, Schreibzugriffe werden im Hintergrund gespeichert.
 * Kein Server, kein Konto – alles bleibt auf dem Gerät.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const NS = "sanusankh.v1";
const KEYS = ["prefs", "profiles", "history", "cabinet", "partners", "requests"];
const MAX_HISTORY = 100;

const cache = {};

export async function initStorage() {
  try {
    const pairs = await AsyncStorage.multiGet(KEYS.map((k) => `${NS}.${k}`));
    for (const [fullKey, raw] of pairs) {
      const key = fullKey.slice(NS.length + 1);
      try {
        cache[key] = raw ? JSON.parse(raw) : undefined;
      } catch {
        cache[key] = undefined;
      }
    }
  } catch {
    // Speicher nicht lesbar – App läuft mit Standardwerten weiter
  }
}

function read(key, fallback) {
  return cache[key] ?? fallback;
}

function write(key, value) {
  cache[key] = value;
  AsyncStorage.setItem(`${NS}.${key}`, JSON.stringify(value)).catch(() => {
    // Schreiben fehlgeschlagen – der Wert bleibt bis zum App-Ende im Arbeitsspeicher
  });
}

export function newId() {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const DEFAULT_PREFS = { lang: null, country: null, disclaimerAccepted: false, taxiPhone: "", poisonState: "" };

export const prefs = {
  get() {
    return { ...DEFAULT_PREFS, ...read("prefs", {}) };
  },
  set(patch) {
    const next = { ...prefs.get(), ...patch };
    write("prefs", next);
    return next;
  },
};

export const profiles = {
  list() {
    const list = read("profiles", []);
    return Array.isArray(list) ? list : [];
  },
  get(id) {
    return profiles.list().find((p) => p.id === id) || null;
  },
  save(profile) {
    const list = [...profiles.list()];
    const now = new Date().toISOString();
    const entry = { ...profile, id: profile.id || newId(), updatedAt: now };
    const index = list.findIndex((p) => p.id === entry.id);
    if (index >= 0) list[index] = entry;
    else list.push({ ...entry, createdAt: now });
    write("profiles", list);
    return entry;
  },
  remove(id) {
    write(
      "profiles",
      profiles.list().filter((p) => p.id !== id),
    );
  },
};

/** Hausapotheke: { [itemId]: { have: boolean, expires: "YYYY-MM-DD" } } – nur auf dem Gerät. */
export const cabinetStore = {
  get() {
    const value = read("cabinet", {});
    return value && typeof value === "object" ? value : {};
  },
  set(id, patch) {
    const all = cabinetStore.get();
    const next = { ...all, [id]: { ...all[id], ...patch } };
    write("cabinet", next);
    return next;
  },
};

/** Zwischenspeicher der Kooperations-Bestatter je Land: { [country]: { fetchedAt, partners } }. */
export const partnerCache = {
  get(country) {
    const all = read("partners", {});
    return all && typeof all === "object" ? all[country] || null : null;
  },
  set(country, partners) {
    const entry = { fetchedAt: new Date().toISOString(), partners };
    write("partners", { ...read("partners", {}), [country]: entry });
    return entry;
  },
};

/**
 * Eigene Anfragen bei Bestattern – nur auf dem Gerät, der Server kennt keine Nutzerdaten:
 * [{ code, withdrawToken, partnerId, partnerName, partnerPhone, serviceTitle, createdAt, status }]
 */
export const requestStore = {
  list() {
    const list = read("requests", []);
    return Array.isArray(list) ? list : [];
  },
  get(code) {
    return requestStore.list().find((r) => r.code === code) || null;
  },
  add(entry) {
    write("requests", [entry, ...requestStore.list()]);
    return entry;
  },
  update(code, patch) {
    write(
      "requests",
      requestStore.list().map((r) => (r.code === code ? { ...r, ...patch } : r)),
    );
  },
  remove(code) {
    write(
      "requests",
      requestStore.list().filter((r) => r.code !== code),
    );
  },
};

export const historyStore = {
  list() {
    const list = read("history", []);
    return Array.isArray(list) ? list : [];
  },
  add(entry) {
    const item = { id: newId(), date: new Date().toISOString(), ...entry };
    write("history", [item, ...historyStore.list()].slice(0, MAX_HISTORY));
    return item;
  },
  clear() {
    write("history", []);
  },
};
