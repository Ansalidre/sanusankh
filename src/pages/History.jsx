import { useState } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import SectionHeader from "@/components/SectionHeader";
import { LEVELS } from "@/components/triageLevels";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useI18n } from "@/lib/i18n";
import { historyStore } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function History() {
  const { t, lang } = useI18n();
  const [list, setList] = useState(() => historyStore.list());
  const [confirm, setConfirm] = useState(false);

  const clear = () => {
    historyStore.clear();
    setList([]);
    toast({ title: t("history.cleared") });
  };

  const formatDate = (iso) => new Date(iso).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <SectionHeader as="h1" icon={HistoryIcon} title={t("history.title")} subtitle={t("history.intro")} />

      {list.length === 0 ? (
        <section className="card-soft flex flex-col items-center p-8 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
            <HistoryIcon className="h-8 w-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl">{t("history.emptyTitle")}</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">{t("history.emptyText")}</p>
          <Button asChild size="lg" className="mt-5 w-full max-w-xs">
            <Link to="/triage">{t("home.start")}</Link>
          </Button>
        </section>
      ) : (
        <>
          <Accordion type="multiple" className="space-y-3">
            {list.map((entry) => {
              const style = LEVELS[entry.level] || LEVELS.gelb;
              return (
                <AccordionItem key={entry.id} value={entry.id} className={cn("card-soft border-s-8 px-4", style.box)}>
                  <AccordionTrigger className="py-4">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn("h-3 w-3 shrink-0 rounded-full", style.dot)} aria-hidden="true" />
                        <span className={cn("text-sm font-semibold", style.text)}>{t(`level.${entry.level}`)}</span>
                        {entry.type === "redflag" && <Badge variant="emergency">{t("history.redflag")}</Badge>}
                      </span>
                      <span className="mt-1 block font-heading text-lg font-bold leading-snug">{entry.title}</span>
                      <span className="block text-sm font-normal text-muted-foreground">{formatDate(entry.date)}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <h3 className="sr-only">{t("history.showAnswers")}</h3>
                    <dl className="space-y-3">
                      {(entry.answers || []).map((a, i) => (
                        <div key={i}>
                          <dt className="text-sm text-muted-foreground">{a.question}</dt>
                          <dd className="font-semibold">{a.answer}</dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <Button variant="outline" size="lg" className="w-full" onClick={() => setConfirm(true)}>
            <Trash2 aria-hidden="true" />
            {t("history.clear")}
          </Button>
        </>
      )}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={t("history.clearTitle")}
        description={t("history.clearText")}
        confirmLabel={t("history.clear")}
        onConfirm={clear}
      />
    </div>
  );
}
