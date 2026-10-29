import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ExternalLink, FileText } from "lucide-react-native";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Muted, T } from "@/components/ui/Text";
import { SITE_URL } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { openExternal } from "@/lib/links";

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

/*
 * Impressum und Datenschutzerklärung stehen nur auf der Webseite (eine Fassung für App und Web,
 * Text aus einem Generator). Die App verlinkt dorthin. Fest in der App stehen nur die Nutzungshinweise.
 */
const WEB_PAGES = {
  impressum: { key: "legal.impressum", path: "/impressum/" },
  datenschutz: { key: "legal.datenschutz", path: "/datenschutz/" },
};

const HINTS = (
  <>
    <H>Kein Medizinprodukt, keine ärztliche Beratung</H>
    <Para>
      SanusAnkh ist kein Medizinprodukt. Die App sammelt Notrufnummern, verweist auf Erste-Hilfe-Informationen anerkannter
      Hilfsorganisationen und hilft, Apotheken und Kliniken zu finden. Sie fragt keine Beschwerden ab, stellt keine Diagnosen,
      bewertet nicht, wie dringend etwas ist, und gibt keine Behandlungs- oder Medikamentenempfehlungen. Sie ersetzt keine
      Untersuchung, Beratung oder Behandlung durch Ärztinnen und Ärzte und keinen Erste-Hilfe-Kurs.
    </Para>
    <H>Im Notfall</H>
    <Para>Bei Lebensgefahr immer sofort den Notruf 112 wählen.</Para>
    <H>KI-Assistent</H>
    <Para>
      Der Assistent beantwortet Fragen zur App, zu Anlaufstellen und zu Vorsorge-Themen. Gesundheitsfragen beantwortet er
      nicht, sondern verweist auf 112, den ärztlichen Bereitschaftsdienst oder die Hausarztpraxis. Antworten und
      Übersetzungen werden automatisch erzeugt und können Fehler enthalten. Im Zweifel gilt der deutsche Originaltext.
    </Para>
    <H>Externe Inhalte</H>
    <Para>
      Für die Inhalte verlinkter Websites (z. B. DRK, Johanniter, Malteser, Notdienstsuche, OpenStreetMap) sind
      ausschließlich deren Betreiber verantwortlich. Telefonnummern und Ortsdaten werden sorgfältig gepflegt, können sich
      aber ändern.
    </Para>
  </>
);

export default function Legal() {
  const { t, lang } = useI18n();
  const { page: slug } = useLocalSearchParams();
  const web = WEB_PAGES[slug];

  if (web) {
    const url = SITE_URL ? `${SITE_URL}${web.path}` : "";
    return (
      <Screen title={t(web.key)}>
        <SectionHeader level={1} icon={FileText} title={t(web.key)} />
        <Card style={styles.body}>
          <T>{t("legal.onWebsite")}</T>
          {url ? (
            <>
              <Button icon={ExternalLink} label={t("legal.open")} accessibilityHint={t("common.externalLink")} onPress={() => openExternal(url)} />
              <Muted size="sm" selectable style={styles.ltr}>
                {url}
              </Muted>
            </>
          ) : (
            <Muted>{t("legal.noUrl")}</Muted>
          )}
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={t("legal.haftung")}>
      <SectionHeader level={1} icon={FileText} title={t("legal.haftung")} />
      {lang !== "de" && <Muted size="sm">{t("legal.germanOnly")}</Muted>}
      <Card style={[styles.body, styles.ltr]}>
        <View style={styles.body}>{HINTS}</View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 8 },
  h: { marginTop: 8 },
  ltr: { direction: "ltr" },
});
