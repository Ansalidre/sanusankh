// Prüft, dass alle Sprachen dieselben Schlüssel haben und keine leeren Strings enthalten.
// Läuft ohne Vite: der @/-Import wird per Regex entfernt und die Datei als data:-Modul geladen.
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/lib/translations.js", import.meta.url), "utf8")
  .replace(/^import .*$/m, 'const DEFAULT_LANG = "de";');
const mod = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

const { TRANSLATIONS } = mod;
const reference = Object.keys(TRANSLATIONS.de);
let problems = 0;

for (const [lang, dict] of Object.entries(TRANSLATIONS)) {
  const keys = new Set(Object.keys(dict));
  for (const key of reference) {
    if (!keys.has(key)) {
      console.error(`[${lang}] fehlt: ${key}`);
      problems++;
    } else if (!String(dict[key]).trim()) {
      console.error(`[${lang}] leer: ${key}`);
      problems++;
    }
  }
  for (const key of keys) {
    if (!reference.includes(key)) {
      console.error(`[${lang}] überzählig: ${key}`);
      problems++;
    }
  }
}

console.log(`${reference.length} Schlüssel × ${Object.keys(TRANSLATIONS).length} Sprachen geprüft, ${problems} Probleme.`);
process.exit(problems ? 1 : 0);
