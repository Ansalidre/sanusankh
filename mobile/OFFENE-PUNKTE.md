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
| Partnerverträge Bestatter: Name, Adresse, Koordinaten, Telefon, Website, Logo, Vertrag von/bis, Priorität | `src/content/providers.json` (`type: "funeral"`) |
| Partnerverträge Sterbegeldversicherung: Name, Website, Logo, Vertrag von/bis, Tracking-Parameter | `providers.json` (`type: "insurance"`) |
| Logos der Partner (https-Adresse) | Feld `logo` – die App zeigt Logos derzeit noch nicht an; bei Lieferung ergänzen wir die Anzeige |
| Ersetzen bzw. Löschen der beiden Demo-Anbieter | `providers.json` (`"demo": true`) |
| Telemedizin-Partner und Online-Apotheke (wie bisher Platzhalter) | `src/app/telemedicine.js`, `src/app/pharmacy.js` |
| Logo als Vektordatei (SVG) oder in höherer Auflösung | `assets/brand/` – Icons wurden aus dem 1254-px-JPG erzeugt |
| Freigabe der Ansprache „du“: Der Apotheken-Hinweis lautet in der App „Frag in deiner Apotheke …“ statt „Fragen Sie …“, passend zur übrigen App | `src/locales/*.js`, Schlüssel `cabinet.medHint` |
