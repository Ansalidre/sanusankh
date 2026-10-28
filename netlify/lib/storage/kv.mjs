/*
 * Schlüssel-Wert-Speicher für die Serverfunktionen. Einzige Stelle, die Netlify Blobs kennt.
 *
 *   kv(name) → { get(key), set(key, value, { onlyIfNew }), delete(key), keys(prefix) }
 *
 * Backends:
 *   blobs – Netlify Blobs (Standard, auch in Produktion)
 *   file  – JSON-Dateien unter .data/ (nur lokal; der Vite-Dev-Server setzt STORAGE_BACKEND=file)
 *
 * Für einen späteren Wechsel auf eine Datenbank genügt es, dieses Modul und ./index.mjs anzupassen.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

const BACKEND = process.env.STORAGE_BACKEND === "file" ? "file" : "blobs";
const DATA_DIR = path.resolve(process.env.STORAGE_DIR || ".data");

function blobStore(name) {
  const store = getStore({ name, consistency: "strong" });
  return {
    get: (key) => store.get(key, { type: "json" }),
    async set(key, value, { onlyIfNew = false } = {}) {
      const result = await store.setJSON(key, value, onlyIfNew ? { onlyIfNew: true } : undefined);
      return result?.modified !== false;
    },
    delete: (key) => store.delete(key),
    async keys(prefix = "") {
      const { blobs } = await store.list({ prefix, paginate: false });
      return blobs.map((b) => b.key);
    },
  };
}

function fileStore(name) {
  const dir = path.join(DATA_DIR, name);
  const file = (key) => path.join(dir, `${encodeURIComponent(key)}.json`);
  return {
    async get(key) {
      try {
        return JSON.parse(await fs.readFile(file(key), "utf8"));
      } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
      }
    },
    async set(key, value, { onlyIfNew = false } = {}) {
      await fs.mkdir(dir, { recursive: true });
      try {
        await fs.writeFile(file(key), JSON.stringify(value, null, 2), { flag: onlyIfNew ? "wx" : "w" });
        return true;
      } catch (error) {
        if (error.code === "EEXIST") return false;
        throw error;
      }
    },
    async delete(key) {
      await fs.rm(file(key), { force: true });
    },
    async keys(prefix = "") {
      try {
        const names = await fs.readdir(dir);
        return names
          .filter((n) => n.endsWith(".json"))
          .map((n) => decodeURIComponent(n.slice(0, -5)))
          .filter((k) => k.startsWith(prefix));
      } catch (error) {
        if (error.code === "ENOENT") return [];
        throw error;
      }
    },
  };
}

const stores = new Map();

export function kv(name) {
  if (!stores.has(name)) stores.set(name, BACKEND === "file" ? fileStore(name) : blobStore(name));
  return stores.get(name);
}

export const storageBackend = BACKEND;
