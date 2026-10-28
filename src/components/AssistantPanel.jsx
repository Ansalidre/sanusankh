import { useState } from "react";
import { LoaderCircle, MessageCircleQuestion, Phone, Send, TriangleAlert } from "lucide-react";
import LegalNote from "@/components/LegalNote";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/lib/ai";
import { useI18n } from "@/lib/i18n";

const CHIPS = ["assistant.chip1", "assistant.chip2", "assistant.chip3"];

/** KI-Assistent: Frage stellen, Antwort anzeigen, bei Dringlichkeit 112-Hinweis. */
export default function AssistantPanel({ context }) {
  const { t, lang } = useI18n();
  const [question, setQuestion] = useState("");
  const [state, setState] = useState({ status: "idle" });

  const ask = async (text) => {
    const q = text.trim();
    if (!q) return;
    setQuestion(q);
    setState({ status: "loading" });
    try {
      const result = await askAssistant({ question: q, language: lang, context });
      setState({ status: "done", ...result });
    } catch {
      setState({ status: "error" });
    }
  };

  return (
    <section className="card-soft p-5" aria-labelledby="assistant-title">
      <h2 id="assistant-title" className="flex items-center gap-2 text-xl">
        <MessageCircleQuestion className="h-6 w-6 text-primary" aria-hidden="true" />
        {t("assistant.title")}
      </h2>
      <p className="mt-1 text-muted-foreground">{t("assistant.intro")}</p>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <Label htmlFor="assistant-question" className="sr-only">
          {t("assistant.label")}
        </Label>
        <Textarea
          id="assistant-question"
          value={question}
          maxLength={1000}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("assistant.placeholder")}
        />
        <div className="flex flex-wrap gap-2">
          {CHIPS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => ask(t(key))}
              className="min-h-[2.75rem] rounded-full border-2 bg-secondary px-4 text-sm font-semibold text-secondary-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {t(key)}
            </button>
          ))}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={state.status === "loading" || !question.trim()}>
          {state.status === "loading" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Send className="rtl:-scale-x-100" aria-hidden="true" />}
          {state.status === "loading" ? t("assistant.thinking") : t("assistant.ask")}
        </Button>
      </form>

      <div aria-live="polite">
        {state.status === "error" && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-ampel-orange-soft p-4 text-ampel-orange" role="alert">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            {t("assistant.error")}
          </p>
        )}
        {state.status === "done" && (
          <div className="mt-4 space-y-3">
            {state.urgent && (
              <a
                href="tel:112"
                className="pulse-emergency flex min-h-[3.5rem] items-center justify-center gap-3 rounded-2xl bg-emergency px-4 text-center text-lg font-bold text-white"
              >
                <Phone className="h-6 w-6 shrink-0" aria-hidden="true" />
                {t("assistant.urgent")}
              </a>
            )}
            <div className="rounded-xl bg-accent p-4">
              <h3 className="text-base text-primary">{t("assistant.answer")}</h3>
              <p className="mt-1 whitespace-pre-line">{state.answer}</p>
            </div>
          </div>
        )}
      </div>

      <LegalNote className="mt-4">{t("assistant.disclaimer")}</LegalNote>
    </section>
  );
}
