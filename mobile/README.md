# SanusAnkh – App für iOS und Android

Native App (React Native mit Expo SDK 58 und Expo Router): 112-Schnellzugriff, 18 Erste-Hilfe-Anleitungen mit Takt-Hilfe, Symptom-Check mit Ampel, Notrufnummern je Land, Apotheken- und Kliniksuche, Hausapotheke mit Ablauf-Erinnerung, Notfallpass (inkl. Patientenverfügung und Bestattungswünschen), Bereich „Vorsorge“ (Patientenverfügung, Bestatter in der Nähe, Sterbegeld-Partnerangebote), Verlauf und KI-Assistent – in 9 Sprachen (DE, EN, TR, AR mit RTL, RU, UK, PL, IT, FR) und für 7 Länder vorbereitet (DE vollständig; AT, CH, IT, FR, TR, PL mit Notrufnummern).

Keine Konten, keine Datenbank: Notfallpass, Vorsorge-Angaben, Hausapotheke, Verlauf und Einstellungen liegen nur auf dem Gerät (AsyncStorage, Namespace `sanusankh.v1`; Foto der Verfügung im privaten App-Ordner). Gepflegte Inhalte (Länder, Hausapotheke, Vorsorge-Texte, Anbieter) sind JSON-Dateien in `src/content/`.

**Sprache ≠ Land:** Die Sprache steuert nur die Texte. Das Land (Einstellung „Land“, beim ersten Start mit Vorschlag aus der Geräteregion abgefragt) steuert Notrufnummern, Kacheln und länderspezifische Inhalte. Der 112-Knopf funktioniert in allen Ländern.

## Entwickeln

```bash
cd mobile
npm install
npx expo start          # QR-Code mit der App „Expo Go“ scannen (iPhone und Android)
npm run lint
npm run check:i18n      # alle Sprachen haben dieselben Schlüssel und Platzhalter wie Deutsch
npm run check:content   # Inhalte in src/content/ (Pflichtfelder, Freigaben, keine Dosierungen, Partnerverträge)
npx expo-doctor         # prüft Abhängigkeiten und Konfiguration
```

## Neue Sprache hinzufügen in 3 Schritten

1. **Übersetzungsdatei anlegen:** `src/locales/de.js` nach `src/locales/<code>.js` kopieren (z. B. `es.js`) und alle Texte übersetzen. `{platzhalter}` wie `{oncall}` oder `{country}` unverändert lassen.
2. **In der Sprachkonfiguration eintragen:** in `src/data/languages.js` die Datei importieren und eine Zeile ergänzen:
   `{ code: "es", label: "Español", flag: "🇪🇸", dir: "ltr", speech: "es-ES", messages: es }` (für Rechts-nach-links-Sprachen `dir: "rtl"`).
3. **Prüfen:** `npm run check:i18n`. Das Skript meldet fehlende, leere oder überzählige Schlüssel und abweichende Platzhalter.

Komponenten müssen nicht geändert werden. Fehlt ein Text in einer Sprache, zeigt die App den deutschen Text, nie einen leeren Text oder den Schlüsselnamen.

Optional:
- In den Inhaltsdaten (`src/data/redFlags.js`, `firstAidGuides.js`, `symptomFlows.js`) Einträge `es: "…"` ergänzen. Fehlen sie, gilt Deutsch bzw. die KI-Übersetzung. Für die Warnzeichen empfehlen wir feste Übersetzungen, damit der Notfallweg ohne Netz funktioniert.
- Den Sprachcode in der KI-Funktion (`../netlify/functions/assistant.mjs`, `LANGUAGES`) eintragen.

## Inhalte pflegen (`src/content/`)

