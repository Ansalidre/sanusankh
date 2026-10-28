import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Activity, ChevronRight, Hospital, Stethoscope } from "lucide-react-native";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import IconBubble from "@/components/IconBubble";
import Notice from "@/components/Notice";
import RedFlagCheck, { RedFlagAction } from "@/components/RedFlagCheck";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import TranslationStatus from "@/components/TranslationStatus";
import TriageQuestion from "@/components/TriageQuestion";
import TriageResult from "@/components/TriageResult";
import { Button } from "@/components/ui/Button";
import { Card, cardStyle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, Muted, T } from "@/components/ui/Text";
import { SYMPTOM_FLOWS, getFlow } from "@/data/symptomFlows";
import { translateField, translateFlow } from "@/lib/ai";
import { DEFAULT_COUNTRY } from "@/lib/content";
import { pick, useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { historyStore } from "@/lib/storage";
import { colors } from "@/lib/theme";
import { useAiTranslation } from "@/lib/useAiTranslation";

const translateSummaries = (flows, lang) => translateField("flows", flows, "slug", "summary", lang);

/** „Unsicher“: Bereitschaftsdienst des Landes anrufen – gibt es keinen, zur Kliniksuche. */
function UnsureButton() {
  const { t, oncall } = useI18n();
  const call = useCall();
  if (!oncall) {
    return <Button variant="outline" size="lg" icon={Hospital} label={t("triage.unsureNoOncall")} onPress={() => router.push("/hospitals")} />;
  }
  return <Button variant="outline" size="lg" icon={Stethoscope} label={t("triage.unsure")} onPress={() => call(oncall)} />;
}

/** Ein neuer `run`-Parameter (Startseite „Hilfe starten“) baut den Ablauf neu auf und beginnt von vorn. */
export default function Triage() {
  const { run } = useLocalSearchParams();
  return <TriageFlow key={run ?? "initial"} />;
}

/**
 * Symptom-Check als Zustandsautomat:
 * redflags → (emergency | choose) → interview → result
 */
function TriageFlow() {
  const { t, lang, country } = useI18n();
  const scrollRef = useRef(null);
  const [stage, setStage] = useState("redflags");
  const [flag, setFlag] = useState(null);
  const [flowSlug, setFlowSlug] = useState(null);
  const [path, setPath] = useState([]); // besuchte Knoten-IDs
  const [answers, setAnswers] = useState([]);

  const source = flowSlug ? getFlow(flowSlug) : null;
  const translation = useAiTranslation(source, lang, translateFlow, flowSlug);
  const flow = translation.data;
  const summaries = useAiTranslation(SYMPTOM_FLOWS, lang, translateSummaries, "flow-summaries");

  const restart = () => {
    setStage("redflags");
    setFlag(null);
    setFlowSlug(null);
    setPath([]);
    setAnswers([]);
  };

  // Bei jedem Schritt nach oben scrollen, damit die neue Frage sichtbar ist.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stage, path.length]);

  const onEmergency = (f) => {
    setFlag(f);
    setStage("emergency");
    historyStore.add({
      type: "redflag",
      level: "rot",
      title: pick(f.action.title, lang),
      answers: [{ question: pick(f.question, lang), answer: t("common.yes") }],
    });
  };

  const chooseFlow = (slug) => {
    const f = getFlow(slug);
    setFlowSlug(slug);
    setPath([f.entry]);
    setAnswers([]);
    setStage("interview");
  };

  const answer = (option) => {
    const node = flow.nodes[path[path.length - 1]];
    const nextAnswers = [...answers, { question: node.question, answer: option.label }];
    const next = flow.nodes[option.next];
    setAnswers(nextAnswers);
    setPath([...path, option.next]);
    if (next?.result) {
      setStage("result");
      historyStore.add({
        type: "flow",
        flow: flow.slug,
        level: next.result.level,
        title: `${pick(flow.title, lang)}: ${next.result.title}`,
        answers: nextAnswers,
      });
    }
  };

  const back = () => {
    if (path.length <= 1) {
      setFlowSlug(null);
      setStage("choose");
      return;
    }
    setPath(path.slice(0, -1));
    setAnswers(answers.slice(0, -1));
  };

  const currentId = path[path.length - 1];
  const currentNode = flow?.nodes?.[currentId];

  return (
    <Screen tab emergencyBar={false} scrollRef={scrollRef}>
      <SectionHeader level={1} icon={Activity} title={t("triage.title")} subtitle={t("triage.intro")} />

      {stage !== "emergency" && stage !== "result" && <EmergencyCallButton pulse={false} />}
      {/* Die Symptom-Abläufe sind für das deutsche Gesundheitssystem geschrieben */}
      {country.code !== DEFAULT_COUNTRY && <Notice size="sm">{t("triage.countryNote")}</Notice>}

      {stage === "redflags" && <RedFlagCheck onEmergency={onEmergency} onClear={() => setStage("choose")} />}

      {stage === "emergency" && flag && <RedFlagAction flag={flag} onBack={() => setStage("redflags")} />}

      {stage === "choose" && (
        <View style={styles.gap}>
          <View style={styles.small}>
            <H2>{t("triage.chooseTitle")}</H2>
            <Muted>{t("triage.chooseText")}</Muted>
          </View>
          {lang !== "de" && <TranslationStatus status={summaries.status} showButtons={false} />}
          {SYMPTOM_FLOWS.map((f) => (
            <Pressable
              key={f.slug}
              onPress={() => chooseFlow(f.slug)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.flowCard, pressed && { borderColor: colors.primary, backgroundColor: colors.accent }]}
            >
              <IconBubble name={f.icon} />
              <View style={styles.flex}>
                <T weight="heading" size="lg">
                  {pick(f.title, lang)}
                </T>
                <Muted size="sm">{summaries.status === "translated" ? summaries.data[f.slug] || f.summary : f.summary}</Muted>
              </View>
              <Icon as={ChevronRight} color={colors.mutedForeground} flip />
            </Pressable>
          ))}
          <UnsureButton />
        </View>
      )}

      {stage === "interview" && flow && currentNode?.question && (
        <>
          {translation.needsTranslation && <TranslationStatus status={translation.status} showButtons={false} />}
          <TriageQuestion
            key={currentId}
            title={pick(flow.title, lang)}
            step={path.length}
            question={currentNode.question}
            options={currentNode.options}
            onAnswer={answer}
            onBack={back}
          />
          <UnsureButton />
        </>
      )}

      {stage === "result" && flow && currentNode?.result && (
        <>
          {translation.needsTranslation && <TranslationStatus status={translation.status} showButtons={false} />}
          <TriageResult flowTitle={pick(flow.title, lang)} result={currentNode.result} answers={answers} onRestart={restart} />
        </>
      )}

      {stage === "interview" && flow && !currentNode && (
        <Card style={styles.small} accessibilityRole="alert">
          <T>{t("common.netError")}</T>
          <Button label={t("triage.restart")} onPress={restart} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  small: { gap: 6 },
  flex: { flex: 1, gap: 2 },
  flowCard: { ...cardStyle, flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
});
