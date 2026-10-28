import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { BookOpen, Car, Check, Hospital, Phone, Pill, RotateCcw, Video } from "lucide-react-native";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import LegalNote from "@/components/LegalNote";
import { LEVELS } from "@/components/triageLevels";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Collapsible } from "@/components/ui/Collapsible";
import { Icon } from "@/components/ui/Icon";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { getGuide } from "@/data/firstAidGuides";
import { pick, useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";

/**
 * Welche Anlaufstellen je Ampelstufe angeboten werden. `oncall: true` = Nummer des ärztlichen
 * Bereitschaftsdienstes im gewählten Land; gibt es keine, entfällt der Knopf.
 */
const ACTIONS_BY_LEVEL = {
  rot: [{ labelKey: "action.call112", number: "112", icon: Phone, variant: "emergency" }],
  orange: [
    { labelKey: "action.callOncall", oncall: true, icon: Phone, variant: "default" },
    { labelKey: "action.hospital", to: "/hospitals", icon: Hospital, variant: "outline" },
    { labelKey: "action.transport", to: "/transport", icon: Car, variant: "outline" },
  ],
  gelb: [
    { labelKey: "action.tele", to: "/telemedicine", icon: Video, variant: "default" },
    { labelKey: "action.callOncall", oncall: true, icon: Phone, variant: "outline" },
    { labelKey: "action.pharmacy", to: "/pharmacy", icon: Pill, variant: "outline" },
  ],
  gruen: [{ labelKey: "action.pharmacy", to: "/pharmacy", icon: Pill, variant: "outline" }],
};

function ActionButton({ label, to, number, href, icon, variant }) {
  const call = useCall();
  const onPress = () => {
    if (number) call(number);
    else if (href?.startsWith("tel:")) call(href.slice(4));
    else router.push(to);
  };
  return <Button size="lg" variant={variant} icon={icon} label={label} align="start" onPress={onPress} />;
}

export default function TriageResult({ flowTitle, result, answers = [], onRestart }) {
  const { t, lang, oncall } = useI18n();
  const style = LEVELS[result.level] || LEVELS.gelb;
  const actions = (ACTIONS_BY_LEVEL[result.level] || [])
    .filter((a) => !a.oncall || oncall)
    .map(({ oncall: isOncall, ...a }) => (isOncall ? { ...a, number: oncall } : a));
  const levelDesc = result.level === "orange" && !oncall ? "level.orangeDescNoOncall" : `level.${result.level}Desc`;
  const guide = result.guide ? getGuide(result.guide) : null;

  return (
    <View style={styles.gap}>
      <Card tone={style} style={[styles.small, styles.thick]} accessibilityRole={result.level === "rot" ? "alert" : undefined}>
        <View style={styles.row}>
          <Icon as={style.icon} color={style.main} />
          <T weight="semibold" color={style.main} style={styles.flex}>
            {`${t(`level.${result.level}`)} · ${flowTitle}`}
          </T>
        </View>
        <H2 size="2xl">{result.title}</H2>
        <T weight="semibold">{t(levelDesc)}</T>
        {result.level === "rot" && <EmergencyCallButton size="hero" label={t("triage.call112Now")} style={styles.top} />}
      </Card>

      <Card style={styles.small}>
        <H3>{t("triage.reason")}</H3>
        <T>{result.reason}</T>
      </Card>

      {result.advice?.length > 0 && (
        <Card style={styles.small}>
          <H3>{t("triage.advice")}</H3>
          {result.advice.map((item, i) => (
            <View key={i} style={styles.adviceRow}>
              <Icon as={Check} size={20} color={style.main} style={styles.adviceIcon} />
              <T style={styles.flex}>{item}</T>
            </View>
          ))}
        </Card>
      )}

      <View style={styles.small}>
        <H3>{t("triage.actions")}</H3>
        {result.action && <ActionButton label={result.action.label} to={result.action.to} href={result.action.href} icon={Phone} variant="default" />}
        {actions.map(({ labelKey, ...action }) => (
          <ActionButton key={labelKey} label={t(labelKey)} {...action} />
        ))}
        {guide && (
          <ActionButton
            label={`${t("action.guide")}: ${pick(guide.title, lang)}`}
            to={`/guide/${guide.slug}`}
            icon={BookOpen}
            variant="outline"
          />
        )}
        {result.level === "gruen" && (
          <Muted>
            <T weight="bold">{t("triage.selfcare")}: </T>
            {t("triage.selfcareText")}
          </Muted>
        )}
      </View>

      {answers.length > 0 && (
        <Card padded={false} style={styles.collapsible}>
          <Collapsible header={<H3>{t("triage.answers")}</H3>} accessibilityLabel={t("triage.answers")}>
            <View style={styles.small}>
              {answers.map((a, i) => (
                <View key={i}>
                  <Muted size="sm">{a.question}</Muted>
                  <T weight="semibold">{a.answer}</T>
                </View>
              ))}
            </View>
          </Collapsible>
        </Card>
      )}

      <LegalNote>{t("triage.resultDisclaimer")}</LegalNote>
      <Muted size="sm">{t("triage.saved")}</Muted>

      <Button size="lg" variant="secondary" icon={RotateCcw} label={t("triage.restart")} onPress={onRestart} />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 18 },
  small: { gap: 10 },
  thick: { borderWidth: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  top: { marginTop: 6 },
  adviceRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  adviceIcon: { marginTop: 3 },
  collapsible: { paddingHorizontal: 18 },
});
