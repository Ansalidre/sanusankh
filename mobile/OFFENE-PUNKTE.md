# Offene Punkte vor der Veröffentlichung

Die App ist so umgebaut, dass weder eine medizinische Fachprüfung noch eine anwaltliche Prüfung der App nötig sein soll:

- Kein Symptom-Check, keine Auswertung von Eingaben, keine Dringlichkeitsstufen.
- Keine eigenen Erste-Hilfe-Anleitungen, stattdessen Links zu DRK, Johanniter und Malteser.
- Keine Arzneimittel in der Hausapotheke.
- KI ohne Gesundheitsberatung.
- Keine vergüteten Versicherungslinks.

Rechtstexte kommen aus einem Generator. **Einziger Punkt für jemanden mit Rechtskenntnis ist der Kooperationsvertrag mit den Bestattern (Abschnitt 3).**

## 1. Vom Kunden einzurichten bzw. zu liefern

| Was | Hinweis |
| --- | --- |
| Domain | Für Webseite, Server-Adresse der App und Absender der E-Mails. In Netlify verbinden. |
| E-Mail-Postfach unter der Domain | Kontaktadresse für Impressum, Antworten von Nutzern und Bestattern |
| Netlify-Konto | Repository verbinden, Umgebungsvariablen setzen (siehe `../README.md`) |
| Brevo-Konto | Absenderdomain verifizieren (SPF/DKIM), API-Schlüssel nach `BREVO_API_KEY`, Absender nach `MAIL_FROM` |
| Anthropic-Konto | API-Schlüssel nach `ANTHROPIC_API_KEY`, **monatliches Ausgabenlimit** setzen |
| Apple Developer Program | Für eine Firma: D-U-N-S-Nummer (kostenlos, einige Tage Vorlauf) |
| Google Play Console | Bei einem neuen privaten Konto ist vor der Produktion ein geschlossener Test mit mindestens 12 Testern über 14 Tage nötig |
| Expo-Konto | Kostenlos, für die Cloud-Builds |
| Angaben für Impressum und Datenschutzerklärung | Siehe [RECHTSTEXTE-ANGABEN.md](RECHTSTEXTE-ANGABEN.md), Abschnitt 1 |
| Standardverträge zur Auftragsverarbeitung | Netlify, Brevo, Anthropic: gelten mit dem Konto. Aktuelle Fassung herunterladen und ablegen (Links in [RECHTSTEXTE-ANGABEN.md](RECHTSTEXTE-ANGABEN.md), Abschnitt 4). |
| Kooperations-Bestatter | Pflege in der Admin-Ansicht `/admin/` → „Bestatter“: Name, Adresse, Koordinaten, Telefon, Website, Rabatt mit Bedingungen, Leistungen mit Richtpreisen, E-Mail für Anfragen, Provisionsmodell, Vertrag von/bis, Ansprechpartner |
| Logo als Vektordatei (SVG) oder in höherer Auflösung | `assets/brand/` – Icons wurden aus dem 1254-px-JPG erzeugt |
| Store-Screenshots | iPhone und Android |
| Telemedizin-Partner und Online-Apotheke | Derzeit Platzhalter („Demnächst verfügbar“) in `src/app/telemedicine.js` und `src/app/pharmacy.js` |

## 2. Rechtstexte und Store-Angaben (ohne Anwalt)

| Was | Wo |
| --- | --- |
| Impressum und Datenschutzerklärung mit einem Generator erstellen und auf der Webseite einfügen | `impressum/index.html`, `datenschutz/index.html` im Hauptprojekt; Angaben: [RECHTSTEXTE-ANGABEN.md](RECHTSTEXTE-ANGABEN.md) |
| Store-Texte übernehmen (Entwurf) | [STORE-TEXTE.md](STORE-TEXTE.md) |
| Datenschutzangaben in App Store Connect („App-Datenschutz“) und Play Console („Datensicherheit“) | Vorschlag in [STORE-TEXTE.md](STORE-TEXTE.md) |
| Store-Links auf der Webseite eintragen | `index.html` im Hauptprojekt (App-Store-ID nach Anlage der App) |

## 3. Einmal von jemandem mit Rechtskenntnis ansehen lassen: Kooperationsvertrag mit Bestattern

Das ist der einzige Punkt mit Rechtsbezug, den der Generator nicht abdeckt. Ein Mustervertrag für alle Bestatter genügt. Er sollte mindestens regeln:

- **Keine Mehrkosten für Nutzer:** Der Rabatt wird nicht durch Preisaufschläge finanziert. Die App sagt den Nutzern: „Du zahlst dadurch nicht mehr.“
- **Provision:** Höhe (Prozent oder fester Betrag), wann sie fällig wird (Beauftragung) und wie abgerechnet wird.
- **Monatliche Meldepflicht** für eingelöste Codes und Auftragswerte. Pflege in `/admin/` → „Vermittlungen“.
- **Daten aus Anfragen** nur zur Bearbeitung der Anfrage nutzen; Löschung, wenn die Anfrage zurückgezogen wird. Der Bestatter ist für diese Daten eigener Verantwortlicher.
- **Rabatt:** Höhe, Bedingungen und Gültigkeitszeitraum wie in der Admin-Ansicht hinterlegt.
- Laufzeit, Kündigung, Ansprechpartner.

