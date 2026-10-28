# Offene Punkte vor der Veröffentlichung

Diese Liste nennt alle Inhalte, die noch **fachlich (medizinisch oder juristisch) geprüft** oder **vom Kunden geliefert** werden müssen. Technisch ist alles umgesetzt. Die Inhalte stehen in den Dateien, die in der Spalte „Wo“ genannt sind.

## 1. Medizinische Prüfung (Fachpersonal)

| Was | Wo | Stand |
| --- | --- | --- |
| Hausapotheke Deutschland: 3 Arzneimittel-Gruppen (Schmerz-/Fieber, Durchfall inkl. Elektrolytlösung, Wunddesinfektion) | `src/content/medicineCabinet.json` | ungeprüft – erscheint im Store-Build erst nach Freigabe (`status`, `reviewedBy`, `reviewedAt`) |
| Hausapotheke für alle Länder: 7 Hilfsmittel (Verbandsmaterial, Thermometer, Handschuhe, Kühlpack, Pinzette/Zeckenkarte, Schere, Rettungsdecke) | `src/content/medicineCabinet.json` | ungeprüft – wird angezeigt, Kennzeichnung „Ungeprüft“ |
| Quellenangaben zur Hausapotheke | `medicineCabinet.json`, Feld `source` | leer – bitte Quelle eintragen (wir haben keine erfunden) |
| Hausapotheke für AT, CH, IT, FR, TR, PL | `medicineCabinet.json` | fehlt – App zeigt nur Hilfsmittel und „Länderspezifische Empfehlungen folgen“ |
| Erste-Hilfe-Anleitungen, Symptom-Abläufe, Warnzeichen (wie bisher) | `src/data/*.js` | ungeprüft |
| Feste italienische und französische Übersetzungen der Warnzeichen und Sofortmaßnahmen | `src/data/redFlags.js` (`it`, `fr`) | neu, von Muttersprachlern bzw. Fachübersetzern prüfen lassen |
| Medizinprodukt-Einstufung (EU-MDR) des Symptom-Checks | – | offen (siehe README) |

## 2. Notrufnummern je Land

Alle Länder sind in `src/content/countries.json` mit `"reviewed": false` markiert.

| Land | Hinterlegt | Prüfen bzw. ergänzen |
| --- | --- | --- |
| Deutschland | 112, 116117, 110, Giftnotruf je Bundesland, Telefonseelsorge (116 123, 0800 111 0 111), Taxi-Kurzwahl 22456, Apotheken-Notdienst | Gegenprüfung gegen offizielle Quellen |
| Österreich | 112, 144, 122, 133, 1450, Vergiftungsinformationszentrale, 142, Apothekenruf 1455 | prüfen |
| Schweiz | 112, 144, 118, 117, Tox Info Suisse 145, Die Dargebotene Hand 143 | prüfen; ärztlicher Notfalldienst ist kantonal (fehlt) |
| Italien | 112, 118, 115, 113 | Giftnotruf (regional), Krisentelefon, Guardia medica fehlen |
| Frankreich | 112, 15, 18, 17, 3114 | Giftnotruf (regional), Bereitschaftsdienst fehlen |
| Türkei | 112, Giftnotruf 114 | Krisentelefon fehlt |
| Polen | 112, 999, 998, 997, 116 123 | Giftnotruf (regional), Bereitschaftsdienst fehlen |

Für alle Länder außer Deutschland gilt außerdem: Symptom-Check, Fahrdienst-Hinweise und Telemedizin sind für das deutsche Gesundheitssystem geschrieben. Die App weist darauf hin.

## 3. Juristische Prüfung

| Was | Wo |
| --- | --- |
| Vorsorge-Texte Deutschland (Patientenverfügung, Vorsorgevollmacht, Betreuungsverfügung) und BMJ-Links | `src/content/careInfo.json` (`directive-de`) |
| Vorsorge-Texte für AT, CH und weitere Länder (z. B. Erwachsenenvertretung in AT, Vorsorgeauftrag in CH) | `careInfo.json` – fehlen; die App zeigt „noch keine Informationen“ |
| Neutrale Erklärung Sterbegeldversicherung | `careInfo.json` (`insurance-general`) |
| Partnerlinks gegen Vergütung bei Versicherungen: ggf. Versicherungsvermittlung (§ 34d GewO), Kennzeichnung als Werbung | `providers.json`, Datenschutz Abschnitt 10 |
| Datenschutzerklärung: neue Abschnitte 7–10 (Gesundheitsdaten nach Art. 9 DSGVO, Kamera/Fotos, Mitteilungen, Nominatim, Partnerlinks), alle als TODO markiert | `src/app/legal/[page].js` |
| Impressum, Haftungsausschluss (wie bisher) | `src/app/legal/[page].js` |

## 4. Vom Kunden zu liefern

