# SanusAnkh – App für iOS und Android

Native App (React Native mit Expo SDK 58 und Expo Router): 112-Schnellzugriff, allgemeine Warnzeichen („Wann 112 anrufen?“), 18 Erste-Hilfe-Themen mit Links zu DRK, Johanniter und Malteser, Notrufnummern je Land, Apotheken- und Kliniksuche, Checkliste Hausapotheke (Verbandsmaterial und Hilfsmittel) mit Ablauf-Erinnerung, Notfallpass (inkl. Patientenverfügung und Bestattungswünschen), Bereich „Vorsorge“ (Patientenverfügung, Bestatter in der Nähe mit Anfragen bei Kooperations-Bestattern, neutrale Info zur Sterbegeldversicherung) und KI-Assistent für Fragen zur App, zu Anlaufstellen und zur Vorsorge – in 9 Sprachen (DE, EN, TR, AR mit RTL, RU, UK, PL, IT, FR) und für 7 Länder vorbereitet (DE vollständig; AT, CH, IT, FR, TR, PL mit Notrufnummern).

**Zweckbestimmung:** SanusAnkh ist kein Medizinprodukt. Die App fragt keine Beschwerden ab, wertet keine Eingaben aus, stellt keine Diagnosen, bewertet keine Dringlichkeit und gibt keine Behandlungs- oder Medikamentenempfehlungen. Sie formuliert keine eigenen Erste-Hilfe-Anleitungen, sondern verlinkt anerkannte Hilfsorganisationen. Diese Grenzen gelten auch für den KI-Assistenten (Systemprompt in `../netlify/functions/assistant.mjs`) und für die Store-Texte ([STORE-TEXTE.md](STORE-TEXTE.md)). Neue Funktionen bitte daran messen.

Keine Konten: Notfallpass, Vorsorge-Angaben, Hausapotheke und Einstellungen liegen nur auf dem Gerät (AsyncStorage, Namespace `sanusankh.v1`; Foto der Verfügung im privaten App-Ordner). Gepflegte Inhalte (Länder, Hausapotheke, Vorsorge-Texte) sind JSON-Dateien in `src/content/`.

**Sprache ≠ Land:** Die Sprache steuert nur die Texte. Das Land (Einstellung „Land“, beim ersten Start mit Vorschlag aus der Geräteregion abgefragt) steuert Notrufnummern, Kacheln und länderspezifische Inhalte. Der 112-Knopf funktioniert in allen Ländern.

## Entwickeln

```bash
cd mobile
npm install
npx expo start          # QR-Code mit der App „Expo Go“ scannen (iPhone und Android)
npm run check           # lint + check:i18n + check:content
npm run check:i18n      # alle Sprachen haben dieselben Schlüssel und Platzhalter wie Deutsch
npm run check:content   # Inhalte: Pflichtfelder, keine Arzneimittel in der Hausapotheke, Erste Hilfe nur als Links
npx expo-doctor         # prüft Abhängigkeiten und Konfiguration
```

Alle verwendeten Module sind in Expo Go enthalten – zum Ausprobieren auf dem eigenen Handy ist kein Mac und kein eigener Build nötig. Telefon-Links, Standort und Vibration funktionieren nur auf einem echten Gerät. `npx expo start --web` startet eine Browser-Vorschau nur zum Testen; veröffentlicht wird die App ausschließlich in den Stores.

## Neue Sprache hinzufügen in 3 Schritten

1. **Übersetzungsdatei anlegen:** `src/locales/de.js` nach `src/locales/<code>.js` kopieren (z. B. `es.js`) und alle Texte übersetzen. `{platzhalter}` wie `{oncall}` oder `{country}` unverändert lassen.
2. **In der Sprachkonfiguration eintragen:** in `src/data/languages.js` die Datei importieren und eine Zeile ergänzen:
   `{ code: "es", label: "Español", flag: "🇪🇸", dir: "ltr", speech: "es-ES", messages: es }` (für Rechts-nach-links-Sprachen `dir: "rtl"`).
