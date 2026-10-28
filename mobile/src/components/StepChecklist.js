import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Check, RotateCcw } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { cardStyle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { Muted, T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

const GREEN = colors.ampel.gruen;

/** Abhakbare Schritt-für-Schritt-Liste mit Fortschrittsanzeige. */
export default function StepChecklist({ steps = [] }) {
  const { t } = useI18n();
  const [done, setDone] = useState(() => new Set());
  const total = steps.length;
  const count = done.size;

  const toggle = (index) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  if (total === 0) return null;

  return (
    <View style={styles.gap}>
      <View style={styles.progressRow}>
        <Progress value={(count / total) * 100} color={GREEN.main} style={styles.flex} />
        <Muted size="sm" weight="semibold" accessibilityLiveRegion="polite">
          {t("guides.progress", { done: count, total })}
        </Muted>
      </View>

      {steps.map((step, index) => {
        const checked = done.has(index);
        return (
          <Pressable
            key={index}
            onPress={() => toggle(index)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={`${index + 1}. ${step.title}. ${step.text}`}
            style={({ pressed }) => [
              styles.step,
              checked && { backgroundColor: GREEN.soft, borderColor: "#A9D8BF" },
              pressed && !checked && { backgroundColor: colors.accent },
            ]}
          >
            <View style={[styles.num, checked ? { backgroundColor: GREEN.main, borderColor: GREEN.main } : null]}>
              {checked ? (
                <Icon as={Check} size={20} color="#fff" />
              ) : (
                <T weight="heading" size="lg" color={colors.primary} align="center">
                  {index + 1}
                </T>
              )}
            </View>
            <View style={styles.flex}>
              <T weight="heading" size="lg" color={checked ? GREEN.main : colors.foreground}>
                {step.title}
              </T>
              <T style={styles.text}>{step.text}</T>
            </View>
          </Pressable>
        );
      })}

      {count > 0 && <Button variant="ghost" icon={RotateCcw} label={t("guides.reset")} onPress={() => setDone(new Set())} style={styles.start} />}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  flex: { flex: 1 },
  step: { ...cardStyle, flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16 },
  num: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#B7CDD3",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { marginTop: 4 },
  start: { alignSelf: "flex-start" },
});
