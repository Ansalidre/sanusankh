import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { cardStyle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors, TAP } from "@/lib/theme";

/** Eine Frage im Symptom-Interview mit Antwortoptionen. */
export default function TriageQuestion({ title, step, question, options, onAnswer, onBack }) {
  const { t, lang } = useI18n();
  return (
    <View style={styles.gap}>
      <T size="sm" weight="semibold" color={colors.primary}>
        {`${title} · ${t("triage.question", { n: step })}`.toLocaleUpperCase(lang)}
      </T>
      <H2 size="2xl" accessibilityLiveRegion="polite">
        {question}
      </H2>
      <View style={styles.options}>
        {options.map((option, i) => (
          <Pressable
            key={i}
            onPress={() => onAnswer(option)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.option, pressed && { borderColor: colors.primary, backgroundColor: colors.accent }]}
          >
            <T size="lg" weight="semibold" style={styles.flex}>
              {option.label}
            </T>
            <Icon as={ChevronRight} color={colors.mutedForeground} flip />
          </Pressable>
        ))}
      </View>
      <Button variant="ghost" icon={ArrowLeft} flipIcon label={t("common.back")} onPress={onBack} style={styles.start} />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  options: { gap: 12 },
  option: { ...cardStyle, minHeight: TAP + 12, flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  flex: { flex: 1 },
  start: { alignSelf: "flex-start" },
});
