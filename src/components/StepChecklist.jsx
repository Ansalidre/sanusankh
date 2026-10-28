import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Progress value={(count / total) * 100} className="flex-1" aria-label={t("guides.progress", { done: count, total })} />
        <span className="shrink-0 text-sm font-semibold text-muted-foreground" aria-live="polite">
          {t("guides.progress", { done: count, total })}
        </span>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const checked = done.has(index);
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={checked}
                aria-label={checked ? t("guides.stepDone", { n: index + 1 }) : undefined}
                className={cn(
                  "card-soft flex w-full items-start gap-4 p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                  checked && "border-ampel-gruen/40 bg-ampel-gruen-soft",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-heading text-lg font-bold",
                    checked ? "border-ampel-gruen bg-ampel-gruen text-white" : "border-primary/30 text-primary",
                  )}
                  aria-hidden="true"
                >
                  {checked ? <Check className="h-5 w-5" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block font-heading text-lg font-bold leading-snug", checked && "text-ampel-gruen")}>
                    {step.title}
                  </span>
                  <span className="mt-1 block text-base leading-relaxed text-foreground/90">{step.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {count > 0 && (
        <Button variant="ghost" className="mt-3" onClick={() => setDone(new Set())}>
          <RotateCcw aria-hidden="true" />
          {t("guides.reset")}
        </Button>
      )}
    </div>
  );
}
