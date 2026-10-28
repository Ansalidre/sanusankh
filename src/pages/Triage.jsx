import { useState } from "react";
import { Activity, ChevronRight, Phone, Stethoscope } from "lucide-react";
import GuideIcon from "@/components/GuideIcon";
import RedFlagCheck, { RedFlagAction } from "@/components/RedFlagCheck";
import SectionHeader from "@/components/SectionHeader";
import TranslationStatus from "@/components/TranslationStatus";
import TriageQuestion from "@/components/TriageQuestion";
import TriageResult from "@/components/TriageResult";
import { Button } from "@/components/ui/button";
import { SYMPTOM_FLOWS, getFlow } from "@/data/symptomFlows";
import { translateField, translateFlow } from "@/lib/ai";
import { pick, useI18n } from "@/lib/i18n";
import { historyStore } from "@/lib/storage";
import { useAiTranslation } from "@/lib/useAiTranslation";

const translateSummaries = (flows, lang) => translateField("flows", flows, "slug", "summary", lang);

function UnsureButton() {
  const { t } = useI18n();
  return (
    <Button asChild variant="outline" size="lg" className="w-full">
      <a href="tel:116117">
        <Stethoscope aria-hidden="true" />
        <span className="whitespace-normal">{t("triage.unsure")}</span>
      </a>
    </Button>
  );
}

/**
 * Symptom-Check als Zustandsautomat:
 * redflags → (emergency | choose) → interview → result
 */
export default function Triage() {
  const { t, lang } = useI18n();
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
    <div className="space-y-6">
      <SectionHeader as="h1" icon={Activity} title={t("triage.title")} subtitle={t("triage.intro")} />

      {stage !== "emergency" && stage !== "result" && (
        <a
          href="tel:112"
          className="flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-emergency px-4 font-bold text-white hover:bg-emergency-dark"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          {t("common.call112")}
        </a>
      )}

      {stage === "redflags" && <RedFlagCheck onEmergency={onEmergency} onClear={() => setStage("choose")} />}

      {stage === "emergency" && flag && <RedFlagAction flag={flag} onBack={() => setStage("redflags")} />}

      {stage === "choose" && (
        <section className="animate-rise space-y-4" aria-labelledby="choose-title">
          <div>
            <h2 id="choose-title" className="text-xl">
              {t("triage.chooseTitle")}
            </h2>
            <p className="mt-1 text-muted-foreground">{t("triage.chooseText")}</p>
          </div>
          {lang !== "de" && <TranslationStatus status={summaries.status} showButtons={false} />}
          <ul className="grid gap-3 sm:grid-cols-2">
            {SYMPTOM_FLOWS.map((f) => (
              <li key={f.slug}>
                <button
                  type="button"
                  onClick={() => chooseFlow(f.slug)}
                  className="card-soft flex h-full w-full items-start gap-4 p-4 text-start transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                    <GuideIcon name={f.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-lg font-bold">{pick(f.title, lang)}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {summaries.status === "translated" ? summaries.data[f.slug] || f.summary : f.summary}
                    </span>
                  </span>
                  <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <UnsureButton />
        </section>
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
        <div className="card-soft space-y-3 p-5" role="alert">
          <p>{t("common.netError")}</p>
          <Button onClick={restart}>{t("triage.restart")}</Button>
        </div>
      )}
    </div>
  );
}