3. **Prüfen:** `npm run check:i18n`. Das Skript meldet fehlende, leere oder überzählige Schlüssel und abweichende Platzhalter.

Optional: In `src/data/warningSigns.js` und `firstAidGuides.js` die Titel um `es: "…"` ergänzen (sonst Deutsch) und den Sprachcode in der KI-Funktion (`../netlify/functions/assistant.mjs`, `LANGUAGES`) eintragen.

## Inhalte pflegen

| Datei | Inhalt | Regeln |
| --- | --- | --- |
| `src/data/warningSigns.js` | Allgemeine Warnzeichen für „Wann 112 anrufen?“ | Für alle gleich, keine Abfrage, keine Auswertung; Titel in allen 9 Sprachen |
| `src/data/firstAidGuides.js` | 18 Erste-Hilfe-Themen | Nur Titel und Links (`links: [{ org, url }]`) zu `drk`, `johanniter`, `malteser` – keine eigenen Schritte. Links zuletzt geprüft am 29.10.2026 |
| `src/content/countries.json` | Länder (ISO-Code) mit Nummern | `numbers[].kind`: emergency, ambulance, fire, police, oncall, advice, poison (mit `number` oder `regions`), crisis, crisisAlt |
| `src/content/medicineCabinet.json` | Checkliste Hausapotheke | Nur `kind: "supply"` mit neutraler Beschreibung – keine Arzneimittel, keine Anwendungshinweise |
| `src/content/careInfo.json` | Vorsorge-Texte je Land und Thema | `topic`: directive / insurance / funeral, `sections`, `links` |

`npm run check:content` setzt diese Regeln durch. **Kooperations-Bestatter** liegen auf dem Server und werden in der Admin-Ansicht gepflegt (siehe unten). Sterbegeld-Anbieter gibt es nicht mehr – die Seite „Sterbegeldversicherung“ zeigt nur eine neutrale Erklärung mit Link zur Verbraucherzentrale.

## Serveradresse, KI-Assistent und Rechtstexte

Der API-Key darf nicht in die App (er wäre aus dem App-Paket auslesbar). Die App ruft die Serverfunktionen aus dem Hauptprojekt auf:

1. Hauptprojekt bei Netlify deployen und dort die Umgebungsvariablen setzen (siehe `../README.md`).
2. In `mobile/` die Datei `.env.example` nach `.env` kopieren und `EXPO_PUBLIC_API_URL` auf `https://<deine-domain>/api` setzen.
3. Für EAS-Builds dieselbe Variable unter *expo.dev → Projekt → Environment variables* hinterlegen.

**Impressum und Datenschutzerklärung** stehen nur auf der Webseite der Domain (`/impressum/`, `/datenschutz/`, Dateien im Hauptprojekt). Die App verlinkt dorthin; die Adresse wird aus `EXPO_PUBLIC_API_URL` abgeleitet (`…/api` → `…`) oder mit `EXPO_PUBLIC_SITE_URL` gesetzt. Fest in der App stehen nur die „Nutzungshinweise“ (`src/app/legal/[page].js`).

**KI-Assistent:** Standardmodell Claude Haiku 5.5. Er beantwortet Fragen zur App, zu Anlaufstellen und zur Vorsorge. Gesundheitsfragen beantwortet er nicht, sondern verweist auf 112, den ärztlichen Bereitschaftsdienst oder die Hausarztpraxis; unter jeder Antwort steht fest „Im Notfall: 112 anrufen“. Die App bewertet Fragen nicht. An den Server gehen nur Frage, Sprache und Land – nie Notfallpass, Vorsorge-Angaben oder Hausapotheke. Ohne Serveradresse zeigt der Assistent einen Hinweis; alles andere funktioniert, Menüs, Warnzeichen und Themen auch offline.

