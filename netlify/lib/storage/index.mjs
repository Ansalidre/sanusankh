/*
 * Datenzugriff für Partner, Vermittlungen, Admin-Sitzungen und Zähler (Missbrauchsschutz).
 * Die Funktionen kennen nur diese Schnittstelle – nicht das Speicher-Backend (siehe ./kv.mjs).
 *
 * Gespeichert werden KEINE Kontaktdaten von Nutzern (Name, Telefon, E-Mail, Nachricht).
 */
import { kv } from "./kv.mjs";

const partnerStore = () => kv("partners");
const referralStore = () => kv("referrals");
const sessionStore = () => kv("admin-sessions");
const counterStore = () => kv("counters");

async function all(store) {
  const keys = await store.keys();
  const items = await Promise.all(keys.map((k) => store.get(k)));
  return items.filter(Boolean);
}

export const partners = {
  list: () => all(partnerStore()),
  get: (id) => partnerStore().get(id),
  save: (partner) => partnerStore().set(partner.id, partner),
  remove: (id) => partnerStore().delete(id),
};

export const referrals = {
  list: () => all(referralStore()),
  get: (code) => referralStore().get(code),
  /** Legt eine Vermittlung an; `false`, wenn der Code schon vergeben ist. */
  create: (referral) => referralStore().set(referral.code, referral, { onlyIfNew: true }),
  save: (referral) => referralStore().set(referral.code, referral),
  remove: (code) => referralStore().delete(code),
};

export const sessions = {
  get: (id) => sessionStore().get(id),
  save: (id, session) => sessionStore().set(id, session),
  remove: (id) => sessionStore().delete(id),
  list: () => sessionStore().keys(),
};

/** Kurzlebige Zähler (Anfragen pro Gerät, Fehlversuche beim Login). Schlüssel enthalten nur Hashes. */
export const counters = {
  get: (key) => counterStore().get(key),
  save: (key, value) => counterStore().set(key, value),
  remove: (key) => counterStore().delete(key),
  /** Löscht abgelaufene Zähler (`until` in der Vergangenheit). */
  async prune(now = Date.now()) {
    const store = counterStore();
    for (const key of await store.keys()) {
      const value = await store.get(key);
      if (!value || (value.until ?? 0) < now) await store.delete(key);
    }
  },
};
