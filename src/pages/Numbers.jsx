import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FlaskConical, HeartHandshake, Phone } from "lucide-react";
import NumberCard from "@/components/NumberCard";
import SectionHeader from "@/components/SectionHeader";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRISIS_NUMBERS, EMERGENCY_NUMBER, NATIONAL_NUMBERS, POISON_BY_STATE } from "@/data/numbers";
import { pick, useI18n } from "@/lib/i18n";
import { prefs } from "@/lib/storage";

export default function Numbers() {
  const { t, lang } = useI18n();
  const { hash } = useLocation();
  const [state, setState] = useState(() => prefs.get().poisonState || "");
  const poison = POISON_BY_STATE.find((p) => p.state === state);

  useEffect(() => {
    if (hash === "#giftnotruf") {
      document.getElementById("giftnotruf")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  const chooseState = (value) => {
    setState(value);
    prefs.set({ poisonState: value });
  };

  return (
    <div className="space-y-8">
      <SectionHeader as="h1" icon={Phone} title={t("numbers.title")} subtitle={t("numbers.intro")} />

      <section aria-labelledby="emergency-title">
        <h2 id="emergency-title" className="mb-3 text-xl">
          {t("numbers.emergency")}
        </h2>
        <NumberCard
          emergency
          number={EMERGENCY_NUMBER.number}
          icon={EMERGENCY_NUMBER.icon}
          label={pick(EMERGENCY_NUMBER.label, lang)}
          description={pick(EMERGENCY_NUMBER.description, lang)}
          callLabel={t("common.call")}
        />
      </section>

      <section aria-labelledby="national-title">
        <h2 id="national-title" className="mb-3 text-xl">
          {t("numbers.national")}
        </h2>
        <div className="grid gap-3">
          {NATIONAL_NUMBERS.filter((n) => n.number).map((n) => (
            <NumberCard
              key={n.id}
              number={n.number}
              icon={n.icon}
              label={pick(n.label, lang)}
              description={pick(n.description, lang)}
              callLabel={t("common.call")}
            />
          ))}
        </div>
      </section>

      <section id="giftnotruf" aria-labelledby="poison-title" className="scroll-mt-48">
        <SectionHeader icon={FlaskConical} title={t("numbers.poisonTitle")} subtitle={t("numbers.poisonText")} />
        <div className="space-y-3">
          <Label htmlFor="poison-state">{t("numbers.selectState")}</Label>
          <Select value={state || undefined} onValueChange={chooseState}>
            <SelectTrigger id="poison-state">
              <SelectValue placeholder={t("numbers.selectState")} />
            </SelectTrigger>
            <SelectContent>
              {POISON_BY_STATE.map((p) => (
                <SelectItem key={p.state} value={p.state}>
                  {p.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {poison && (
            <NumberCard
              number={poison.phone}
              icon="FlaskConical"
              label={t("numbers.poisonCenter", { city: poison.city })}
              description={pick(NATIONAL_NUMBERS.find((n) => n.id === "gift").label, lang)}
              callLabel={t("common.call")}
            />
          )}
        </div>
      </section>

      <section aria-labelledby="crisis-title">
        <SectionHeader icon={HeartHandshake} title={t("numbers.crisisTitle")} subtitle={t("numbers.crisisText")} />
        <div className="grid gap-3">
          {CRISIS_NUMBERS.map((n) => (
            <NumberCard
              key={n.id}
              number={n.number}
              icon={n.icon}
              label={pick(n.label, lang)}
              description={pick(n.description, lang)}
              callLabel={t("common.call")}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t("numbers.free")}</p>
      </section>
    </div>
  );
}
