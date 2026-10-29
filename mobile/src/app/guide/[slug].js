import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { GraduationCap, Phone } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import LegalNote from "@/components/LegalNote";
import NotFound from "@/components/NotFound";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SourceLinks from "@/components/SourceLinks";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H1, H2, T } from "@/components/ui/Text";
import { getCategory, getGuide } from "@/data/firstAidGuides";
import { pick, useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { colors, TAP } from "@/lib/theme";

/**
 * Erste-Hilfe-Thema: keine eigene Anleitung, sondern Verweis auf die Seiten anerkannter
 * Hilfsorganisationen und der deutliche Hinweis auf 112.
 */
export default function GuideDetail() {
  const { slug } = useLocalSearchParams();
  const { t, lang } = useI18n();
  const call = useCall();
  const guide = getGuide(slug);
  if (!guide) {
    return (
      <Screen title={t("guides.notFound")}>
        <NotFound title="guides.notFound" text="guides.notFoundText" back={{ to: "/guides", label: "guides.toList" }} />
      </Screen>
    );
  }
  const category = getCategory(guide.category);

  return (
    <Screen title={pick(guide.title, lang)}>
      <View style={styles.header}>
        <View style={styles.row}>
          <IconBubble name={guide.icon} size={56} />
          {category && <Badge label={pick(category.label, lang)} />}
        </View>
        <H1>{pick(guide.title, lang)}</H1>
      </View>

      <Pressable
        onPress={() => call("112")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.hint, pressed && { backgroundColor: "#FAD5DB" }]}
      >
        <Icon as={Phone} size={20} color={colors.emergencyDark} />
        <T weight="semibold" color={colors.emergencyDark} style={styles.flex}>
          {t("common.emergencyHint")}
        </T>
      </Pressable>

      <Card style={styles.section}>
        <H2>{t("guides.sourcesTitle")}</H2>
        <T>{t("guides.sourcesText")}</T>
        <SourceLinks links={guide.links} />
      </Card>

      <Notice tone={colors.calm} icon={GraduationCap}>
        {t("guides.course")}
      </Notice>

      <LegalNote>{t("guides.legal")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  hint: {
    minHeight: TAP,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.emergency,
    backgroundColor: colors.emergencySoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  section: { gap: 12 },
});