## Kooperations-Bestatter: Anfragen und Provisionen

Nutzer können bei freigeschalteten Bestattern eine Leistung anfragen und erhalten ggf. einen Rabatt. **Die App wickelt keine Zahlungen ab** – Vertrag und Bezahlung laufen direkt zwischen Nutzer und Bestatter.

**Provision nur mit Vereinbarung:** Standardmäßig hat kein Bestatter eine Provisionsvereinbarung (Admin: Häkchen „Provisionsvereinbarung liegt vor“, mit Art, Höhe und Beginn). Ohne Vereinbarung gibt es keinen Provisionshinweis in App und E-Mails, keine Provision in der Vermittlung und keinen Meldesatz an den Bestatter. Mit Vereinbarung (und innerhalb ihres Zeitraums) heißt der Bestatter in der App „Partner von SanusAnkh“, und der Provisionshinweis erscheint in der Liste, auf der Detailseite und über dem Absenden-Knopf. Die App erfährt nur `commission: true/false`, nie die Höhe. `/api/partners` darf 5 Minuten gecacht werden – Änderungen erscheinen in der App spätestens dann.

**Ablauf in der App** (Vorsorge → Bestatter):

1. In der Umkreissuche erscheinen freigeschaltete Bestatter als „Über SanusAnkh anfragen“ (mit Vereinbarung: „Partner von SanusAnkh“).
2. Detailseite: Rabatt mit Bedingungen, Leistungen mit Richtpreis „ab …“, Kontakt, Karte.
3. Leistung wählen → Formular (Name, E-Mail, optional Telefon, Wunschtermin, Tageszeit, Nachricht). Bestattungswünsche aus dem Notfallpass nur per eigenem Klick, mit Vorschau.
4. Einwilligung per Checkbox (nicht vorausgewählt). Nur bei Bestattern mit Provisionsvereinbarung steht direkt über dem Absenden-Knopf: „Gut zu wissen: Wenn du diesen Bestatter beauftragst, bekommt SanusAnkh von ihm eine Provision. Du zahlst dadurch nicht mehr.“
5. Bestätigung mit Code `SA-XXXX-XXXX`; der Nutzer bekommt ihn auch per E-Mail, der Bestatter die Anfrage per E-Mail und/oder Webhook.
6. „Meine Anfragen“ (Vorsorge) liegt nur auf dem Gerät. Zurückziehen setzt den Status auf „storniert“ und informiert den Bestatter.

Ohne Verbindung zeigt die App die zuletzt geladenen Partnerdaten, Anfragen sind dann gesperrt („Anfrage nur mit Internetverbindung möglich“).

**Server** (Hauptprojekt, `netlify/`):

| Datei | Aufgabe |
| --- | --- |
| `functions/partners.mjs` | `GET /api/partners?country=DE` – öffentliche Partnerdaten (ohne Provisionshöhe, Kontaktweg, Vertrag; nur `commission: true/false`) |
| `functions/requests.mjs` | `POST /api/requests`, `POST /api/requests/withdraw` |
| `functions/admin.mjs` | Admin-Schnittstelle `/api/admin/*` |
| `lib/storage/` | **einziger** Speicherzugriff (Netlify Blobs; lokal JSON-Dateien in `.data/`). Für eine echte Datenbank nur dieses Modul austauschen. |
| `lib/model.mjs` | Datenmodell Partner und Vermittlung, Validierung, Provisionsberechnung |
| `lib/delivery.mjs`, `lib/emails.mjs` | Versand über Brevo und Webhooks, E-Mail-Texte |
| `lib/auth.mjs` | Admin-Login |