| Was | Wo |
| --- | --- |
| Kooperations-Bestatter: Name, Adresse, Koordinaten, Telefon, Website, Rabatt mit Bedingungen, buchbare Leistungen mit Richtpreisen, E-Mail für Anfragen, Provisionsmodell, Vertrag von/bis, Ansprechpartner | Admin-Ansicht `/admin` → „Bestatter“ (nicht mehr in `providers.json`) |
| Partnerverträge Sterbegeldversicherung: Name, Website, Logo, Vertrag von/bis, Tracking-Parameter | `providers.json` (`type: "insurance"`) |
| Logos der Partner (https-Adresse) | Feld `logo` – die App zeigt Logos derzeit noch nicht an; bei Lieferung ergänzen wir die Anzeige |
| Ersetzen bzw. Löschen der Demo-Anbieter | `providers.json` (Sterbegeld, `"demo": true`); Demo-Bestatter wird nur lokal bzw. mit `SEED_DEMO_PARTNERS=true` angelegt |
| Telemedizin-Partner und Online-Apotheke (wie bisher Platzhalter) | `src/app/telemedicine.js`, `src/app/pharmacy.js` |
| Logo als Vektordatei (SVG) oder in höherer Auflösung | `assets/brand/` – Icons wurden aus dem 1254-px-JPG erzeugt |
| Freigabe der Ansprache „du“: Der Apotheken-Hinweis lautet in der App „Frag in deiner Apotheke …“ statt „Fragen Sie …“, passend zur übrigen App | `src/locales/*.js`, Schlüssel `cabinet.medHint` |

## 5. Kooperations- und Buchungsmodell Bestatter

Technisch umgesetzt und im Testbetrieb durchklickbar. Vor dem Live-Betrieb:

| Was | Wer | Wo / Hinweis |
| --- | --- | --- |
| Auftragsverarbeitungsvertrag (AVV) mit **Brevo** | Kunde | Brevo-Konto; Absenderdomain bei Brevo verifizieren (SPF/DKIM) |
| Auftragsverarbeitungsvertrag (AVV) mit **Netlify** – US-Anbieter, Drittlandübermittlung in der Datenschutzerklärung nennen (z. B. EU-US Data Privacy Framework/Standardvertragsklauseln) | Kunde, juristisch | Datenschutz Abschnitt 11 (als TODO markiert) |
| Datenschutzangaben in **App Store** („App-Datenschutz“) und **Google Play** („Datensicherheit“) anpassen: neu erhoben werden Name, E-Mail, optional Telefon und Freitext (ggf. Bestattungswünsche); Zweck: Weiterleitung an den gewählten Bestatter; Weitergabe an Dritte: ja (Bestatter) | Kunde | App Store Connect, Play Console |
| Kooperationsvertrag mit jedem Bestatter: Klausel **„keine Mehrkosten für Nutzer“** (Rabatt nicht durch Preisaufschlag finanziert) | juristisch, Kunde | Vertrag |
| Kooperationsvertrag: **monatliche Meldepflicht** für eingelöste Codes und Auftragswerte | juristisch, Kunde | Vertrag; Pflege in `/admin` → „Vermittlungen“ |
| Kooperationsvertrag: Verwendung der Anfragedaten nur zur Bearbeitung der Anfrage, Löschung nach Zurückziehen, Bestatter als eigener Verantwortlicher | juristisch | Vertrag |
| **Rechtliche Prüfung des Provisionshinweises** (Wortlaut, Platzierung, UWG/Kennzeichnung). In der App steht er in der Du-Form: „SanusAnkh erhält bei einer Beauftragung eine Vermittlungsprovision vom Bestatter. Für dich entstehen dadurch keine Mehrkosten.“ | juristisch | `src/locales/*.js`, Schlüssel `request.commission` |
| Einwilligungstext („Ich willige ein, dass meine Angaben an [Bestatter] übermittelt werden.“) und Hinweis zur Widerrufbarkeit | juristisch | Schlüssel `request.consent`, `request.consentHint` |
| Speicherdauer der Vermittlungsdaten (Code, Bestatter, Leistung, Datum, Status, Auftragswert) festlegen – derzeit unbegrenzt | juristisch, Kunde | Löschregel ggf. nachrüsten |
| Bestattungswünsche können religiöse Überzeugungen enthalten (Art. 9 DSGVO) – sie werden nur per eigenem Klick angehängt; Einordnung prüfen | juristisch | Datenschutz Abschnitt 11 |
| Texte der E-Mails an Bestatter und Nutzer prüfen; Nutzer-E-Mail derzeit Deutsch mit kurzem englischem Absatz | Kunde | `netlify/lib/emails.mjs` |
| Missbrauch: Wer eine fremde E-Mail-Adresse einträgt, löst eine Bestätigungsmail an diese Adresse aus. Schutz derzeit: höchstens 5 Anfragen pro Stunde je Herkunft. Ggf. Bestätigung per E-Mail-Link (Double-Opt-in) ergänzen | Kunde entscheidet | `netlify/functions/requests.mjs` |
| Umgebungsvariablen in Netlify setzen: `ADMIN_PASSWORD` (mind. 12 Zeichen), `HASH_SECRET`, `BREVO_API_KEY`, `MAIL_FROM`, `MAIL_FROM_NAME` | Kunde | Netlify → Environment variables; Vorlage `.env.example` |
| App-Build: `EXPO_PUBLIC_API_URL` ist jetzt die Basisadresse (`https://…/api`) statt der Assistent-Adresse | Entwicklung | `mobile/.env.example`, EAS-Umgebungsvariablen |
| Vorbereitet, nicht umgesetzt (TODO im Code): mehrere Admin-Konten; eigener Partner-Zugang, über den Bestatter Codes selbst einlösen und Auftragswerte melden | – | `netlify/lib/auth.mjs`, `src/admin/AdminApp.jsx` |