Länder-, Hausapotheken-, Vorsorge- und Sterbegeld-Daten liegen als JSON-Dateien im Projekt, nicht im Code. Änderungen erfolgen in der Datei, dann `npm run check:content`, dann ein neuer Build oder ein Update. **Kooperations-Bestatter** liegen dagegen auf dem Server und werden in der Admin-Ansicht gepflegt (siehe [Kooperations-Bestatter](#kooperations-bestatter-anfragen-und-provisionen)).

| Datei | Inhalt | Wichtige Felder |
| --- | --- | --- |
| `countries.json` | Länder (ISO-Code) mit Nummern | `numbers[].kind`: emergency, ambulance, fire, police, oncall, advice, poison (mit `number` oder `regions`), crisis, crisisAlt; optional `taxiShortcode`, `pharmacyDuty` |
| `medicineCabinet.json` | Hausapotheke je Land (`country: "*"` = alle) | `kind`: supply / medicine, `status`: unreviewed / reviewed, `reviewedBy`, `reviewedAt`, `source` |
| `careInfo.json` | Vorsorge-Texte je Land und Thema | `topic`: directive / insurance / funeral, `sections`, `links` |
| `providers.json` | Sterbegeld-Anbieter | `type: "insurance"`, `country`, `website`, `logo`, `partner`, `contractFrom`/`contractTo`, `priority`, `active`, `tracking` |

Regeln, die die App und `check:content` durchsetzen:

- **Arzneimittel:** nur als Wirkstoffgruppe bzw. allgemeine Bezeichnung, ohne Dosierung. Das Skript lehnt Mengenangaben wie „500 mg“ oder „3 x täglich“ ab. Jeder Eintrag zeigt in der App „Frag in deiner Apotheke nach dem passenden Präparat. Packungsbeilage beachten.“
- **Freigabe:** Ein Arzneimittel erscheint im Store-Build erst mit `"status": "reviewed"`, und zwar mit Name der prüfenden Person (`reviewedBy`) und Datum (`reviewedAt`). In Entwicklungs-Builds (Expo Go) sind ungeprüfte Einträge mit dem Hinweis „Ungeprüft“ sichtbar. Hat ein Land keine geprüften Arzneimittel, zeigt die App nur Hilfsmittel und „Länderspezifische Empfehlungen folgen“.
- **Partner:** Sie werden nur innerhalb des Vertragszeitraums hervorgehoben und immer als „Anzeige“ bzw. „Partnerangebot“ gekennzeichnet. Die Seite „Sterbegeldversicherung“ erscheint nur, wenn das Land mindestens einen aktiven Versicherungspartner hat. `tracking` (z. B. `utm_source=sanusankh`) wird an die Website angehängt und darf keine personenbezogenen Parameter enthalten.
- **Demo-Einträge:** Einträge mit `"demo": true` erscheinen nur in Entwicklungs-Builds. Demo-Anbieter vor dem Start durch echte Partnerdaten ersetzen oder löschen.
- **Klickzählung:** Partnerklicks werden nicht gezählt. Auswertung über die `utm`-Parameter in der Statistik des Partners.

Alle verwendeten Module sind in Expo Go enthalten – zum Ausprobieren auf dem eigenen Handy ist kein Mac und kein eigener Build nötig. Telefon-Links, Standort, Vibration und Ton funktionieren nur auf einem echten Gerät, nicht im Simulator.

`npx expo start --web` startet zusätzlich eine Browser-Vorschau. Sie dient nur zum schnellen Testen; Ziel sind die Store-Apps.

## KI-Assistent

Der API-Key darf nicht in die App (er wäre aus dem App-Paket auslesbar). Die App ruft deshalb die Serverfunktion aus dem Hauptprojekt auf (`../netlify/functions/assistant.mjs`, Pfad `/api/assistant`):

1. Hauptprojekt bei Netlify deployen und dort `ANTHROPIC_API_KEY` als Umgebungsvariable setzen (siehe `../README.md`).
2. In `mobile/` die Datei `.env.example` nach `.env` kopieren und `EXPO_PUBLIC_API_URL` auf `https://<deine-seite>.netlify.app/api` setzen (Basisadresse für KI, Bestatter und Anfragen; ältere Werte mit `/assistant` am Ende funktionieren weiter).
3. Für EAS-Builds dieselbe Variable unter *expo.dev → Projekt → Environment variables* hinterlegen.

Ohne Adresse läuft die App ohne KI: Der Assistent zeigt einen Hinweis; Anleitungen, Symptom-Fragen, Hausapotheke und Vorsorge-Texte erscheinen auf Deutsch. Menüs, Titel, Warnzeichen und Notfallanweisungen sind fest in allen 9 Sprachen hinterlegt und funktionieren auch offline.

An den Server gehen nur die Frage, die Sprache, das Land und ggf. Anleitungstext als Kontext. Notfallpass, Vorsorge-Angaben und Hausapotheke werden nie übertragen. Die KI-Regeln im System-Prompt verbieten Medikamenten- und Dosierungsempfehlungen, Rechts- und Versicherungsberatung sowie Empfehlungen bestimmter Bestatter oder Versicherer.

## Kooperations-Bestatter: Anfragen und Provisionen

Nutzer können bei Kooperations-Bestattern eine Leistung verbindlich anfragen und erhalten einen Rabatt. SanusAnkh erhält pro Beauftragung eine Provision. **Die App wickelt keine Zahlungen ab** – Vertrag und Bezahlung laufen direkt zwischen Nutzer und Bestatter.

**Ablauf in der App** (Vorsorge → Bestatter):

1. In der Umkreissuche erscheinen Kooperations-Bestatter als „Partner – Rabatt über SanusAnkh“.
2. Detailseite: Rabatt mit Bedingungen, Leistungen mit Richtpreis „ab …“, Kontakt, Karte.
3. Leistung wählen → Formular (Name, E-Mail, optional Telefon, Wunschtermin, Tageszeit, Nachricht). Bestattungswünsche aus dem Notfallpass nur per eigenem Klick, mit Vorschau.
4. Einwilligung per Checkbox (nicht vorausgewählt), Provisionshinweis direkt über dem Absenden-Knopf.
5. Bestätigung mit Code `SA-XXXX-XXXX`; der Nutzer bekommt ihn auch per E-Mail, der Bestatter die Anfrage per E-Mail und/oder Webhook.
6. „Meine Anfragen“ (Vorsorge) liegt nur auf dem Gerät. Zurückziehen setzt den Status auf „storniert“ und informiert den Bestatter.

Ohne Verbindung zeigt die App die zuletzt geladenen Partnerdaten, Anfragen sind dann gesperrt („Anfrage nur mit Internetverbindung möglich“).

**Server** (Hauptprojekt, `netlify/`):

| Datei | Aufgabe |
| --- | --- |
| `functions/partners.mjs` | `GET /api/partners?country=DE` – öffentliche Partnerdaten (ohne Provision, Kontaktweg, Vertrag) |
| `functions/requests.mjs` | `POST /api/requests`, `POST /api/requests/withdraw` |
| `functions/admin.mjs` | Admin-Schnittstelle `/api/admin/*` |
| `lib/storage/` | **einziger** Speicherzugriff (Netlify Blobs; lokal JSON-Dateien in `.data/`). Für eine echte Datenbank nur dieses Modul austauschen. |
| `lib/model.mjs` | Datenmodell Partner und Vermittlung, Validierung, Provisionsberechnung |
| `lib/delivery.mjs`, `lib/emails.mjs` | Versand über Brevo und Webhooks, E-Mail-Texte |
| `lib/auth.mjs` | Admin-Login |

Der Server speichert pro Anfrage nur die **Vermittlung**: Code, Bestatter, Leistung, Datum, Status (angefragt → kontaktiert → beauftragt → abgerechnet / storniert), Auftragswert, Provision, Abrechnungsstatus. Name, Telefon, E-Mail und Nachricht gehen nur in die E-Mails und werden nicht gespeichert, auch nicht im Protokoll. Zurückziehen braucht neben dem Code ein Token, das nur auf dem Gerät liegt – der Bestatter, der den Code ebenfalls kennt, kann eine Anfrage also nicht im Namen des Nutzers stornieren.

**Testbetrieb:** Ohne `BREVO_API_KEY` und `MAIL_FROM` wird nichts versendet; das Protokoll enthält nur Code, Bestatter, Leistung und Zeitstempel. App und Admin-Ansicht zeigen „Testbetrieb“.

**Admin-Ansicht** unter `https://<deine-seite>.netlify.app/admin` (nur Web): Bestatter mit Rabatt, Leistungen, Kontaktweg, Provisionsmodell und Vertrag pflegen; Vermittlungen nach Bestatter, Zeitraum und Status filtern; Status, Auftragswert, Abrechnung und interne Notiz pflegen; Monatsübersicht der Provisionen pro Bestatter mit CSV-Export. Ein Bestatter erscheint in der App nur bei Vertragsstatus „aktiv“ innerhalb der Laufzeit. Die Provision wird nach dem Modell berechnet, das bei der Anfrage galt.

Zugang: ein gemeinsames Passwort (`ADMIN_PASSWORD`, mind. 12 Zeichen) mit zeitkonstantem Vergleich, wachsender Verzögerung nach Fehlversuchen und 15 Minuten Sperre nach 5 Fehlversuchen. Die Sitzung läuft nach 30 Minuten Inaktivität bzw. spätestens nach 8 Stunden ab (HttpOnly-Cookie, `SameSite=Strict`).

**Lokal testen:** Im Hauptprojekt `.env` mit `ADMIN_PASSWORD` anlegen, `npm run dev -- --host` starten (Admin: `http://localhost:5173/admin`, Demo-Bestatter wird automatisch angelegt) und in `mobile/.env` `EXPO_PUBLIC_API_URL=http://<LAN-IP>:5173/api` setzen. Der Demo-Bestatter erscheint nur in Entwicklungs-Builds (Expo Go).

## Builds und Veröffentlichung (ohne Mac)

Gebaut wird in der Cloud mit EAS Build – auch die iOS-App, ein Mac ist nicht nötig.

```bash
npx eas-cli@latest login
npx eas-cli@latest init                                       # verknüpft das Projekt mit deinem Expo-Konto
npx eas-cli@latest build --platform android --profile preview # Test-APK zum direkten Installieren
npx eas-cli@latest build --platform all --profile production  # Store-Builds (AAB + IPA)
npx eas-cli@latest submit --platform android                  # Upload in die Google Play Console
npx eas-cli@latest submit --platform ios                      # Upload zu App Store Connect / TestFlight
```

Voraussetzungen:

- **Apple Developer Program** (99 USD/Jahr) – EAS erstellt Zertifikate und Profile beim ersten iOS-Build selbst.
- **Google Play Console** (einmalig 25 USD). Neue private Entwicklerkonten müssen vor der Veröffentlichung einen geschlossenen Test (mind. 12 Tester, 14 Tage) durchlaufen.

## Vor der Veröffentlichung

- [ ] **Medizinprodukt-Frage klären:** Ein Symptom-Check, der Dringlichkeitsstufen ausgibt, kann nach EU-MDR (Regel 11) als Medizinprodukt-Software gelten. Vor dem Store-Start regulatorisch prüfen lassen – davon hängen Zulassung, Haftung und Store-Freigabe ab.
- [ ] **Bundle-ID / Paketname** `de.sanusankh.app` (in `app.json`) durch eine eigene Kennung ersetzen, falls dir die Domain nicht gehört. Nach der ersten Store-Veröffentlichung nicht mehr änderbar.
- [ ] **Rechtstexte** in `src/app/legal/[page].js`: alle gelb markierten `[Platzhalter]` ersetzen und juristisch prüfen lassen.
- [ ] **Datenschutzerklärung als Webseite:** Beide Stores verlangen eine öffentliche URL (z. B. die `/datenschutz`-Seite der Web-Version auf Netlify – Inhalt an die App-Fassung angleichen).
- [ ] **Store-Angaben zum Datenschutz** (App Privacy / Data Safety): keine Konten, kein Tracking; Standort nur auf Anfrage und nicht gespeichert; Fragen an den Assistenten werden an den Server und Anthropic übertragen.
- [ ] **Google Play:** Erklärung zu Gesundheits-Apps im Play-Console-Formular ausfüllen. **Apple:** In der Beschreibung klarstellen, dass die App keine Diagnosen stellt (Richtlinie 1.4.1).
- [ ] **Telefonnummern** (`src/content/countries.json`) und **medizinische Inhalte** (`src/data/*.js`, `src/content/medicineCabinet.json`) fachlich prüfen lassen.
- [ ] **KI-Server absichern:** Die Funktion ist öffentlich erreichbar. Vor dem Start ein Ausgabenlimit im Anthropic-Konto setzen und eine Ratenbegrenzung einbauen.
- [ ] **OpenStreetMap:** Kachel- und Overpass-Server der OSMF sind für geringe Last gedacht. Bei vielen Nutzern einen kommerziellen Anbieter verwenden.
- [ ] Store-Screenshots, Beschreibung in den 9 Sprachen, Altersfreigabe-Fragebogen.
- [ ] **Fachliche Prüfungen und Kundenlieferungen:** siehe [OFFENE-PUNKTE.md](OFFENE-PUNKTE.md).
- [ ] **Store-Datenschutzangaben ergänzen:** Kamera/Fotos (nur für das Foto der Verfügung, bleibt auf dem Gerät), lokale Mitteilungen, Ortssuche über Nominatim, Partnerlinks mit UTM-Parametern.

## Unterschiede zur Web-Version

| Thema | Web | App |
| --- | --- | --- |
| Speicher | localStorage | AsyncStorage, beim Start in den Arbeitsspeicher geladen |
| Schriften | Google Fonts (extern) | im App-Paket (`@expo-google-fonts`), keine Übertragung an Google |
| Arabisch / RTL | `dir="rtl"` am `<html>` | `direction: "rtl"` im Layout – wechselt sofort, ohne Neustart (I18nManager bräuchte einen App-Neustart) |
| Startsprache | Deutsch | Gerätesprache, falls unterstützt, sonst Deutsch |
| Land | nur Deutschland | Einstellung „Land“, beim ersten Start bestätigt (Vorschlag aus der Geräteregion) |
| Navigation | Kopfleiste + untere Leiste | 5 Tabs (Start, Symptom-Check, Anleitungen, Notfallpass, Mehr), Unterseiten als Stack |
| Route | OpenStreetMap im Browser | Apple Karten bzw. Karten-App-Auswahl unter Android |
| Standort verweigert | Hinweis | Hinweis + Knopf „Einstellungen öffnen“ |
| Metronom | Web Audio + `navigator.vibrate` | Klick-Datei (`assets/sounds/click.wav`, auch im Stummmodus) + Haptik; Bildschirm bleibt an |
| Notfallpass-Vollbild | eigene Seite | Vollbild-Modal, Bildschirm bleibt an |
| Übersetzungs-Cache | sessionStorage | Arbeitsspeicher (pro App-Sitzung) |
| Bestätigungen | Dialoge | native Systemdialoge (`Alert`) |

Deutscher Originaltext ohne KI-Übersetzung wird in der arabischen Oberfläche automatisch links-nach-rechts gesetzt.

## Struktur

```
app.json, eas.json           App-Konfiguration (Berechtigungen, Icons) und Cloud-Build-Profile
assets/                      Icons, Splash (aus brand/logo.jpg), images/emblem.png, sounds/click.wav
scripts/                     check-i18n.mjs, check-content.mjs, make-click.mjs (erzeugt den Klickton)
src/app/                     Bildschirme (Expo Router)
  (tabs)/                    index, triage, guides, pass, more
  guide/[slug]  profile/…    Anleitung, Notfallpass anlegen/bearbeiten/Vollbild
  cabinet                    Hausapotheke
  care/                      Vorsorge: index, directive, funeral, insurance
  numbers, pharmacy, telemedicine, transport, hospitals, history, legal/[page]
src/components/              Screen, AppHeader, EmergencyCallButton, CountryPicker, CareInfo, Triage-, Such- und Formular-Bausteine
  ui/                        Text, Button, Card, CheckRow, TextField, SelectField, OptionSheet, Collapsible, Toast …
src/content/                 gepflegte Inhalte als JSON: countries, medicineCabinet, careInfo, providers
src/data/                    Sprachkonfiguration (languages.js) und Erste-Hilfe-Inhalte (Anleitungen, Abläufe, Warnzeichen)
src/locales/                 eine Datei pro Sprache (de, en, tr, ar, ru, uk, pl, it, fr)
src/lib/                     i18n (Sprache + Land), translations, content, storage, ai, geo, links, reminders, scans, theme
```

Die Erste-Hilfe-Inhalte in `src/data/` stammen aus der Web-Version. Die Web-Version wird nicht mehr weiterentwickelt und dient nur noch als Server für die KI-Funktion.
