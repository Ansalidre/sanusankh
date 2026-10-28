import { ExternalLink, Pill, ShoppingBag } from "lucide-react";
import LegalNote from "@/components/LegalNote";
import NearbyFinder from "@/components/NearbyFinder";
import NumberCard from "@/components/NumberCard";
import SectionHeader from "@/components/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PHARMACY_DUTY } from "@/data/numbers";
import { useI18n } from "@/lib/i18n";

export default function Pharmacy() {
  const { t } = useI18n();

  const dutyLink = (
    <Button asChild size="lg" className="w-full">
      <a href={PHARMACY_DUTY.url} target="_blank" rel="noreferrer">
        <ExternalLink aria-hidden="true" />
        {t("pharmacy.dutyLink")}
        <span className="sr-only">({t("common.externalLink")})</span>
      </a>
    </Button>
  );

  return (
    <div className="space-y-8">
      <SectionHeader as="h1" icon={Pill} title={t("pharmacy.title")} subtitle={t("pharmacy.intro")} />

      <section className="card-soft space-y-4 p-5" aria-labelledby="duty-title">
        <h2 id="duty-title" className="text-xl">
          {t("pharmacy.dutyTitle")}
        </h2>
        <p>{t("pharmacy.dutyText")}</p>
        {dutyLink}
        <NumberCard number={PHARMACY_DUTY.phone} icon="Phone" label={t("pharmacy.dutyPhone")} callLabel={t("common.call")} />
      </section>

      <NearbyFinder kind="pharmacy" title={t("pharmacy.nearby")} alternatives={dutyLink} />
      <LegalNote>{t("pharmacy.nearbyNote")}</LegalNote>

      <section className="card-soft flex items-start gap-4 p-5 opacity-80" aria-labelledby="online-title">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <ShoppingBag className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 id="online-title" className="text-lg">
            {t("pharmacy.onlineTitle")}
          </h2>
          <p className="mt-1 text-muted-foreground">{t("pharmacy.onlineText")}</p>
          <Badge variant="outline" className="mt-2">
            {t("common.comingSoon")}
          </Badge>
        </div>
      </section>
    </div>
  );
}
