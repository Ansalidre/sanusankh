import { StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FileText } from "lucide-react-native";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Muted, T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/* Markiert Platzhalter, die vor der Veröffentlichung ersetzt werden müssen. */
function P({ children }) {
  return <T weight="semibold" color={colors.ampel.gelb.main} style={styles.placeholder}>{` [${children}] `}</T>;
}

/** Rechtstexte sind nur auf Deutsch – immer links-nach-rechts. */
function H({ children }) {
  return (
    <T ltr weight="heading" size="lg" accessibilityRole="header" style={styles.h}>
      {children}
    </T>
  );
}

function Para({ children }) {
  return <T ltr>{children}</T>;
}

const PAGES = {
  impressum: {
    key: "legal.impressum",
    body: (
      <>
        <H>Angaben gemäß § 5 DDG</H>
        <Para>
          <P>Name / Firma</P>
          {"\n"}
          <P>Straße Hausnummer</P>
          {"\n"}
          <P>PLZ Ort</P>
        </Para>
        <H>Kontakt</H>
        <Para>
          Telefon: <P>Telefonnummer</P>
          {"\n"}
          E-Mail: <P>E-Mail-Adresse</P>
        </Para>
        <H>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H>
        <Para>
          <P>Name, Anschrift</P>
        </Para>
        <H>Umsatzsteuer-ID / Register</H>
        <Para>
          <P>falls vorhanden: USt-IdNr., Registergericht, Registernummer</P>
        </Para>
        <H>Verbraucherstreitbeilegung</H>
        <Para>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</Para>
      </>
    ),
  },
  datenschutz: {
    key: "legal.datenschutz",
    body: (
      <>
        <H>1. Verantwortliche Stelle</H>
        <Para>
          <P>Name, Anschrift, E-Mail des Verantwortlichen</P>
        </Para>
        <H>2. Grundsatz: Daten bleiben auf deinem Gerät</H>
        <Para>
          SanusAnkh hat keine Benutzerkonten und keine eigene Datenbank. Notfallpass, Verlauf, Hausapotheke und Einstellungen (auch Sprache und Land) werden
          ausschließlich im lokalen Speicher der App auf deinem Gerät abgelegt. Du kannst sie jederzeit in der App löschen;
          beim Deinstallieren der App werden sie vollständig entfernt. Es findet kein Tracking und keine Analyse deines
          Nutzungsverhaltens statt.
        </Para>
        <H>3. App Store und Google Play</H>
        <Para>
          Die App wird über den App Store (Apple) bzw. Google Play (Google) bereitgestellt. Für die dabei verarbeiteten Daten
          (z. B. Konto beim Store, Download, Absturzberichte, die du dort freigibst) sind die jeweiligen Anbieter
          verantwortlich.
          <P>Verweis auf die Datenschutzhinweise von Apple und Google prüfen</P>
        </Para>
        <H>4. KI-Assistent und Übersetzungen</H>
        <Para>
          Wenn du dem Assistenten eine Frage stellst oder Inhalte in einer anderen Sprache als Deutsch anzeigst, wird der Text (bei Fragen zusätzlich das gewählte Land)
          über unsere Serverfunktion bei
          <P>Hosting-Anbieter, z. B. Netlify, Inc.</P>
          an die Anthropic PBC (USA) übermittelt und dort verarbeitet. Dabei wird technisch bedingt deine IP-Adresse an den
          Hosting-Anbieter übertragen. Gib dort keine Namen oder anderen persönlichen Daten ein.
          <P>Rechtsgrundlage, Auftragsverarbeitungsvertrag, Drittlandübermittlung prüfen</P>
        </Para>
        <H>5. Standortsuche und Karten</H>
        <Para>
          Nur wenn du die Standortfreigabe erteilst, werden deine Koordinaten an die Overpass-API von OpenStreetMap
          gesendet, um Apotheken und Kliniken zu finden. Kartenkacheln werden von tile.openstreetmap.org geladen. Dabei wird
          deine IP-Adresse an die OpenStreetMap Foundation übermittelt. Der Standort wird nicht gespeichert.
        </Para>
        <H>6. Anrufe und externe Seiten</H>
        <Para>
          Beim Antippen einer Telefonnummer öffnet sich die Telefon-App deines Geräts; wir erhalten davon keine Kenntnis.
          Externe Seiten (z. B. die Apotheken-Notdienstsuche) werden im Browser geöffnet und unterliegen den
          Datenschutzhinweisen ihrer Betreiber.
        </Para>
        <H>7. Besonders sensible Angaben (Gesundheitsdaten, Vorsorge)</H>
        <Para>
          Notfallpass, Angaben zur Patientenverfügung (vorhanden ja/nein, Aufbewahrungsort, bevollmächtigte Person), ein
          optionales Foto der Verfügung, Bestattungswünsche und deine Hausapotheke (vorhanden, Haltbarkeitsdaten) werden
          ausschließlich auf deinem Gerät gespeichert. Sie werden weder an uns noch an Anbieter oder an den KI-Assistenten
          übertragen. Weitergegeben werden sie nur, wenn du selbst „Als Text teilen“ wählst oder deine Bestattungswünsche
          per eigenem Klick an eine Anfrage anhängst (Abschnitt 11). Bestattungswünsche erscheinen im Vollbild-Notfallpass
          nur, wenn du das einschaltest.
          <P>TODO: Einordnung nach Art. 9 DSGVO, Rechtsgrundlage und Hinweis zur fehlenden Verschlüsselung des Gerätespeichers juristisch prüfen</P>
        </Para>
        <H>8. Erinnerungen, Kamera und Fotos</H>
        <Para>
          Erinnerungen an Ablaufdaten der Hausapotheke werden als lokale Mitteilungen auf deinem Gerät geplant, ohne Server
          und ohne Push-Dienst. Auf Kamera und Fotos greift die App nur zu, wenn du ein Foto deiner Patientenverfügung
          hinzufügst; das Bild wird in den privaten Speicherbereich der App kopiert.
          <P>TODO: juristisch prüfen</P>
        </Para>
        <H>9. Ortssuche für Bestatter</H>
        <Para>
          Suchst du Bestatter über einen Ort oder eine Postleitzahl, wird dieser Text zusammen mit dem gewählten Land an den
          Dienst Nominatim der OpenStreetMap Foundation übermittelt, um ihn in Koordinaten umzuwandeln.
          <P>TODO: juristisch prüfen</P>
        </Para>
        <H>10. Partnerangebote und Anzeigen</H>
        <Para>
          Als „Anzeige“ oder „Partnerangebot“ gekennzeichnete Einträge stammen von Kooperationspartnern. Öffnest du deren
          Website, enthält der Link Kampagnenparameter (z. B. utm_source=sanusankh), aber keine personenbezogenen Daten.
          Die Website des Partners unterliegt dessen Datenschutzhinweisen. Eine Zählung von Klicks durch SanusAnkh findet
          derzeit nicht statt.
          <P>TODO: Kennzeichnungspflichten (UWG, DDG), Vergütungsmodell und ggf. Versicherungsvermittlung (§ 34d GewO) juristisch prüfen</P>
        </Para>
        <H>11. Anfragen an Kooperations-Bestatter</H>
        <Para>
          Sendest du über die App eine Anfrage an einen als „Partner“ gekennzeichneten Bestatter, übermitteln wir die Angaben
          aus dem Anfrageformular (Name, E-Mail, optional Telefon, Wunschtermin, Nachricht und – nur wenn du sie selbst
          anhängst – deine Bestattungswünsche) an diesen Bestatter, per E-Mail und gegebenenfalls über eine technische
          Schnittstelle (Webhook). Rechtsgrundlage ist deine ausdrückliche Einwilligung, die du vor dem Absenden erteilst und
          jederzeit widerrufen kannst. Andere Daten aus der App (Notfallpass, Patientenverfügung) werden nicht übermittelt.
          Du erhältst eine Bestätigung mit deinem Rabattcode per E-Mail.
        </Para>
        <Para>
          Für den Versand nutzen wir den E-Mail-Dienst Brevo (Frankreich). Die Serverfunktionen laufen bei Netlify (USA);
          dabei kann eine Übermittlung in die USA stattfinden. Auf unserem Server speichern wir zu jeder
          Anfrage nur den Rabattcode, den Bestatter, die gewählte Leistung, das Datum, den Bearbeitungsstand und – vom
          Bestatter gemeldet – den Auftragswert, um unsere Vermittlungsprovision abzurechnen. Name, Telefonnummer, E-Mail und
          Nachricht speichern wir nicht. Zum Schutz vor Missbrauch zählen wir Anfragen kurzzeitig anhand eines täglich
          wechselnden, nicht umkehrbaren Werts, der aus der IP-Adresse gebildet wird; die IP-Adresse selbst wird nicht
          gespeichert. Deine eigenen Anfragen (Code, Bestatter, Leistung, Datum) liegen unter „Meine Anfragen“ nur auf
          deinem Gerät. Ziehst du eine Anfrage zurück, informieren wir den Bestatter.
        </Para>
        <Para>
          SanusAnkh erhält bei einer Beauftragung eine Vermittlungsprovision vom Bestatter. Für dich entstehen dadurch keine
          Mehrkosten. Vertrag und Bezahlung vereinbarst du direkt mit dem Bestatter; für dessen Umgang mit deinen Daten gelten
          seine Datenschutzhinweise.
          <P>
            TODO: juristisch prüfen – genaue Firmenbezeichnung und Anschrift von Brevo und Netlify, Einwilligungstext, Speicherdauer der Vermittlungsdaten (Aufbewahrungsfristen für die
            Abrechnung), Auftragsverarbeitungsverträge mit Brevo und Netlify, Drittlandübermittlung USA (Netlify, z. B. EU-US
            Data Privacy Framework/Standardvertragsklauseln), Rolle des Bestatters als eigener Verantwortlicher, ob
            Bestattungswünsche besondere Kategorien nach Art. 9 DSGVO (religiöse Überzeugungen) betreffen
          </P>
        </Para>
        <H>12. Deine Rechte</H>
        <Para>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch sowie
          das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        </Para>
      </>
    ),
  },
  haftungsausschluss: {
    key: "legal.haftung",
    body: (
      <>
        <H>Keine ärztliche Beratung</H>
        <Para>
          SanusAnkh bietet allgemeine Informationen zur Ersten Hilfe und zur Orientierung im Gesundheitssystem. Die App
          stellt keine Diagnosen, gibt keine Medikamenten- oder Dosierungsempfehlungen und ersetzt keine Untersuchung,
          Beratung oder Behandlung durch Ärztinnen und Ärzte.
        </Para>
        <H>Im Notfall</H>
        <Para>Bei Lebensgefahr immer sofort den Notruf 112 wählen. Verlass dich in einem Notfall nicht auf die App.</Para>
        <H>Einschätzungen und KI-Antworten</H>
        <Para>
          Die Ergebnisse des Symptom-Checks sind vereinfachte Orientierungshilfen. Antworten und Übersetzungen des
          KI-Assistenten werden automatisch erzeugt und können fehlerhaft sein. Im Zweifel gilt der deutsche Originaltext;
          wähle bei Unsicherheit immer die höhere Versorgungsstufe.
        </Para>
        <H>Externe Inhalte</H>
        <Para>
          Für Inhalte externer Websites (z. B. Notdienstsuche, OpenStreetMap) sind ausschließlich deren Betreiber
          verantwortlich. Telefonnummern und Ortsdaten werden sorgfältig gepflegt, können sich aber ändern.
        </Para>
        <H>Haftung</H>
        <Para>
          <P>Haftungsregelung juristisch prüfen lassen</P>
        </Para>
      </>
    ),
  },
};

export default function Legal() {
  const { t, lang } = useI18n();
  const { page: slug } = useLocalSearchParams();
  const page = PAGES[slug] || PAGES.impressum;

  return (
    <Screen title={t(page.key)}>
      <SectionHeader level={1} icon={FileText} title={t(page.key)} />
      <Notice tone={colors.ampel.gelb} size="sm" weight="semibold">
        {t("legal.placeholder")}
      </Notice>
      {lang !== "de" && <Muted size="sm">{t("legal.germanOnly")}</Muted>}
      <Card style={[styles.body, { direction: "ltr" }]}>{page.body}</Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 8 },
  h: { marginTop: 8 },
  placeholder: { backgroundColor: colors.ampel.gelb.soft },
});
