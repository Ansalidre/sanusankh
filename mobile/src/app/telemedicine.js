import { Pressable, StyleSheet, View } from "react-native";
import { Phone, Video } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import NumberCard from "@/components/NumberCard";
import NumberedList from "@/components/NumberedList";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { oncallEntry } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { colors, TAP } from "@/lib/theme";

export default function Telemedicine() {
  const { t, country } = useI18n();
  const call = useCall();
  const oncall = oncallEntry(country);

  return (
    <Screen title={t("tele.title")}>
      <SectionHeader level={1} icon={Video} title={t("tele.title")} subtitle={t("tele.intro")} />

      <Card style={styles.gap}>
        <H2>{t("tele.howTitle")}</H2>
        <NumberedList items={["tele.how1", "tele.how2", "tele.how3", "tele.how4"].map((key) => t(key))} />
      </Card>

      <Card style={styles.gap}>
        <H2>{t("tele.whenTitle")}</H2>
        <T>{t("tele.whenText")}</T>
        <Pressable onPress={() => call("112")} accessibilityRole="button" style={styles.hint}>
          <Icon as={Phone} size={20} color={colors.emergencyDark} />
          <T weight="semibold" color={colors.emergencyDark} style={styles.flex}>
            {t("tele.notFor")}
          </T>
        </Pressable>
      </Card>

      <View style={styles.gap}>
        <H2>{t("tele.partners")}</H2>
        {[1, 2].map((n) => (
          <Card key={n} style={[styles.gap, styles.dashed]}>
            <View style={styles.row}>
              <IconBubble icon={Video} bg={colors.muted} color={colors.mutedForeground} />
              <H3 style={styles.flex}>{t("tele.partner", { n })}</H3>
            </View>
            <Muted>{t("tele.partnerText")}</Muted>
            <Badge variant="outline" label={t("common.comingSoon")} />
          </Card>
        ))}
      </View>

      {oncall && (
        <View style={styles.gap}>
          <T>{t("tele.oncall")}</T>
          <NumberCard number={oncall.number} icon="Stethoscope" label={t(`num.${oncall.kind}`)} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  dashed: { borderStyle: "dashed", borderWidth: 2 },
  hint: {
    minHeight: TAP,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.emergency,
    backgroundColor: colors.emergencySoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
