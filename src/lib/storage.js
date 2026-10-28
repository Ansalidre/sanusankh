const NS = "sanusankh.v1";
const MAX_HISTORY = 100;

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(`${NS}.${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(`${NS}.${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function newId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    // Fallback unten
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const DEFAULT_PREFS = { lang: "de", disclaimerAccepted: false, taxiPhone: "" };

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
    const list = profiles.list();
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
