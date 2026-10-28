import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Phone, Sparkles, TriangleAlert, Users } from "lucide-react";
import CprMetronome from "@/components/CprMetronome";
import GuideIcon from "@/components/GuideIcon";
import LegalNote from "@/components/LegalNote";
import StepChecklist from "@/components/StepChecklist";
import TranslationStatus from "@/components/TranslationStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategory, getGuide } from "@/data/firstAidGuides";
import { askAssistant, translateGuide } from "@/lib/ai";
import { pick, useI18n } from "@/lib/i18n";
import { useAiTranslation } from "@/lib/useAiTranslation";
import PageNotFound from "@/pages/PageNotFound";

export default function GuideDetail() {
  const { slug } = useParams();
  const source = getGuide(slug);
  if (!source) return <PageNotFound title="guides.notFound" text="guides.notFoundText" back={{ to: "/guides", label: "guides.toList" }} />;
  return <GuideView key={slug} source={source} />;
}

function GuideView({ source }) {
  const { t, lang } = useI18n();
  const translation = useAiTranslation(source, lang, translateGuide, source.slug);
  const guide = translation.data;
  const category = getCategory(guide.category);
  const steps = Array.isArray(guide.steps) ? guide.steps.filter((s) => s && (s.title || s.text)) : [];
  const [simple, setSimple] = useState({ status: "idle" });

  const explainSimply = async () => {
    setSimple({ status: "loading" });
    try {
      const context = [pick(source.title, "de"), ...source.steps.map((s) => `${s.title}: ${s.text}`)].join("\n");
      const { answer, urgent } = await askAssistant({
        question: "Erkläre diese Erste-Hilfe-Anleitung in sehr einfacher Sprache mit kurzen Sätzen.",
        language: lang,
        context,
      });
      setSimple({ status: "done", answer, urgent });
    } catch {
      setSimple({ status: "error" });
    }
  };

  return (
    <article className="space-y-6">
      <Button asChild variant="ghost" className="-ms-3">
        <Link to="/guides">
          <ArrowLeft className="rtl:rotate-180" aria-hidden="true" />
          {t("guides.toList")}
        </Link>
      </Button>

      <header className="animate-rise space-y-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
            <GuideIcon name={guide.icon} className="h-7 w-7" />
          </span>
          {category && <Badge variant="secondary">{pick(category.label, lang)}</Badge>}
        </div>
        <h1 className="text-3xl leading-tight">{pick(guide.title, lang)}</h1>
        {guide.summary && <p className="text-lg text-muted-foreground">{guide.summary}</p>}
        {guide.forWhom && (
          <p className="flex items-start gap-2 rounded-xl bg-secondary p-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong>{t("guides.forWhom")}:</strong> {guide.forWhom}
            </span>
          </p>
        )}
        {translation.needsTranslation && (
          <TranslationStatus
            status={translation.status}
            onTranslate={translation.retranslate}
            onShowOriginal={translation.showOriginal}
          />
        )}
      </header>

      <a
        href="tel:112"
        className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border-2 border-emergency bg-emergency-soft px-4 py-2 font-semibold text-emergency-dark"
      >
        <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
        {t("common.emergencyHint")}
      </a>

      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="mb-3 text-xl">
          {t("guides.steps")}
        </h2>
        <StepChecklist steps={steps} />
      </section>

      {guide.metronome && <CprMetronome />}

      <section className="card-soft space-y-3 p-5">
        <Button variant="secondary" className="w-full" onClick={explainSimply} disabled={simple.status === "loading"}>
          {simple.status === "loading" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
          {simple.status === "loading" ? t("assistant.thinking") : t("guides.simple")}
        </Button>
        <div aria-live="polite">
          {simple.status === "error" && (
            <p className="flex items-start gap-2 rounded-xl bg-ampel-orange-soft p-3 text-ampel-orange" role="alert">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              {t("assistant.error")}
            </p>
          )}
          {simple.status === "done" && (
            <div className="rounded-xl bg-accent p-4">
              <h2 className="text-lg text-primary">{t("guides.simpleTitle")}</h2>
              <p className="mt-1 whitespace-pre-line">{simple.answer}</p>
            </div>
          )}
        </div>
        <LegalNote>{t("assistant.disclaimer")}</LegalNote>
      </section>

      <LegalNote>{t("guides.legal")}</LegalNote>
    </article>
  );
}
