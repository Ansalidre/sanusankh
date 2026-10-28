import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { BookOpen, ChevronRight, Search } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import TranslationStatus from "@/components/TranslationStatus";
import { Card, cardStyle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Muted, T } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { FIRST_AID_GUIDES, GUIDE_CATEGORIES } from "@/data/firstAidGuides";
import { translateField } from "@/lib/ai";
import { pick, useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { useAiTranslation } from "@/lib/useAiTranslation";

const translateSummaries = (guides, lang) => translateField("guides", guides, "slug", "summary", lang);

export default function Guides() {
  const { t, lang, rtl } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const summaries = useAiTranslation(FIRST_AID_GUIDES, lang, translateSummaries, "guides-summaries");

  const summaryOf = (guide) => (summaries.status === "translated" ? summaries.data[guide.slug] || guide.summary : guide.summary);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return FIRST_AID_GUIDES.filter((g) => category === "all" || g.category === category).filter((g) => {
      if (!q) return true;
      const haystack = [
        ...Object.values(g.title),
        g.summary,
        summaries.status === "translated" ? summaries.data[g.slug] : "",
        ...g.steps.flatMap((s) => [s.title, s.text]),
      ]
        .join(" ")
        .toLocaleLowerCase(lang);
      return haystack.includes(q);
    });
  }, [query, category, lang, summaries]);

  return (
    <Screen tab keyboard>
      <SectionHeader level={1} icon={BookOpen} title={t("guides.title")} subtitle={t("guides.intro")} />

      <View>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder={t("guides.search")}
          accessibilityLabel={t("guides.searchLabel")}
          returnKeyType="search"
          clearButtonMode="while-editing"
          inputStyle={rtl ? { paddingRight: 44 } : { paddingLeft: 44 }}
        />
        <View pointerEvents="none" style={[styles.searchIcon, rtl ? { right: 14 } : { left: 14 }]}>
          <Icon as={Search} size={20} color={colors.mutedForeground} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
        {[{ id: "all", label: null }, ...GUIDE_CATEGORIES].map((c) => {
          const active = category === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCategory(c.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <T size="sm" weight="semibold" color={active ? "#fff" : colors.foreground}>
                {c.id === "all" ? t("guides.all") : pick(c.label, lang)}
              </T>
            </Pressable>
          );
        })}
      </ScrollView>

      {lang !== "de" && <TranslationStatus status={summaries.status} showButtons={false} />}

      {results.length === 0 ? (
        <Card>
          <Muted>{t("guides.none")}</Muted>
        </Card>
      ) : (
        <View style={styles.list}>
          {results.map((guide) => (
            <Pressable
              key={guide.slug}
              onPress={() => router.push(`/guide/${guide.slug}`)}
              accessibilityRole="link"
              style={({ pressed }) => [styles.item, pressed && { borderColor: colors.primary, backgroundColor: colors.accent }]}
            >
              <IconBubble name={guide.icon} />
              <View style={styles.flex}>
                <T weight="heading" size="lg">
                  {pick(guide.title, lang)}
                </T>
                <Muted size="sm">{summaryOf(guide)}</Muted>
              </View>
              <Icon as={ChevronRight} color={colors.mutedForeground} flip />
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchIcon: { position: "absolute", bottom: 16 },
  chipsScroll: { marginHorizontal: -16 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  list: { gap: 12 },
  item: { ...cardStyle, flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  flex: { flex: 1, gap: 4 },
});
