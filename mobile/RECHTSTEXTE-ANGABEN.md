# Angaben für Impressum und Datenschutzerklärung

Impressum und Datenschutzerklärung werden mit einem Generator erstellt, eine anwaltliche Prüfung ist nicht eingeplant. Diese Liste enthält alles, was ein Generator abfragt, und beschreibt, welche Daten in SanusAnkh wohin fließen. Den erzeugten Text dann in `impressum/index.html` bzw. `datenschutz/index.html` im Hauptprojekt einfügen (Stelle ist markiert). Die Datenschutzerklärung gilt für die App (Android und iOS) **und** die Webseite. Die Adresse `https://<domain>/datenschutz/` wird in App Store Connect und in der Google Play Console als Datenschutz-URL eingetragen.

Generatoren, zum Beispiel:

- [eRecht24](https://www.e-recht24.de/): Generator für Impressum und Datenschutzerklärung.
- [Datenschutz-Generator von Dr. Schwenke](https://datenschutz-generator.de/): laut Anbieter kostenlos bis 5.000 € Jahresumsatz, darüber Premium-Lizenz.

Vor der Wahl prüfen, ob die Lizenz die gewerbliche Nutzung **und Apps** abdeckt.

## 1. Angaben zum Anbieter (vom Kunden zu liefern)

| Angabe | Wofür |
| --- | --- |
| Name bzw. Firma mit Rechtsform | Impressum, Verantwortlicher |
| Ladungsfähige Anschrift (kein Postfach) | Impressum, Verantwortlicher |
| Vertretungsberechtigte Person(en), z. B. Geschäftsführer | Impressum |
| E-Mail-Adresse und Telefonnummer | Impressum, Kontakt für Datenschutzanfragen |
| Umsatzsteuer-ID oder Wirtschafts-ID, falls vorhanden | Impressum |
| Handelsregister mit Registergericht und Nummer, falls eingetragen | Impressum |
| Inhaltlich verantwortliche Person nach § 18 Abs. 2 MStV (Name, Anschrift) | Impressum |
| Datenschutzbeauftragter, nur falls einer bestellt ist | Datenschutzerklärung |
| Zuständige Datenschutz-Aufsichtsbehörde (nach Sitz des Anbieters) | Datenschutzerklärung, Beschwerderecht |
| Teilnahme an Verbraucherstreitbeilegung: ja/nein | Impressum |
| Speicherdauer der Vermittlungsdaten (siehe Abschnitt 3), vom Kunden festzulegen | Datenschutzerklärung |

## 2. Eingesetzte Dienste

| Dienst | Anbieter, Sitz | Wofür | Welche Daten | Rolle |
| --- | --- | --- | --- | --- |
| **Netlify** | Netlify, Inc., USA | Hosting der Webseite, Server-Funktionen (KI, Anfragen, Admin), Speicher (Netlify Blobs) | IP-Adresse und technische Zugriffsdaten (Server-Logs); Inhalte der Anfragen auf dem Weg zum Bestatter; gespeicherte Vermittlungsdaten (Abschnitt 3) | Auftragsverarbeiter, Übermittlung in die USA |
| **Brevo** | Brevo (Sendinblue SAS), Frankreich | Versand der E-Mails an Bestatter und Nutzer | Name, E-Mail, ggf. Telefon, Wunschtermin, Nachricht, ggf. Bestattungswünsche, Rabattcode | Auftragsverarbeiter |
| **Anthropic** (KI) | Anthropic Ireland, Limited (Vertragspartner für EU-Kunden); Verarbeitung durch Anthropic, PBC, USA | KI-Assistent und Übersetzung von App-Inhalten | Text der Frage, Sprache, gewähltes Land; zu übersetzende App-Texte (keine Personendaten) | Auftragsverarbeiter, Übermittlung in die USA möglich |
| **OpenStreetMap Foundation** | OSMF, Vereinigtes Königreich | Karten (tile.openstreetmap.org), Suche nach Apotheken und Kliniken (Overpass-API), Ortssuche für Bestatter (Nominatim) | IP-Adresse; Standort-Koordinaten (nur nach Freigabe, nur für die Suche); eingegebener Ort bzw. eingegebene Postleitzahl | eigener Verantwortlicher ([Datenschutzerklärung der OSMF](https://osmfoundation.org/wiki/Privacy_Policy)) |
| **Apple App Store / Google Play** | Apple Inc. / Google Ireland Ltd. | Bereitstellung und Updates der App | Store-Konto, Download, ggf. Absturzberichte (wenn der Nutzer sie freigibt) | eigene Verantwortliche |
| **Kooperations-Bestatter** | jeweiliger Partner | Bearbeitung der Anfrage | Anfrage-Daten (siehe Brevo), per E-Mail und ggf. Webhook | eigener Verantwortlicher (im Kooperationsvertrag festhalten) |

**Ohne Datenübermittlung:**

- Tracking, Werbe- und Analyse-Dienste.
- Konten.
- Push-Dienst: Erinnerungen sind lokale Mitteilungen auf dem Gerät.
- Externe Schriften: in der App mitgeliefert, die Webseite nutzt Systemschriften.
- Expo: nur zum Bauen der App, die App sendet zur Laufzeit nichts an Expo.

**Externe Links** öffnen sich im Browser. Ab dann gelten die Datenschutzhinweise der jeweiligen Betreiber:

- DRK, Johanniter, Malteser
- Verbraucherzentrale
- Bundesministerium der Justiz
- Notdienstsuche der Apotheken
- Karten-App für Routen

## 3. Datenflüsse je Funktion

| Funktion | Was passiert | Bleibt auf dem Gerät | Geht an … |
| --- | --- | --- | --- |
| Notruf und Nummern | Antippen öffnet die Telefon-App | – | niemanden (Anruf läuft über den Mobilfunkanbieter) |
| Warnzeichen, Erste-Hilfe-Themen | feste Liste, Links zu Hilfsorganisationen | – | beim Antippen eines Links: Website der Organisation |
| Apotheken- und Kliniksuche | nur nach Standortfreigabe | Standort wird nicht gespeichert | Koordinaten → OSM Overpass; Kartenkacheln → OSM |
| Notfallpass | Angaben inkl. Gesundheitsdaten, Patientenverfügung (Ort, Vollmacht), optional Foto der Verfügung, Bestattungswünsche | **ja, nur dort** | niemanden; nur wenn der Nutzer selbst „Als Text teilen“ wählt |
| Hausapotheke | Checkliste, Ablaufdaten, lokale Erinnerungen | ja | niemanden |
| KI-Assistent | Frage eintippen und senden | – | Frage, Sprache, Land → Netlify → Anthropic. Es wird nichts gespeichert. |
| Übersetzung von App-Inhalten (Vorsorge-Texte, Leistungen der Bestatter) | bei Sprache ≠ Deutsch | Übersetzung nur im Arbeitsspeicher | App-Texte → Netlify → Anthropic (keine Personendaten) |
| Bestatter suchen | Ort/PLZ oder Standort | – | Ort/PLZ und Land → OSM Nominatim; Land → Netlify (Partnerliste) |
| Anfrage an Kooperations-Bestatter | Formular, Einwilligung per Checkbox (nicht vorausgewählt), Bestattungswünsche nur per eigenem Klick | „Meine Anfragen“ (Code, Bestatter, Leistung, Datum) | Anfrage-Daten → Netlify → Brevo (E-Mail an Bestatter und Bestätigung an den Nutzer) und ggf. Webhook an den Bestatter. Auf dem Server gespeichert nur: Code, Bestatter, Leistung, Datum, Status, Auftragswert, Provision. Name, E-Mail, Telefon und Nachricht werden nicht gespeichert. |
| Missbrauchsschutz | höchstens 5 Anfragen pro Stunde | – | täglich wechselnder, nicht umkehrbarer Wert aus der IP-Adresse (die IP selbst wird nicht gespeichert) |
| Anfrage zurückziehen | Code + Geräteschlüssel | – | Netlify (Status „storniert“), E-Mail an den Bestatter über Brevo |
| Admin-Ansicht (nur Betreiber) | Login mit Passwort | – | technisch notwendiges Sitzungs-Cookie, nur unter `/admin` |
| Webseite | Impressum, Datenschutz, App-Beschreibung | – | Server-Logs bei Netlify (IP); keine Cookies, keine Skripte, keine externen Schriften |

**Berechtigungen der App:**

- Standort: nur auf Anfrage, für die Suche.
- Kamera und Fotos: nur für das Foto der Patientenverfügung; das Bild bleibt in der App.
- Mitteilungen: Ablauf-Erinnerungen der Hausapotheke.

**Besondere Kategorien (Art. 9 DSGVO):**

- Der Notfallpass enthält Gesundheitsdaten. Er bleibt nur auf dem Gerät.
- Bestattungswünsche können religiöse Überzeugungen enthalten. Sie gehen nur an den Bestatter, wenn der Nutzer sie selbst an eine Anfrage anhängt. Die Rechtsgrundlage dafür ist die Einwilligung per Checkbox.

## 4. Standardverträge zur Auftragsverarbeitung (AVV/DPA)

| Anbieter | Wo der Vertrag liegt | Hinweis |
| --- | --- | --- |
| **Netlify** | [Netlify DPA (PDF)](https://www.netlify.com/pdf/netlify-dpa.pdf), Überblick: [netlify.com/gdpr-ccpa](https://www.netlify.com/gdpr-ccpa/), [Trust Center](https://www.netlify.com/trust-center/) | Laut Netlify per Verweis Teil der Nutzungsbedingungen, gilt also mit dem Konto. Enthält Standardvertragsklauseln für die Übermittlung in die USA. PDF herunterladen und ablegen. |
| **Brevo** | Am Ende der [Allgemeinen Nutzungsbedingungen](https://www.brevo.com/legal/termsofuse/) (Abschnitt zur Datenverarbeitung); Hilfeartikel „Where can I find the Data Processing Agreement (DPA)?“ im [Brevo Help Center](https://help.brevo.com/hc/en-us/articles/15403782599570) | Gilt mit dem Konto. Aktuelle Fassung beim Anlegen des Kontos speichern. |
| **Anthropic** | [Data Processing Addendum](https://www.anthropic.com/legal/data-processing-addendum), per Verweis Teil der [Commercial Terms](https://www.anthropic.com/legal/commercial-terms) | Gilt für die API-Nutzung mit dem Konto. Für Kunden aus dem EWR ist laut den Commercial Terms Anthropic Ireland, Limited Vertragspartner. Laut Anthropic werden API-Inhalte nicht zum Training genutzt. |

Alle Links wurden am 29.10.2026 aufgerufen (die Brevo-Hilfeseite blockiert automatische Abrufe, die Nutzungsbedingungen waren erreichbar). Vor dem Start die jeweils aktuelle Fassung herunterladen und zu den Unterlagen nehmen.
