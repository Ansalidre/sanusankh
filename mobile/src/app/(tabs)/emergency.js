import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight, FlaskConical, Hospital, Siren, Stethoscope } from "lucide-react-native";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import IconBubble from "@/components/IconBubble";
import LegalNote from "@/components/LegalNote";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card, cardStyle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, T } from "@/components/ui/Text";
import { WARNING_SIGNS } from "@/data/warningSigns";
import { findNumber } from "@/lib/content";
import { pick, useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { colors } from "@/lib/theme";

/**
 * Notfall: feste, für alle gleiche Liste allgemeiner Warnzeichen mit 112-Knopf.
 * Die App fragt nichts ab und bewertet keine Eingaben – sie zeigt nur allgemeine Hinweise.
 */
export default function Emergency() {
  const { t, lang, oncall, country } = useI18n();
  const call = useCall();
  const poison = findNumber(country, "poison");

  return (
    <Screen tab emergencyBar={false}>
      <SectionHeader level={1} icon={Siren} title={t("signs.title")} subtitle={t("signs.intro")} />
      <EmergencyCallButton size="hero" />

      <View style={styles.list}>
        {WARNING_SIGNS.map((sign) => (
          <Pressable
            key={sign.id}
            onPress={() => router.push(`/guide/${sign.guide}`)}
            accessibilityRole="link"
            accessibilityHint={t("signs.openInfo")}
            style={({ pressed }) => [styles.item, pressed && { borderColor: colors.primary, backgroundColor: colors.accent }]}
          >
            <IconBubble name={sign.icon} bg={colors.emergencySoft} color={colors.emergency} />
            <T weight="semibold" style={styles.flex}>
              {pick(sign.title, lang)}
            </T>
            <Icon as={ChevronRight} color={colors.mutedForeground} flip />
          </Pressable>
        ))}
      </View>

      <Card style={styles.gap}>
        <H2>{t("signs.otherTitle")}</H2>
        <T>{t("signs.otherText")}</T>
        {oncall ? (
          <Button variant="outline" size="lg" icon={Stethoscope} label={t("action.callOncall", { oncall })} onPress={() => call(oncall)} />
        ) : null}
        <Button variant="outline" size="lg" icon={Hospital} label={t("action.hospital")} onPress={() => router.push("/hospitals")} />
        {poison ? (
          <Button
            variant="outline"
            size="lg"
            icon={FlaskConical}
            label={t("tile.poison")}
            onPress={() => (poison.regions ? router.push("/numbers?focus=poison") : call(poison.number))}
          />
        ) : null}
      </Card>

      <LegalNote>{t("signs.disclaimer")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  gap: { gap: 12 },
  item: { ...cardStyle, flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  flex: { flex: 1 },
});
