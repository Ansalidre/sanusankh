import { useLocation } from "react-router-dom";
import { FileText, TriangleAlert } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useI18n } from "@/lib/i18n";

/* Markiert Platzhalter, die vor der Veröffentlichung ersetzt werden müssen. */
function P({ children }) {
  return <mark className="rounded bg-ampel-gelb-soft px-1 font-semibold text-ampel-gelb">[{children}]</mark>;
}

const PAGES = {
  "/impressum": {
    key: "legal.impressum",
    body: (
      <>
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          <P>Name / Firma</P>
          <br />
          <P>Straße Hausnummer</P>
          <br />
          <P>PLZ Ort</P>
        </p>
        <h2>Kontakt</h2>
        <p>
          Telefon: <P>Telefonnummer</P>
          <br />
          E-Mail: <P>E-Mail-Adresse</P>
        </p>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          <P>Name, Anschrift</P>
        </p>
        <h2>Umsatzsteuer-ID / Register</h2>
        <p>
          <P>falls vorhanden: USt-IdNr., Registergericht, Registernummer</P>
        </p>
        <h2>Verbraucherstreitbeilegung</h2>
        <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </>
    ),
  },
  "/datenschutz": {
    key: "legal.datenschutz",
    body: (
      <>
        <h2>1. Verantwortliche Stelle</h2>
        <p>
          <P>Name, Anschrift, E-Mail des Verantwortlichen</P>
        </p>
        <h2>2. Grundsatz: Daten bleiben auf deinem Gerät</h2>
        <p>
          SanusAnkh hat keine Benutzerkonten und keine eigene Datenbank. Notfallpass, Verlauf und Einstellungen werden
          ausschließlich im lokalen Speicher (localStorage) deines Browsers abgelegt. Du kannst sie jederzeit in der App oder
          über die Browser-Einstellungen löschen.
        </p>
        <h2>3. Hosting</h2>
        <p>
          Die App wird bei <P>Hosting-Anbieter, z. B. Netlify, Inc.</P> betrieben. Beim Aufruf werden technisch notwendige
          Daten (IP-Adresse, Zeitpunkt, abgerufene Datei) in Server-Logs verarbeitet (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
        <h2>4. KI-Assistent und Übersetzungen</h2>
        <p>
          Wenn du dem Assistenten eine Frage stellst oder eine Übersetzung anforderst, wird der Text über unsere
          Serverfunktion an die Anthropic PBC (USA) übermittelt und dort verarbeitet. Gib dort keine Namen oder anderen
          persönlichen Daten ein. <P>Rechtsgrundlage, Auftragsverarbeitungsvertrag, Drittlandübermittlung prüfen</P>
        </p>
        <h2>5. Standortsuche und Karten</h2>
        <p>
          Nur wenn du die Standortfreigabe erteilst, werden deine Koordinaten an die Overpass-API von OpenStreetMap
          gesendet, um Apotheken und Kliniken zu finden. Kartenkacheln werden von tile.openstreetmap.org geladen. Dabei wird
          deine IP-Adresse an die OpenStreetMap Foundation übermittelt.
        </p>
        <h2>6. Schriftarten</h2>
        <p>
          Schriftarten werden von Google Fonts geladen; dabei wird deine IP-Adresse an Google übermittelt.
          <P>Empfehlung: Schriftarten vor Veröffentlichung selbst hosten und diesen Abschnitt anpassen</P>
        </p>
        <h2>7. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch sowie
          das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        </p>
      </>
    ),
  },
  "/haftungsausschluss": {
    key: "legal.haftung",
    body: (
      <>
        <h2>Keine ärztliche Beratung</h2>
        <p>
          SanusAnkh bietet allgemeine Informationen zur Ersten Hilfe und zur Orientierung im Gesundheitssystem. Die App
          stellt keine Diagnosen, gibt keine Medikamenten- oder Dosierungsempfehlungen und ersetzt keine Untersuchung,
          Beratung oder Behandlung durch Ärztinnen und Ärzte.
        </p>
        <h2>Im Notfall</h2>
        <p>Bei Lebensgefahr immer sofort den Notruf 112 wählen. Verlass dich in einem Notfall nicht auf die App.</p>
        <h2>Einschätzungen und KI-Antworten</h2>
        <p>
          Die Ergebnisse des Symptom-Checks sind vereinfachte Orientierungshilfen. Antworten und Übersetzungen des
          KI-Assistenten werden automatisch erzeugt und können fehlerhaft sein. Im Zweifel gilt der deutsche Originaltext;
          wähle bei Unsicherheit immer die höhere Versorgungsstufe.
        </p>
        <h2>Externe Inhalte</h2>
        <p>
          Für Inhalte externer Websites (z. B. Notdienstsuche, OpenStreetMap) sind ausschließlich deren Betreiber
          verantwortlich. Telefonnummern und Ortsdaten werden sorgfältig gepflegt, können sich aber ändern.
        </p>
        <h2>Haftung</h2>
        <p>
          <P>Haftungsregelung juristisch prüfen lassen</P>
        </p>
      </>
    ),
  },
};

export default function Legal() {
  const { t, lang } = useI18n();
  const { pathname } = useLocation();
  const page = PAGES[pathname] || PAGES["/impressum"];

  return (
    <article className="space-y-5">
      <SectionHeader as="h1" icon={FileText} title={t(page.key)} />
      <p className="flex items-start gap-2 rounded-xl bg-ampel-gelb-soft p-3 text-sm font-semibold text-ampel-gelb">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {t("legal.placeholder")}
      </p>
      {lang !== "de" && <p className="text-sm text-muted-foreground">{t("legal.germanOnly")}</p>}
      <div lang="de" dir="ltr" className="card-soft space-y-3 p-5 [&_h2]:mt-4 [&_h2]:text-lg first:[&_h2]:mt-0">
        {page.body}
      </div>
    </article>
  );
}
