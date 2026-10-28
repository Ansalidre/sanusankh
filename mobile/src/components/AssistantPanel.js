import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MessageCircleQuestion, Send } from "lucide-react-native";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import LegalNote from "@/components/LegalNote";
import Notice from "@/components/Notice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { askAssistant } from "@/lib/ai";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/**
 * KI-Assistent: Frage stellen, Antwort anzeigen, bei Dringlichkeit 112-Hinweis.
 * Übertragen werden nur die Frage, die Sprache, das Land und ggf. `context` (Inhalte der Seite) –
 * niemals Notfallpass-, Vorsorge- oder Hausapotheken-Daten.
 */
export default function AssistantPanel({ context }) {
  const { t, lang, oncall, country } = useI18n();
  const chips = [oncall ? "assistant.chip1" : "assistant.chip1NoOncall", "assistant.chip2", "assistant.chip3"];
  const [question, setQuestion] = useState("");
  const [state, setState] = useState({ status: "idle" });

  const ask = async (text) => {
    const q = text.trim();
    if (!q) return;
    setQuestion(q);
    setState({ status: "loading" });
    try {
      const result = await askAssistant({ question: q, language: lang, country: country.code, context });
      setState({ status: "done", ...result });
    } catch {
      setState({ status: "error" });
    }
  };

  return (
    <Card style={styles.gap}>
      <View style={styles.titleRow}>
        <Icon as={MessageCircleQuestion} color={colors.primary} />
        <H2 style={styles.flex}>{t("assistant.title")}</H2>
      </View>
      <Muted>{t("assistant.intro")}</Muted>

      <TextField
        accessibilityLabel={t("assistant.label")}
        value={question}
        onChangeText={setQuestion}
        maxLength={1000}
        multiline
        placeholder={t("assistant.placeholder")}
      />
      <View style={styles.chips}>
        {chips.map((key) => (
          <Pressable
            key={key}
            onPress={() => ask(t(key))}
            accessibilityRole="button"
            style={({ pressed }) => [styles.chip, pressed && { backgroundColor: colors.accent }]}
          >
            <T size="sm" weight="semibold" color={colors.secondaryForeground}>
              {t(key)}
            </T>
          </Pressable>
        ))}
      </View>
      <Button
        size="lg"
        icon={Send}
        flipIcon
        loading={state.status === "loading"}
        disabled={!question.trim()}
        label={state.status === "loading" ? t("assistant.thinking") : t("assistant.ask")}
        onPress={() => ask(question)}
      />

      <View accessibilityLiveRegion="polite" style={styles.gap}>
        {state.status === "loading" && <Muted>{t("assistant.thinking")}</Muted>}
        {state.status === "error" && <Notice>{t(oncall ? "assistant.error" : "assistant.errorNoOncall")}</Notice>}
        {state.status === "done" && (
          <>
            {state.urgent && <EmergencyCallButton label={t("assistant.urgent")} />}
            <View style={styles.answer}>
              <H3 color={colors.primary}>{t("assistant.answer")}</H3>
              <T selectable>{state.answer}</T>
            </View>
          </>
        )}
      </View>

      <LegalNote>{t("assistant.disclaimer")}</LegalNote>
    </Card>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    maxWidth: "100%",
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  answer: { backgroundColor: colors.accent, borderRadius: 12, padding: 14, gap: 4 },
});
