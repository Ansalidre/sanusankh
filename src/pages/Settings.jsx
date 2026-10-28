import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Car, Check, ChevronRight, FileText, Hospital, Info, Languages, Phone, Pill, Save, Settings as SettingsIcon, ShieldCheck, Video, History as HistoryIcon } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { LANGUAGES } from "@/data/languages";
import { useI18n } from "@/lib/i18n";
import { prefs } from "@/lib/storage";
import { cn } from "@/lib/utils";

const APP_VERSION = "1.0.0";

function LinkRow({ to, icon: Icon, label }) {
  return (
    <li>
      <Link to={to} className="tap w-full justify-start gap-3 rounded-xl px-3 text-start font-semibold hover:bg-muted">
        <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="flex-1">{label}</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
      </Link>
    </li>
  );
}

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const { hash } = useLocation();
  const [taxi, setTaxi] = useState(() => prefs.get().taxiPhone || "");

  useEffect(() => {
    if (hash === "#taxi") document.getElementById("taxi-phone")?.focus();
  }, [hash]);

  const saveTaxi = (e) => {
    e.preventDefault();
    prefs.set({ taxiPhone: taxi.trim() });
    toast({ title: t("settings.taxiSaved") });
  };

  return (
    <div className="space-y-8">
      <SectionHeader as="h1" icon={SettingsIcon} title={t("settings.title")} />

      <section className="card-soft p-3" aria-labelledby="services-title">
        <h2 id="services-title" className="px-3 pt-2 text-xl">
          {t("settings.services")}
        </h2>
        <ul className="mt-2">
          <LinkRow to="/numbers" icon={Phone} label={t("numbers.title")} />
          <LinkRow to="/pharmacy" icon={Pill} label={t("pharmacy.title")} />
          <LinkRow to="/hospitals" icon={Hospital} label={t("hospitals.title")} />
          <LinkRow to="/telemedicine" icon={Video} label={t("tele.title")} />
          <LinkRow to="/transport" icon={Car} label={t("transport.title")} />
          <LinkRow to="/history" icon={HistoryIcon} label={t("settings.history")} />
        </ul>
      </section>

      <section aria-labelledby="lang-title">
        <SectionHeader icon={Languages} title={t("settings.language")} subtitle={t("settings.languageText")} />
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  lang={l.code}
                  dir={l.dir}
                  aria-pressed={active}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "tap w-full justify-start gap-3 rounded-xl border-2 px-3 text-start font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                    active ? "border-primary bg-accent text-primary" : "bg-card hover:bg-muted",
                  )}
                >
                  <span className="text-xl" aria-hidden="true">
                    {l.flag}
                  </span>
                  <span className="flex-1 truncate">{l.label}</span>
                  {active && <Check className="h-5 w-5" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="taxi" className="card-soft p-5" aria-labelledby="taxi-title">
        <h2 id="taxi-title" className="flex items-center gap-2 text-xl">
          <Car className="h-6 w-6 text-primary" aria-hidden="true" />
          {t("settings.taxi")}
        </h2>
        <form onSubmit={saveTaxi} className="mt-3 space-y-3">
          <Label htmlFor="taxi-phone">{t("settings.taxiText")}</Label>
          <Input
            id="taxi-phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            value={taxi}
            onChange={(e) => setTaxi(e.target.value)}
            placeholder={t("settings.taxiPlaceholder")}
          />
          <Button type="submit" variant="outline" className="w-full">
            <Save aria-hidden="true" />
            {t("common.save")}
          </Button>
        </form>
      </section>

      <section className="card-soft border-ampel-orange/40 bg-ampel-orange-soft p-5" aria-labelledby="hint-title">
        <h2 id="hint-title" className="flex items-center gap-2 text-xl text-ampel-orange">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          {t("settings.hintTitle")}
        </h2>
        <p className="mt-2">{t("settings.hintText")}</p>
      </section>

      <section className="card-soft p-3" aria-labelledby="legal-title">
        <h2 id="legal-title" className="px-3 pt-2 text-xl">
          {t("settings.legal")}
        </h2>
        <ul className="mt-2">
          <LinkRow to="/impressum" icon={FileText} label={t("legal.impressum")} />
          <LinkRow to="/datenschutz" icon={FileText} label={t("legal.datenschutz")} />
          <LinkRow to="/haftungsausschluss" icon={FileText} label={t("legal.haftung")} />
        </ul>
      </section>

      <section className="card-soft p-5" aria-labelledby="about-title">
        <h2 id="about-title" className="flex items-center gap-2 text-xl">
          <Info className="h-6 w-6 text-primary" aria-hidden="true" />
          {t("settings.about")}
        </h2>
        <p className="mt-2">{t("settings.aboutText")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("settings.version", { v: APP_VERSION })}</p>
      </section>
    </div>
  );
}