Der Server speichert pro Anfrage nur die **Vermittlung**: Code, Bestatter, Leistung, Datum, Status (angefragt → kontaktiert → beauftragt → abgerechnet / storniert), Auftragswert, Abrechnungsstatus und – nur bei Bestattern mit Provisionsvereinbarung – Provisionsmodell und Provision. Name, Telefon, E-Mail und Nachricht gehen nur in die E-Mails und werden nicht gespeichert, auch nicht im Protokoll. Zurückziehen braucht neben dem Code ein Token, das nur auf dem Gerät liegt – der Bestatter, der den Code ebenfalls kennt, kann eine Anfrage also nicht im Namen des Nutzers stornieren.

**Testbetrieb:** Ohne `BREVO_API_KEY` und `MAIL_FROM` wird nichts versendet; das Protokoll enthält nur Code, Bestatter, Leistung und Zeitstempel. App und Admin-Ansicht zeigen „Testbetrieb“.

**Admin-Ansicht** unter `https://<deine-domain>/admin` (nur Web): Bestatter mit Rabatt, Leistungen, Kontaktweg, Freischaltung und (optional) Provisionsvereinbarung pflegen; Vermittlungen nach Bestatter, Zeitraum und Status filtern; Status, Auftragswert, Abrechnung und interne Notiz pflegen; Monatsübersicht der Provisionen pro Bestatter mit CSV-Export. Zugang über ein gemeinsames Passwort (`ADMIN_PASSWORD`, mind. 12 Zeichen) mit zeitkonstantem Vergleich, Sperre nach Fehlversuchen und Sitzungs-Timeout.

**Lokal testen:** Im Hauptprojekt `.env` mit `ADMIN_PASSWORD` anlegen, `npm run dev -- --host` starten (Admin: `http://localhost:5173/admin/`, Demo-Bestatter wird automatisch angelegt) und in `mobile/.env` `EXPO_PUBLIC_API_URL=http://<LAN-IP>:5173/api` setzen. Der Demo-Bestatter erscheint nur in Entwicklungs-Builds (Expo Go).

## Veröffentlichung im App Store und bei Google Play

Gebaut wird in der Cloud mit EAS Build – auch die iOS-App, ein Mac ist nicht nötig. Store-Texte und Datenschutzangaben: [STORE-TEXTE.md](STORE-TEXTE.md).

**Einmalig einrichten**

1. Konten: Apple Developer Program (99 € pro Jahr; als Privatperson oder als Firma mit D-U-N-S-Nummer), Google Play Console (einmalig 25 USD; Firmenkonto ebenfalls mit D-U-N-S-Nummer), Expo-Konto (kostenlos). **Kein Firebase-Projekt, keine `google-services.json`, kein Apple-Push-Schlüssel nötig:** Die Erinnerungen der Hausapotheke sind lokale Benachrichtigungen; in `app.json` ist `enableRemoteNotifications: false` gesetzt, damit iOS keine Push-Berechtigung (`aps-environment`) bekommt.
2. `npx eas-cli@latest login` und `npx eas-cli@latest init` (verknüpft das Projekt mit dem Expo-Konto).
3. `EXPO_PUBLIC_API_URL` (und ggf. `EXPO_PUBLIC_SITE_URL`) unter *expo.dev → Projekt → Environment variables* für die Umgebung „production“ setzen.
4. **App Store Connect:** App mit Bundle-ID `de.sanusankh.app` anlegen. Beim ersten `npm run submit:ios` fragt EAS nach Apple-ID bzw. App-Store-Connect-API-Schlüssel und merkt sich die App (`ascAppId`). Zertifikate und Profile erstellt EAS beim ersten iOS-Build selbst.
5. **Google Play Console:** App mit Paketname `de.sanusankh.app` anlegen. Die **allererste** Version einmal von Hand hochladen (Google verlangt das vor jeder API-Einreichung): `npm run build:android`, die `.aab` von expo.dev herunterladen und in der Play Console unter „Interner Test“ hochladen. Danach ein Dienstkonto mit Play-Console-Zugriff anlegen und dessen JSON-Schlüssel als `mobile/secrets/google-play-service-account.json` speichern (der Ordner ist in `.gitignore`).

