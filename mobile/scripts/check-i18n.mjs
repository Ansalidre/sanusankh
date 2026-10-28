// Prüft alle Sprachen aus src/data/languages.js gegen Deutsch (src/locales/de.js):
// fehlende, leere und überzählige Schlüssel sowie abweichende {Platzhalter}.
// Läuft ohne Metro: die Sprachdateien werden als data:-Module geladen.
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

async function loadLocale(code) {
  const url = new URL(`../src/locales/${code}.js`, import.meta.url);
  if (!existsSync(url)) return null;
  const source = readFileSync(url, "utf8");
  const mod = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  return mod.default;
}

const codes = [...read("data/languages.js").matchAll(/code: "([a-z]{2,3})"/g)].map((m) => m[1]);
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

let problems = 0;
const fail = (msg) => {
  console.error(msg);
  problems++;
};

const de = await loadLocale("de");
const reference = Object.keys(de);

for (const code of codes) {
  const dict = await loadLocale(code);
  if (!dict) {
    fail(`[${code}] Datei src/locales/${code}.js fehlt`);
    continue;
  }
  const keys = new Set(Object.keys(dict));
  for (const key of reference) {
    if (!keys.has(key)) fail(`[${code}] fehlt: ${key}`);
    else if (!String(dict[key]).trim()) fail(`[${code}] leer: ${key}`);
    else if (placeholders(dict[key]) !== placeholders(de[key])) fail(`[${code}] Platzhalter weichen ab: ${key}`);
  }
  for (const key of keys) {
    if (!(key in de)) fail(`[${code}] überzählig: ${key}`);
  }
}

console.log(`${reference.length} Schlüssel × ${codes.length} Sprachen (${codes.join(", ")})`);
console.log(`${problems} Probleme.`);
process.exit(problems ? 1 : 0);
