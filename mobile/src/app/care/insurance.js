import { StyleSheet, View } from "react-native";
import { ExternalLink, Info, Umbrella } from "lucide-react-native";
import CareInfo from "@/components/CareInfo";
import LegalNote from "@/components/LegalNote";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { H2, H3, Muted } from "@/components/ui/Text";
import { isActivePartner, providersFor, providerUrl } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { openExternal } from "@/lib/links";
import { colors } from "@/lib/theme";

/**
 * Sterbegeldversicherung: neutrale Erklärung + Partnerangebote aus providers.json.
 * Keine Beratung, keine Tarifvergleiche, keine Empfehlung (auch nicht durch die KI).
 */
export default function Insurance() {
  const { t, country } = useI18n();
  const partners = providersFor(country.code, "insurance").filter((p) => isActivePartner(p));

  return (
    <Screen title={t("care.insurance")} emergencyBar={false}>
      <SectionHeader level={1} icon={Umbrella} title={t("care.insurance")} />
      <CareInfo topic="insurance" />

      <Notice tone={colors.calm} icon={Info}>
        {t("insurance.noAdvice")}
      </Notice>

      <View style={styles.gap}>
        <H2>{t("insurance.offers")}</H2>
        <Muted size="sm">{t("partner.note")}</Muted>
        {partners.map((p) => (
          <Card key={p.id} border={colors.calm.border} style={styles.small}>
            <Badge label={t("partner.offer")} style={styles.badge} />
            <H3>{p.name}</H3>
            {p.website ? (
              <Button
                icon={ExternalLink}
                label={t("insurance.toOffer")}
                accessibilityHint={t("common.externalLink")}
                onPress={() => openExternal(providerUrl(p))}
              />
            ) : null}
          </Card>
        ))}
      </View>

      <LegalNote>{t("care.legal")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  small: { gap: 10 },
  badge: { backgroundColor: colors.ampel.gelb.soft, borderWidth: 1.5, borderColor: colors.ampel.gelb.main },
});