**Provisionshinweis in der App** (direkt über dem Absenden-Knopf, bewusst einfach): „Gut zu wissen: Wenn du diesen Bestatter beauftragst, bekommt SanusAnkh von ihm eine Provision. Du zahlst dadurch nicht mehr.“ In der Bestatter-Liste steht zusätzlich: „Mit ‚Partner‘ gekennzeichnete Bestatter sind Kooperationspartner von SanusAnkh. Beauftragst du einen von ihnen, bekommt SanusAnkh vom Bestatter eine Provision. Das ist keine Empfehlung.“

## 4. Entscheidungen des Kunden

| Was | Stand |
| --- | --- |
| Speicherdauer der Vermittlungsdaten (Code, Bestatter, Leistung, Datum, Status, Auftragswert) | Derzeit unbegrenzt. Frist festlegen (Aufbewahrungspflichten für Abrechnungsunterlagen ggf. mit der Steuerberatung klären) und in der Datenschutzerklärung nennen. |
| Missbrauch mit fremder E-Mail-Adresse | Schutz derzeit: höchstens 5 Anfragen pro Stunde je Herkunft. Optional Bestätigung per E-Mail-Link (Double-Opt-in) nachrüsten. |
| E-Mail-Texte an Bestatter und Nutzer | `../netlify/lib/emails.mjs`; Nutzer-E-Mail auf Deutsch mit kurzem englischem Absatz |
| Ansprache „du“ in der App | Durchgehend „du“, auch im Provisionshinweis |
| Mehrere Admin-Konten, eigener Zugang für Bestatter (Codes einlösen, Auftragswerte melden) | Vorbereitet, nicht umgesetzt (TODO in `../netlify/lib/auth.mjs`, `../src/admin/AdminApp.jsx`) |

## 5. Notrufnummern je Land gegenprüfen

Das sind Sachangaben, keine medizinischen Inhalte. Prüfen gegen die offiziellen Quellen der Länder. Alle Länder stehen in `src/content/countries.json` mit `"reviewed": false`.

| Land | Hinterlegt | Prüfen bzw. ergänzen |
| --- | --- | --- |
| Deutschland | 112, 116117, 110, Giftnotruf je Bundesland, Telefonseelsorge (116 123, 0800 111 0 111), Taxi-Kurzwahl 22456, Apotheken-Notdienst | Gegenprüfung |
| Österreich | 112, 144, 122, 133, 1450, Vergiftungsinformationszentrale, 142, Apothekenruf 1455 | Gegenprüfung |
| Schweiz | 112, 144, 118, 117, Tox Info Suisse 145, Die Dargebotene Hand 143 | ärztlicher Notfalldienst ist kantonal (fehlt) |
| Italien | 112, 118, 115, 113 | Giftnotruf (regional), Krisentelefon, Guardia medica fehlen |
| Frankreich | 112, 15, 18, 17, 3114 | Giftnotruf (regional), Bereitschaftsdienst fehlen |
| Türkei | 112, Giftnotruf 114 | Krisentelefon fehlt |
| Polen | 112, 999, 998, 997, 116 123 | Giftnotruf (regional), Bereitschaftsdienst fehlen |

## 6. Was durch den Umbau weggefallen ist

| Früher offen | Warum es entfällt |
| --- | --- |
| Medizinische Prüfung der Erste-Hilfe-Anleitungen, Symptom-Abläufe und Warnzeichen-Handlungsschritte | Eigene Anleitungen und Abläufe gibt es nicht mehr. Die App verlinkt DRK, Johanniter und Malteser. Die Warnzeichen sind eine allgemeine Liste ohne Handlungsschritte. |
| Medizinische Prüfung der Arzneimittel in der Hausapotheke | Keine Arzneimittel mehr, nur Verbandsmaterial und Hilfsmittel |
| Einstufung als Medizinprodukt (EU-MDR) | Keine Abfrage, keine Auswertung, keine Dringlichkeitsstufen, KI ohne Gesundheitsberatung, Store-Texte ohne medizinische Zweckbestimmung |
| Versicherungsvermittlung (§ 34d GewO) und Werbekennzeichnung bei Sterbegeld-Partnern | Keine Anbieter, keine Vergütung, kein Tracking mehr – nur eine neutrale Erklärung mit Link zur Verbraucherzentrale |
| Anwaltliche Prüfung von Datenschutzerklärung, Impressum und Haftungsausschluss | Generator; feste „Nutzungshinweise“ in der App ohne Platzhalter |
