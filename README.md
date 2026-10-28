# SanusAnkh – Erste-Hilfe- und Gesundheitslotse

> **Store-App:** Die App für iOS und Android liegt in [`mobile/`](mobile/README.md) (Expo / React Native). Dieses Verzeichnis enthält die Web-Version und die KI-Serverfunktion, die auch die App nutzt – dafür wird das Projekt weiterhin bei Netlify deployt.

Mobile-first React-App für Deutschland: 112-Schnellzugriff, Erste-Hilfe-Anleitungen, geführter Symptom-Check (Ampel), Notrufnummern, Apotheken- und Kliniksuche, Notfallpass und KI-Assistent – in 7 Sprachen (DE, EN, TR, AR mit RTL, RU, UK, PL).

Keine Konten, keine Datenbank: Notfallpass, Verlauf und Einstellungen liegen ausschließlich im `localStorage` (Namespace `sanusankh.v1`).

## Start

```bash
npm install
npm run dev          # http://localhost:5173 – inkl. /api/assistant (Vite-Middleware)
npm run build        # Produktions-Build nach dist/
npm run lint
npm run check:i18n   # prüft, dass alle 7 Sprachen dieselben Schlüssel haben
```

Node 20+ (getestet mit Node 24).

## KI-Funktion

`netlify/functions/assistant.mjs` (Netlify Functions v2, Pfad `/api/assistant`) nutzt das Anthropic SDK:

- `POST { mode: "ask", question, language, context? }` → `{ answer, urgent }`
- `POST { mode: "translate", texts[], language }` → `{ translations }`

**API-Key eintragen:**

- Lokal: `.env.example` nach `.env` kopieren und `ANTHROPIC_API_KEY=…` setzen. Der Vite-Dev-Server führt die Funktion selbst aus, die Netlify CLI ist nicht nötig.
- Netlify: *Site configuration → Environment variables* → `ANTHROPIC_API_KEY`.
- Optional `ANTHROPIC_MODEL` (Standard: `claude-opus-5-5`, Effort `low` für kurze Antwortzeiten). Bei einer Ablehnung durch Sicherheitsfilter wird serverseitig automatisch auf ein passendes Modell umgeleitet (`fallbacks: "default"`).

**Ohne Key** arbeitet die Funktion als Stub: Übersetzungen kommen unverändert mit `stub: true` zurück, Fragen erhalten `503`. Die App zeigt dann den deutschen Originaltext mit Hinweis und bleibt voll nutzbar.

Grenzen: Frage max. 1000 Zeichen, Kontext max. 4000, max. 30 Texte à 1000 Zeichen pro Übersetzungsauftrag, nur die 7 Sprachcodes. Übersetzungen werden pro Sprache und Inhalt in `sessionStorage` gecacht.

## Kooperations-Bestatter und Admin-Ansicht

