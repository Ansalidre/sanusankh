# SanusAnkh – Server, Admin-Ansicht und Webseite

> **Die App** für iOS und Android liegt in [`mobile/`](mobile/README.md) (Expo / React Native) und wird nur über die Stores veröffentlicht. Eine Web-Version der App gibt es nicht.

Dieses Verzeichnis wird bei Netlify veröffentlicht und enthält ausschließlich:

- **Server-Funktionen** (`netlify/functions/`): KI-Assistent, Kooperations-Bestatter, Anfragen und Admin-Schnittstelle unter `/api/...`
- **Admin-Ansicht** unter `/admin/` (`admin/index.html`, `src/admin/`)
- **Schlichte Webseite** auf der Domain: Startseite mit kurzer App-Beschreibung und Store-Links (`index.html`), Impressum (`impressum/index.html`) und Datenschutzerklärung (`datenschutz/index.html`), eine 404-Seite (`404.html`). Die Seiten nutzen nur `src/site/site.css` – keine Skripte, keine externen Schriften.

## Start

```bash
npm install
npm run dev          # http://localhost:5173 – Webseite, /admin/ und alle /api/-Funktionen (Vite-Middleware)
npm run build        # Produktions-Build nach dist/ (nur Webseite und Admin)
npm run lint
```

Node 20+ (getestet mit Node 24). Lokal speichert der Dev-Server in `.data/` und legt einen Demo-Bestatter an.

## Impressum und Datenschutzerklärung pflegen

Die Texte kommen aus einem Generator (siehe [mobile/RECHTSTEXTE-ANGABEN.md](mobile/RECHTSTEXTE-ANGABEN.md)). In `impressum/index.html` bzw. `datenschutz/index.html` den Generator-Text zwischen den Kommentaren `Text aus dem … Generator ab hier einfügen` und `Ende Generator-Text` einfügen und den gelben Platzhalter-Kasten löschen. Die Datenschutzerklärung gilt für App und Webseite; die App verlinkt auf diese Seiten. Die Store-Links auf der Startseite (`index.html`) nach der Veröffentlichung eintragen (App-Store-ID).

## KI-Funktion

`netlify/functions/assistant.mjs` (Pfad `/api/assistant`) nutzt das Anthropic SDK:

- `POST { mode: "ask", question, language, country }` → `{ answer }`
- `POST { mode: "translate", texts[], language }` → `{ translations }`

Der Assistent beantwortet Fragen zur App, zu Anlaufstellen und zur Vorsorge. Er gibt **keine** Diagnosen, bewertet keine Symptome oder Dringlichkeit und empfiehlt keine Behandlung, Medikamente oder Dosierungen; medizinische Fragen beantwortet er nur mit dem Verweis auf 112, den ärztlichen Bereitschaftsdienst (DE: 116117) oder die Hausarztpraxis.

- `ANTHROPIC_API_KEY` als Netlify-Umgebungsvariable (lokal in `.env`).
- Optional `ANTHROPIC_MODEL`, Standard `claude-haiku-5-5` (Effort `low`). Bei Haiku wird kein serverseitiger Fallback angefordert (gibt es dort nicht); bei anderen Modellen greift bei einer Ablehnung durch Sicherheitsfilter ein passendes Ersatzmodell.
- Ohne Key arbeitet die Funktion als Stub: Übersetzungen kommen unverändert mit `stub: true` zurück, Fragen erhalten `503`.

## Kooperations-Bestatter und Admin-Ansicht

`partners.mjs` (`/api/partners`), `requests.mjs` (`/api/requests`) und `admin.mjs` (`/api/admin/*`). Daten liegen in Netlify Blobs; der Zugriff ist in `netlify/lib/storage/` gekapselt. Ablauf, Datenmodell und Sicherheit: siehe [mobile/README.md](mobile/README.md#kooperations-bestatter-anfragen-und-provisionen).

## Deployment (Netlify)

Repository verbinden – `netlify.toml` setzt Build-Befehl, `dist/`, die Funktionen und die Weiterleitung für `/admin/`. Danach unter *Site configuration → Environment variables* setzen (Vorlage `.env.example`):

| Variable | Zweck |
| --- | --- |
| `ANTHROPIC_API_KEY` | KI-Assistent |
| `ANTHROPIC_MODEL` | optional, Standard `claude-haiku-5-5` |
| `ADMIN_PASSWORD` | Admin-Ansicht, mindestens 12 Zeichen |
| `HASH_SECRET` | lange Zufallszeichenkette für pseudonyme Zähler (Missbrauchsschutz) |
| `BREVO_API_KEY`, `MAIL_FROM`, `MAIL_FROM_NAME` | E-Mail-Versand; ohne beide ersten Werte Testbetrieb |

Eigene Domain in Netlify unter *Domain management* verbinden (HTTPS stellt Netlify automatisch bereit).
