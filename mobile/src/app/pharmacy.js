import { StyleSheet, View } from "react-native";
import { ExternalLink, Pill, ShoppingBag } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import LegalNote from "@/components/LegalNote";
import NearbyFinder from "@/components/NearbyFinder";
import NumberCard from "@/components/NumberCard";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { H2, Muted, T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { openExternal } from "@/lib/links";
import { colors } from "@/lib/theme";

export default function Pharmacy() {
  const { t, country } = useI18n();
  const duty = country.pharmacyDuty; // länderspezifisch, siehe src/content/countries.json

  const dutyLink = duty?.url ? (
    <Button
      size="lg"
      icon={ExternalLink}
      label={t("pharmacy.dutyLink")}
      accessibilityHint={t("common.externalLink")}
      onPress={() => openExternal(duty.url)}
    />
  ) : null;

  return (
    <Screen title={t("pharmacy.title")}>
      <SectionHeader level={1} icon={Pill} title={t("pharmacy.title")} subtitle={t("pharmacy.intro")} />

      {duty && (
        <Card style={styles.gap}>
          <H2>{t("pharmacy.dutyTitle")}</H2>
          {dutyLink && <T>{t("pharmacy.dutyText")}</T>}
          {dutyLink}
          {duty.phone && <NumberCard number={duty.phone} icon="Phone" label={t("pharmacy.dutyPhone")} />}
        </Card>
      )}

      <NearbyFinder kind="pharmacy" title={t("pharmacy.nearby")} alternatives={dutyLink} />
      <LegalNote>{t("pharmacy.nearbyNote")}</LegalNote>

      <Card style={[styles.row, styles.dim]}>
        <IconBubble icon={ShoppingBag} bg={colors.muted} color={colors.mutedForeground} />
        <View style={styles.flex}>
          <H2 size="lg">{t("pharmacy.onlineTitle")}</H2>
          <Muted>{t("pharmacy.onlineText")}</Muted>
          <Badge variant="outline" label={t("common.comingSoon")} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  dim: { opacity: 0.85 },
  flex: { flex: 1, gap: 6 },
});
