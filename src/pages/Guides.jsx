import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Search } from "lucide-react";
import GuideIcon from "@/components/GuideIcon";
import SectionHeader from "@/components/SectionHeader";
import TranslationStatus from "@/components/TranslationStatus";
import { Input } from "@/components/ui/input";
import { FIRST_AID_GUIDES, GUIDE_CATEGORIES } from "@/data/firstAidGuides";
import { translateField } from "@/lib/ai";
import { pick, useI18n } from "@/lib/i18n";
import { useAiTranslation } from "@/lib/useAiTranslation";
import { cn } from "@/lib/utils";

const translateSummaries = (guides, lang) => translateField("guides", guides, "slug", "summary", lang);

export default function Guides() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const summaries = useAiTranslation(FIRST_AID_GUIDES, lang, translateSummaries, "guides-summaries");

  const summaryOf = (guide) =>
    summaries.status === "translated" ? summaries.data[guide.slug] || guide.summary : guide.summary;

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return FIRST_AID_GUIDES.filter((g) => category === "all" || g.category === category).filter((g) => {
      if (!q) return true;
      const haystack = [
        ...Object.values(g.title),
        g.summary,
        summaries.status === "translated" ? summaries.data[g.slug] : "",
        ...g.steps.flatMap((s) => [s.title, s.text]),
      ]
        .join(" ")
        .toLocaleLowerCase(lang);
      return haystack.includes(q);
    });
  }, [query, category, lang, summaries]);

  return (
    <div className="space-y-5">
      <SectionHeader as="h1" icon={BookOpen} title={t("guides.title")} subtitle={t("guides.intro")} />

      <div className="relative">
        <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("guides.search")}
          aria-label={t("guides.searchLabel")}
          className="ps-12"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2" role="group" aria-label={t("guides.searchLabel")}>
          {[{ id: "all", label: null }, ...GUIDE_CATEGORIES].map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "min-h-[2.75rem] whitespace-nowrap rounded-full border-2 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                  active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
                )}
              >
                {c.id === "all" ? t("guides.all") : pick(c.label, lang)}
              </button>
            );
          })}
        </div>
      </div>

      {lang !== "de" && <TranslationStatus status={summaries.status} showButtons={false} />}

      {results.length === 0 ? (
        <p className="card-soft p-5 text-muted-foreground">{t("guides.none")}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((guide) => (
            <li key={guide.slug}>
              <Link
                to={`/guides/${guide.slug}`}
                className="card-soft flex h-full items-start gap-4 p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <GuideIcon name={guide.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-lg font-bold leading-snug">{pick(guide.title, lang)}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{summaryOf(guide)}</span>
                </span>
                <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
