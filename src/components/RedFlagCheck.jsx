import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Phone, Siren } from "lucide-react";
import GuideIcon from "@/components/GuideIcon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RED_FLAGS } from "@/data/redFlags";
import { pick, useI18n } from "@/lib/i18n";

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
    <section aria-labelledby="redflags-title" className="animate-rise">
      <h2 id="redflags-title" className="text-xl">
        {t("triage.redflagsTitle")}
      </h2>
      <p className="mt-1 text-muted-foreground">{t("triage.redflagsText")}</p>

      <div className="mt-4 flex items-center gap-3">
        <Progress value={(index / total) * 100} className="flex-1" aria-hidden="true" />
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">
          {t("triage.progress", { n: index + 1, total })}
        </span>
      </div>

      <div key={flag.id} className="card-soft animate-rise mt-4 p-5">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emergency-soft text-emergency">
          <GuideIcon name={flag.icon} />
        </span>
        <p className="mt-3 font-heading text-xl font-bold leading-snug" aria-live="polite">
          {pick(flag.question, lang)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button size="lg" variant="emergency" onClick={() => onEmergency(flag)}>
            {t("common.yes")}
          </Button>
          <Button size="lg" variant="outline" onClick={no}>
            {t("common.no")}
          </Button>
        </div>
      </div>

      {index > 0 && (
        <Button variant="ghost" className="mt-3" onClick={() => setIndex(index - 1)}>
          <ArrowLeft className="rtl:rotate-180" aria-hidden="true" />
          {t("common.back")}
        </Button>
      )}
    </section>
  );
}

/** Notfall-Handlungsanweisung für ein bestätigtes Warnzeichen. */
export function RedFlagAction({ flag, onBack }) {
  const { t, lang } = useI18n();
  const { action } = flag;
  return (
    <section className="animate-rise space-y-4" aria-labelledby="redflag-action-title" role="alert">
      <div className="card-soft border-2 border-emergency bg-emergency-soft p-5">
        <p className="flex items-center gap-2 font-semibold uppercase tracking-wide text-emergency-dark">
          <Siren className="h-5 w-5" aria-hidden="true" />
          {t("triage.emergencyTitle")}
        </p>
        <h2 id="redflag-action-title" className="mt-1 text-2xl text-emergency-dark">
          {pick(action.title, lang)}
        </h2>
        <a
          href="tel:112"
          className="pulse-emergency mt-4 flex min-h-[4rem] items-center justify-center gap-3 rounded-2xl bg-emergency px-4 text-xl font-bold text-white hover:bg-emergency-dark"
        >
          <Phone className="h-7 w-7" aria-hidden="true" />
          {t("triage.call112Now")}
        </a>
      </div>

      <div className="card-soft p-5">
        <h3 className="text-lg">{t("triage.untilHelp")}</h3>
        <ol className="mt-3 space-y-3">
          {action.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emergency font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5 text-lg leading-snug">{pick(step, lang)}</span>
            </li>
          ))}
        </ol>
      </div>

      {action.guide && (
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link to={`/guides/${action.guide}`}>
            <BookOpen aria-hidden="true" />
            <span className="whitespace-normal">{t("triage.openGuide", { guide: pick(action.guideLabel, lang) })}</span>
          </Link>
        </Button>
      )}

      <Button variant="ghost" className="w-full" onClick={onBack}>
        <ArrowLeft className="rtl:rotate-180" aria-hidden="true" />
        {t("triage.notThis")}
      </Button>
    </section>
  );
}