Weitere Serverfunktionen für die Store-App: `partners.mjs` (`/api/partners`), `requests.mjs` (`/api/requests`) und `admin.mjs` (`/api/admin/*`). Daten liegen in Netlify Blobs; der Zugriff ist in `netlify/lib/storage/` gekapselt. Die Admin-Ansicht liegt unter `/admin` (`src/admin/`, eigener Chunk). Ablauf, Datenmodell und Sicherheit: siehe [mobile/README.md](mobile/README.md#kooperations-bestatter-anfragen-und-provisionen).

Umgebungsvariablen (Vorlage `.env.example`): `ADMIN_PASSWORD` (mind. 12 Zeichen), `HASH_SECRET`, `BREVO_API_KEY`, `MAIL_FROM`, `MAIL_FROM_NAME`. Ohne Brevo-Zugang läuft der Versand im Testbetrieb (nur Protokoll ohne Personendaten). Lokal speichert der Vite-Dev-Server in `.data/` und legt einen Demo-Bestatter an.

## Deployment (Netlify)

Repository verbinden – `netlify.toml` setzt Build-Befehl, `dist/` und den SPA-Fallback. Danach die Umgebungsvariablen hinterlegen (API-Key, Admin-Passwort, ggf. Brevo).

## Vor der Veröffentlichung

- [ ] **Impressum, Datenschutz, Haftungsausschluss** (`src/pages/Legal.jsx`): alle gelb markierten `[Platzhalter]` ersetzen und juristisch prüfen lassen.
- [ ] **Google Fonts selbst hosten**: Der `@import` in `src/index.css` überträgt IP-Adressen an Google (in DE abmahnrelevant). Danach den Abschnitt in der Datenschutzerklärung anpassen.
- [ ] **Telefonnummern prüfen** (`src/data/numbers.js`): Giftnotruf je Bundesland, Apotheken-Notdienst-Hotline `0800 00 22 8 33`, Taxi-Kurzwahl `22456`.
- [ ] **Medizinische Inhalte fachlich abnehmen lassen** (`src/data/firstAidGuides.js`, `symptomFlows.js`, `redFlags.js`).
- [ ] Telemedizin-Partner und Online-Apotheke sind Platzhalter („Demnächst verfügbar“).
- [ ] Nutzung der OSM-Kachelserver und der Overpass-API: Bei viel Traffic einen eigenen bzw. kommerziellen Tile-/Overpass-Anbieter einsetzen (Nutzungsbedingungen der OSMF).

## Getroffene Annahmen

- **Notfallpass-Vollbild** (`/pass/:id/show`) liegt bewusst außerhalb der Layout-Route, damit keine Navigation sichtbar ist.
- **Herzdruckmassage bei Kindern:** Die Vorgabe „zwei Finger bis 3 Jahre“ entspricht nicht den ERC-Leitlinien 2021. Umgesetzt ist: zwei Finger nur bei Säuglingen (< 1 Jahr), bei Kindern Handballen einer Hand (größere Kinder: beide Hände).
- **Metronom** exakt 100/min (600 ms), Klickton über Web Audio, Vibration über `navigator.vibrate`.
- **Mehrsprachigkeit der Inhalte:** UI-Texte (279 Schlüssel), Kategorien, Anleitungs- und Flow-Titel, Warnzeichen-Fragen inkl. Sofortmaßnahmen sowie alle Nummern liegen statisch in 7 Sprachen vor. Damit funktioniert der Notfallpfad ohne KI und ohne Netz. Anleitungsschritte, Flow-Fragen und Ergebnistexte werden bei Nicht-Deutsch automatisch per KI übersetzt. Bis dahin (oder bei Fehlern) wird der deutsche Text angezeigt; „Deutschen Originaltext zeigen“ schaltet zurück.
- **Rechtstexte** sind nur auf Deutsch vorhanden (mit Hinweis „Rechtlich verbindlich ist die deutsche Fassung“).
- **Kliniksuche**: OSM `amenity=hospital` im Umkreis von 20 km; Häuser mit `emergency=yes` werden zuerst und als „Notaufnahme“ markiert angezeigt. Apotheken: 5 km.
- **Taxi-Nummer** ist in den Einstellungen änderbar (`prefs.taxiPhone`); zusätzlich wird die bundesweite Kurzwahl angezeigt.
- **Giftnotruf-Bundesland** wird in den Einstellungen gemerkt (`prefs.poisonState`).
- shadcn/ui-Komponenten wurden direkt als JS-Dateien angelegt (gleicher Aufbau wie `npx shadcn add`, `components.json` liegt bei), Touch-Ziele auf ≥ 52 px vergrößert.

## Struktur

```
netlify/functions/assistant.mjs   KI-Serverfunktion
scripts/check-i18n.mjs            Schlüssel-Paritätsprüfung
src/
  App.jsx, main.jsx, index.css
  components/        AppLayout, LanguagePicker, DisclaimerGate, StepChecklist, CprMetronome,
                     NearbyFinder, MiniMap, PlaceList, RedFlagCheck, TriageQuestion, TriageResult,
                     AssistantPanel, ProfileForm, NumberCard, QuickTile, … und ui/ (shadcn)
  data/              languages, firstAidGuides (18), symptomFlows (9), redFlags (5), numbers
  lib/               i18n, translations, storage, ai, geo, useAiTranslation, utils
  pages/             Home, Triage, Guides, GuideDetail, Numbers, Pharmacy, Telemedicine, Transport,
                     Hospitals, EmergencyPass(+Form, +View), History, Settings, Legal, PageNotFound
```
