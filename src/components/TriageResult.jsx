import { Link } from "react-router-dom";
import { BookOpen, Car, Check, Hospital, Phone, Pill, RotateCcw, Video } from "lucide-react";
import LegalNote from "@/components/LegalNote";
import { LEVELS } from "@/components/triageLevels";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getGuide } from "@/data/firstAidGuides";
import { pick, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Welche Anlaufstellen je Ampelstufe angeboten werden. */
const ACTIONS_BY_LEVEL = {
  rot: [{ labelKey: "action.call112", href: "tel:112", icon: Phone, variant: "emergency" }],
  orange: [
    { labelKey: "action.call116117", href: "tel:116117", icon: Phone, variant: "default" },
    { labelKey: "action.hospital", to: "/hospitals", icon: Hospital, variant: "outline" },
    { labelKey: "action.transport", to: "/transport", icon: Car, variant: "outline" },
  ],
  gelb: [
    { labelKey: "action.tele", to: "/telemedicine", icon: Video, variant: "default" },
    { labelKey: "action.call116117", href: "tel:116117", icon: Phone, variant: "outline" },
    { labelKey: "action.pharmacy", to: "/pharmacy", icon: Pill, variant: "outline" },
  ],
  gruen: [{ labelKey: "action.pharmacy", to: "/pharmacy", icon: Pill, variant: "outline" }],
};

function ActionButton({ label, to, href, icon: Icon, variant }) {
  return (
    <Button asChild size="lg" variant={variant} className="w-full justify-start">
      {href ? (
        <a href={href}>
          <Icon aria-hidden="true" />
          <span className="whitespace-normal text-start">{label}</span>
        </a>
      ) : (
        <Link to={to}>
          <Icon aria-hidden="true" />
          <span className="whitespace-normal text-start">{label}</span>
        </Link>
      )}
    </Button>
  );
}

export default function TriageResult({ flowTitle, result, answers = [], onRestart }) {
  const { t, lang } = useI18n();
  const style = LEVELS[result.level] || LEVELS.gelb;
  const LevelIcon = style.icon;
  const guide = result.guide ? getGuide(result.guide) : null;

  return (
    <section className="animate-rise space-y-5" aria-labelledby="triage-result-title">
      <div className={cn("card-soft border-2 p-5", style.box)} role={result.level === "rot" ? "alert" : undefined}>
        <p className={cn("flex items-center gap-2 font-semibold", style.text)}>
          <LevelIcon className="h-6 w-6" aria-hidden="true" />
          {t(`level.${result.level}`)} · {flowTitle}
        </p>
        <h2 id="triage-result-title" className="mt-2 text-2xl leading-snug">
          {result.title}
        </h2>
        <p className="mt-1 font-semibold">{t(`level.${result.level}Desc`)}</p>
        {result.level === "rot" && (
          <a
            href="tel:112"
            className="pulse-emergency mt-4 flex min-h-[4rem] items-center justify-center gap-3 rounded-2xl bg-emergency text-xl font-bold text-white hover:bg-emergency-dark"
          >
            <Phone className="h-7 w-7" aria-hidden="true" />
            {t("triage.call112Now")}
          </a>
        )}
      </div>

      <div className="card-soft p-5">
        <h3 className="text-lg">{t("triage.reason")}</h3>
        <p className="mt-2">{result.reason}</p>
      </div>

      {result.advice?.length > 0 && (
        <div className="card-soft p-5">
          <h3 className="text-lg">{t("triage.advice")}</h3>
          <ul className="mt-3 space-y-2">
            {result.advice.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className={cn("mt-1 h-5 w-5 shrink-0", style.text)} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-lg">{t("triage.actions")}</h3>
        <div className="grid gap-3">
          {result.action && (
            <ActionButton label={result.action.label} to={result.action.to} href={result.action.href} icon={Phone} variant="default" />
          )}
          {(ACTIONS_BY_LEVEL[result.level] || []).map(({ labelKey, ...action }) => (
            <ActionButton key={labelKey} label={t(labelKey)} {...action} />
          ))}
          {guide && (
            <ActionButton
              label={`${t("action.guide")}: ${pick(guide.title, lang)}`}
              to={`/guides/${guide.slug}`}
              icon={BookOpen}
              variant="outline"
            />
          )}
        </div>
        {result.level === "gruen" && (
          <p className="mt-3 text-muted-foreground">
            <strong className="text-foreground">{t("triage.selfcare")}:</strong> {t("triage.selfcareText")}
          </p>
        )}
      </div>

      {answers.length > 0 && (
        <Accordion type="single" collapsible className="card-soft px-5">
          <AccordionItem value="answers" className="border-0">
            <AccordionTrigger>{t("triage.answers")}</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-3">
                {answers.map((a, i) => (
                  <div key={i}>
                    <dt className="text-sm text-muted-foreground">{a.question}</dt>
                    <dd className="font-semibold">{a.answer}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <LegalNote>{t("triage.resultDisclaimer")}</LegalNote>
      <p className="text-sm text-muted-foreground">{t("triage.saved")}</p>

      <Button size="lg" variant="secondary" className="w-full" onClick={onRestart}>
        <RotateCcw aria-hidden="true" />
        {t("triage.restart")}
      </Button>
    </section>
  );
}
