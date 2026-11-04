/*
 * Lokaler Speicher (AsyncStorage). Beim App-Start lädt `initStorage()` alles in den Arbeitsspeicher;
 * danach sind alle Lesezugriffe synchron, Schreibzugriffe werden im Hintergrund gespeichert.
 * Kein Server, kein Konto – alles bleibt auf dem Gerät.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const NS = "sanusankh.v1";
const KEYS = ["prefs", "profiles", "cabinet", "partners", "requests", "measurements"];
// Nicht mehr genutzte Daten älterer Versionen (Verlauf des früheren Symptom-Checks) – werden beim Start gelöscht.
const LEGACY_KEYS = ["history"];

const cache = {};

export async function initStorage() {
  AsyncStorage.multiRemove(LEGACY_KEYS.map((k) => `${NS}.${k}`)).catch(() => {});
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

const DEFAULT_MEASUREMENTS = { entries: [], glucoseUnit: "mg/dl", printName: "", reminder: { enabled: false, time: "08:00" } };

/**
 * Messwerte-Tagebuch – nur auf dem Gerät (und in der Gerätesicherung des Nutzers, falls eingeschaltet):
 * { entries: [{ id, kind: "bp"|"glucose", at: "YYYY-MM-DDTHH:MM", sys, dia, pulse, value, unit, context, note,
 *   createdAt, updatedAt }], glucoseUnit (zuletzt gewählt), printName (für das PDF), reminder: { enabled, time } }
 */
export const measurementStore = {
  get() {
    const value = read("measurements", {});
    const data = value && typeof value === "object" ? value : {};
    return {
      ...DEFAULT_MEASUREMENTS,
      ...data,
      entries: Array.isArray(data.entries) ? data.entries : [],
      reminder: { ...DEFAULT_MEASUREMENTS.reminder, ...data.reminder },
    };
  },
  set(patch) {
    const next = { ...measurementStore.get(), ...patch };
    write("measurements", next);
    return next;
  },
  entry(id) {
    return measurementStore.get().entries.find((e) => e.id === id) || null;
  },
  save(entry) {
    const all = measurementStore.get();
    const now = new Date().toISOString();
    const saved = { ...entry, id: entry.id || newId(), updatedAt: now, createdAt: entry.createdAt || now };
    const entries = all.entries.some((e) => e.id === saved.id)
      ? all.entries.map((e) => (e.id === saved.id ? saved : e))
      : [...all.entries, saved];
    const patch = { entries };
    if (saved.kind === "glucose") patch.glucoseUnit = saved.unit;
    measurementStore.set(patch);
    return saved;
  },
  remove(id) {
    measurementStore.set({ entries: measurementStore.get().entries.filter((e) => e.id !== id) });
  },
  /** Löscht alle Messwerte, den Namen für den Ausdruck und die Erinnerungseinstellung. */
  clear() {
    write("measurements", DEFAULT_MEASUREMENTS);
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
