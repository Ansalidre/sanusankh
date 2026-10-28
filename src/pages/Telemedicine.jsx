import { Phone, Video } from "lucide-react";
import NumberCard from "@/components/NumberCard";
import SectionHeader from "@/components/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

export default function Telemedicine() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <SectionHeader as="h1" icon={Video} title={t("tele.title")} subtitle={t("tele.intro")} />

      <section className="card-soft p-5" aria-labelledby="tele-how">
        <h2 id="tele-how" className="text-xl">
          {t("tele.howTitle")}
        </h2>
        <ol className="mt-4 space-y-3">
          {["tele.how1", "tele.how2", "tele.how3", "tele.how4"].map((key, i) => (
            <li key={key} className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{t(key)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card-soft p-5" aria-labelledby="tele-when">
        <h2 id="tele-when" className="text-xl">
          {t("tele.whenTitle")}
        </h2>
        <p className="mt-2">{t("tele.whenText")}</p>
        <a
          href="tel:112"
          className="mt-4 flex min-h-[3.25rem] items-center gap-3 rounded-xl border-2 border-emergency bg-emergency-soft px-4 py-2 font-semibold text-emergency-dark"
        >
          <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t("tele.notFor")}
        </a>
      </section>

      <section aria-labelledby="tele-partners">
        <h2 id="tele-partners" className="mb-3 text-xl">
          {t("tele.partners")}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <li key={n} className="card-soft border-dashed p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Video className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg">{t("tele.partner", { n })}</h3>
              </div>
              <p className="mt-2 text-muted-foreground">{t("tele.partnerText")}</p>
              <Badge variant="outline" className="mt-3">
                {t("common.comingSoon")}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <p>{t("tele.oncall")}</p>
        <NumberCard number="116117" icon="Stethoscope" label={t("tile.oncallSub")} callLabel={t("common.call")} />
      </section>
    </div>
  );
}
