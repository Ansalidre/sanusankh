import { Link } from "react-router-dom";
import { BookOpen, Car, FlaskConical, Hospital, IdCard, Pill, ShieldCheck, Stethoscope, Video } from "lucide-react";
import AssistantPanel from "@/components/AssistantPanel";
import QuickTile from "@/components/QuickTile";
import LegalNote from "@/components/LegalNote";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();

  const tiles = [
    { icon: BookOpen, title: t("tile.guides"), subtitle: t("tile.guidesSub"), to: "/guides" },
    { icon: Stethoscope, title: t("tile.oncall"), subtitle: t("tile.oncallSub"), href: "tel:116117" },
    { icon: FlaskConical, title: t("tile.poison"), subtitle: t("tile.poisonSub"), to: "/numbers#giftnotruf" },
    { icon: Pill, title: t("tile.pharmacy"), subtitle: t("tile.pharmacySub"), to: "/pharmacy" },
    { icon: Video, title: t("tile.tele"), subtitle: t("tile.teleSub"), to: "/telemedicine" },
    { icon: Car, title: t("tile.transport"), subtitle: t("tile.transportSub"), to: "/transport" },
    { icon: IdCard, title: t("tile.pass"), subtitle: t("tile.passSub"), to: "/pass" },
    { icon: Hospital, title: t("tile.hospital"), subtitle: t("tile.hospitalSub"), to: "/hospitals" },
  ];

  return (
    <div className="space-y-8">
      <section className="animate-rise overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg sm:p-8">
        <h1 className="text-3xl text-primary-foreground sm:text-4xl">{t("home.heroTitle")}</h1>
        <p className="mt-3 max-w-prose text-lg text-primary-foreground/90">{t("home.heroText")}</p>
        <Button asChild size="lg" variant="secondary" className="mt-6 w-full text-lg sm:w-auto">
          <Link to="/triage">{t("home.start")}</Link>
        </Button>
      </section>

      <section aria-labelledby="quick-title">
        <h2 id="quick-title" className="mb-3 text-xl">
          {t("home.quick")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((tile) => (
            <QuickTile key={tile.title} {...tile} />
          ))}
        </div>
      </section>

      <section className="card-soft p-5" aria-labelledby="how-title">
        <h2 id="how-title" className="flex items-center gap-2 text-xl">
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
          {t("home.howTitle")}
        </h2>
        <ol className="mt-4 space-y-3">
          {["home.how1", "home.how2", "home.how3"].map((key, i) => (
            <li key={key} className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{t(key)}</span>
            </li>
          ))}
        </ol>
        <LegalNote className="mt-4">{t("home.howDisclaimer")}</LegalNote>
      </section>

      <AssistantPanel />
    </div>
  );
}
