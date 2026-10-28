import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Phone, Sparkles, Users } from "lucide-react-native";
import CprMetronome from "@/components/CprMetronome";
import IconBubble from "@/components/IconBubble";
import LegalNote from "@/components/LegalNote";
import NotFound from "@/components/NotFound";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import StepChecklist from "@/components/StepChecklist";
import TranslationStatus from "@/components/TranslationStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H1, H2, H3, Muted, T } from "@/components/ui/Text";
import { getCategory, getGuide } from "@/data/firstAidGuides";
import { askAssistant, translateGuide } from "@/lib/ai";
import { pick, useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { colors, TAP } from "@/lib/theme";
import { useAiTranslation } from "@/lib/useAiTranslation";

export default function GuideDetail() {
  const { slug } = useLocalSearchParams();
  const { t, lang } = useI18n();
  const source = getGuide(slug);
  if (!source) {
    return (
      <Screen title={t("guides.notFound")}>
        <NotFound title="guides.notFound" text="guides.notFoundText" back={{ to: "/guides", label: "guides.toList" }} />
      </Screen>
    );
  }
  return (
    <Screen title={pick(source.title, lang)}>
      <GuideView key={slug} source={source} />
    </Screen>
  );
}

function GuideView({ source }) {
  const { t, lang } = useI18n();
  const call = useCall();
  const translation = useAiTranslation(source, lang, translateGuide, source.slug);
  const guide = translation.data;
  const category = getCategory(guide.category);
  const steps = Array.isArray(guide.steps) ? guide.steps.filter((s) => s && (s.title || s.text)) : [];
  const [simple, setSimple] = useState({ status: "idle" });

  const explainSimply = async () => {
    setSimple({ status: "loading" });
    try {
      const context = [pick(source.title, "de"), ...source.steps.map((s) => `${s.title}: ${s.text}`)].join("\n");
      const { answer, urgent } = await askAssistant({
        question: "Erkläre diese Erste-Hilfe-Anleitung in sehr einfacher Sprache mit kurzen Sätzen.",
        language: lang,
        context,
      });
      setSimple({ status: "done", answer, urgent });
    } catch {
      setSimple({ status: "error" });
    }
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.row}>
          <IconBubble name={guide.icon} size={56} />
          {category && <Badge label={pick(category.label, lang)} />}
        </View>
        <H1>{pick(guide.title, lang)}</H1>
        {guide.summary ? (
          <Muted size="lg">{guide.summary}</Muted>
        ) : null}
        {guide.forWhom ? (
          <View style={styles.forWhom}>
            <Icon as={Users} size={20} color={colors.primary} style={styles.iconTop} />
            <T style={styles.flex}>
              <T weight="bold">{t("guides.forWhom")}: </T>
              {guide.forWhom}
            </T>
          </View>
        ) : null}
        {translation.needsTranslation && (
          <TranslationStatus status={translation.status} onTranslate={translation.retranslate} onShowOriginal={translation.showOriginal} />
        )}
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

      <View style={styles.section}>
        <H2>{t("guides.steps")}</H2>
        <StepChecklist steps={steps} />
      </View>

      {guide.metronome && <CprMetronome />}

      <Card style={styles.section}>
        <Button variant="secondary" icon={Sparkles} loading={simple.status === "loading"} label={simple.status === "loading" ? t("assistant.thinking") : t("guides.simple")} onPress={explainSimply} />
        <View accessibilityLiveRegion="polite" style={styles.section}>
          {simple.status === "error" && <Notice>{t("assistant.error")}</Notice>}
          {simple.status === "done" && (
            <View style={styles.answer}>
              <H3 color={colors.primary}>{t("guides.simpleTitle")}</H3>
              <T selectable>{simple.answer}</T>
            </View>
          )}
        </View>
        <LegalNote>{t("assistant.disclaimer")}</LegalNote>
      </Card>

      <LegalNote>{t("guides.legal")}</LegalNote>
    </>
  );
}

const styles = StyleSheet.create({
  header: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  forWhom: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: colors.secondary, borderRadius: 12, padding: 12 },
  iconTop: { marginTop: 3 },
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
  answer: { backgroundColor: colors.accent, borderRadius: 12, padding: 14, gap: 4 },
});
