import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

/** Eine Frage im Symptom-Interview mit Antwortoptionen. */
export default function TriageQuestion({ title, step, question, options, onAnswer, onBack }) {
  const { t } = useI18n();
  return (
    <section className="animate-rise" aria-labelledby="triage-question">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        {title} · {t("triage.question", { n: step })}
      </p>
      <h2 id="triage-question" className="mt-2 text-2xl leading-snug" aria-live="polite">
        {question}
      </h2>
      <ul className="mt-5 space-y-3">
        {options.map((option, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onAnswer(option)}
              className="card-soft flex min-h-[3.75rem] w-full items-center gap-3 p-4 text-start text-lg font-semibold transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <span className="flex-1">{option.label}</span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" className="mt-4" onClick={onBack}>
        <ArrowLeft className="rtl:rotate-180" aria-hidden="true" />
        {t("common.back")}
      </Button>
    </section>
  );
}
