import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, BookOpen, Siren } from "lucide-react-native";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import IconBubble from "@/components/IconBubble";
import NumberedList from "@/components/NumberedList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { RED_FLAGS } from "@/data/redFlags";
import { pick, useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/**
 * Schritt 1 des Symptom-Checks: Warnzeichen nacheinander abfragen.
 * `onEmergency(flag)` bei „Ja“, `onClear()` wenn alle mit „Nein“ beantwortet wurden.
 */
export default function RedFlagCheck({ onEmergency, onClear }) {
  const { t, lang } = useI18n();
  const [index, setIndex] = useState(0);
  const flag = RED_FLAGS[index];
  const total = RED_FLAGS.length;

  const no = () => {
    if (index + 1 >= total) onClear();
    else setIndex(index + 1);
  };

  return (
    <View style={styles.gap}>
      <View style={styles.small}>
        <H2>{t("triage.redflagsTitle")}</H2>
        <Muted>{t("triage.redflagsText")}</Muted>
      </View>

      <View style={styles.progressRow}>
        <Progress value={(index / total) * 100} style={styles.flex} />
        <Muted size="sm" weight="semibold">
          {t("triage.progress", { n: index + 1, total })}
        </Muted>
      </View>

      <Card key={flag.id} style={styles.gap}>
        <IconBubble name={flag.icon} bg={colors.emergencySoft} color={colors.emergency} />
        <T weight="heading" size="xl" accessibilityLiveRegion="polite" accessibilityRole="header">
          {pick(flag.question, lang)}
        </T>
        <View style={styles.answers}>
          <Button size="lg" variant="emergency" label={t("common.yes")} onPress={() => onEmergency(flag)} style={styles.flex} />
          <Button size="lg" variant="outline" label={t("common.no")} onPress={no} style={styles.flex} />
        </View>
      </Card>

      {index > 0 && (
        <Button variant="ghost" icon={ArrowLeft} flipIcon label={t("common.back")} onPress={() => setIndex(index - 1)} style={styles.start} />
      )}
    </View>
  );
}

/** Notfall-Handlungsanweisung für ein bestätigtes Warnzeichen. */
export function RedFlagAction({ flag, onBack }) {
  const { t, lang } = useI18n();
  const { action } = flag;
  return (
    <View style={styles.gap} accessibilityRole="alert">
      <Card tone={colors.ampel.rot} border={colors.emergency} style={[styles.gap, styles.thick]}>
        <View style={styles.titleRow}>
          <Icon as={Siren} size={20} color={colors.emergencyDark} />
          <T weight="bold" color={colors.emergencyDark} style={styles.flex}>
            {t("triage.emergencyTitle").toLocaleUpperCase(lang)}
          </T>
        </View>
        <H2 size="2xl" color={colors.emergencyDark}>
          {pick(action.title, lang)}
        </H2>
        <EmergencyCallButton size="hero" label={t("triage.call112Now")} />
      </Card>

      <Card style={styles.gap}>
        <H3>{t("triage.untilHelp")}</H3>
        <NumberedList items={action.steps.map((s) => pick(s, lang))} bubble={colors.emergency} digit="#fff" size="lg" />
      </Card>

      {action.guide && (
        <Button
          size="lg"
          variant="outline"
          icon={BookOpen}
          label={t("triage.openGuide", { guide: pick(action.guideLabel, lang) })}
          onPress={() => router.push(`/guide/${action.guide}`)}
        />
      )}

      <Button variant="ghost" icon={ArrowLeft} flipIcon label={t("triage.notThis")} onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 16 },
  small: { gap: 4 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  answers: { flexDirection: "row", gap: 12 },
  start: { alignSelf: "flex-start" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  thick: { borderWidth: 2 },
});