**Jede neue Version**

```bash
cd mobile
npm run build            # prüft (lint, Sprachen, Inhalte) und baut Android (AAB) und iOS (IPA)
npm run submit           # reicht die neuesten Builds bei Google Play und App Store Connect ein
# einzeln: npm run build:android / build:ios, npm run submit:android / submit:ios
```

- Die Versionsnummer für die Nutzer steht in `app.json` (`version`); Build-Nummern zählt EAS selbst hoch (`appVersionSource: remote`, `autoIncrement`).
- **Google Play:** `submit:android` lädt in den Track „internal“ als Entwurf hoch (`eas.json`). Von dort in der Play Console in „Geschlossener Test“ bzw. „Produktion“ übernehmen. Neue private Entwicklerkonten brauchen vor der Produktion einen geschlossenen Test (mind. 12 Tester, 14 Tage).
- **App Store:** `submit:ios` lädt zu App Store Connect hoch; dort die Version mit Build, Texten und Screenshots zur Prüfung einreichen. Vorher über TestFlight testen.
- Kleine Text- oder Inhaltsänderungen ohne neuen Store-Build wären mit EAS Update möglich (derzeit nicht eingerichtet).

## Vor der Veröffentlichung

Siehe [OFFENE-PUNKTE.md](OFFENE-PUNKTE.md) (Kundenlieferungen, Konten, Rechtstexte aus dem Generator) und [RECHTSTEXTE-ANGABEN.md](RECHTSTEXTE-ANGABEN.md). Technisch zusätzlich:

- [ ] **Bundle-ID / Paketname** `de.sanusankh.app` (in `app.json`) ersetzen, falls die Domain nicht dem Kunden gehört. Nach der ersten Veröffentlichung nicht mehr änderbar.
- [ ] **KI-Server:** Ausgabenlimit im Anthropic-Konto setzen; die Funktion ist öffentlich erreichbar und hat noch keine Ratenbegrenzung.
- [ ] **OpenStreetMap:** Kachel-, Overpass- und Nominatim-Server der OSMF sind für geringe Last gedacht. Bei vielen Nutzern einen kommerziellen Anbieter verwenden.
- [ ] Store-Screenshots (iPhone, Android), Altersfreigabe-Fragebogen in beiden Stores.

## Struktur

```
app.json, eas.json           App-Konfiguration (Berechtigungen, Icons, iOS-Privacy-Manifest) und Build-/Einreichungsprofile
assets/                      Icons, Splash (aus brand/logo.jpg), images/emblem.png
scripts/                     check-i18n.mjs, check-content.mjs
src/app/                     Bildschirme (Expo Router)
  (tabs)/                    index, emergency (Warnzeichen), guides (Erste-Hilfe-Themen), pass, more
  guide/[slug]  profile/…    Erste-Hilfe-Thema mit Links, Notfallpass anlegen/bearbeiten/Vollbild
  cabinet                    Hausapotheke (Checkliste)
  care/                      Vorsorge: index, directive, funeral, partner/[id], request, sent, requests, insurance
  numbers, pharmacy, telemedicine, transport, hospitals, legal/[page]
src/components/              Screen, AppHeader, EmergencyCallButton, SourceLinks, CountryPicker, CareInfo, Such- und Formular-Bausteine
  ui/                        Text, Button, Card, CheckRow, TextField, SelectField, OptionSheet, Collapsible, Toast …
src/content/                 gepflegte Inhalte als JSON: countries, medicineCabinet, careInfo
src/data/                    Sprachkonfiguration (languages.js), Warnzeichen, Erste-Hilfe-Themen
src/locales/                 eine Datei pro Sprache (de, en, tr, ar, ru, uk, pl, it, fr)
src/lib/                     i18n (Sprache + Land), content, storage, api, ai, partners, geo, links, reminders, scans, theme
```
