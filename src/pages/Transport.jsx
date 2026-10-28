import { Link } from "react-router-dom";
import { Car, Phone, Settings, TriangleAlert } from "lucide-react";
import LegalNote from "@/components/LegalNote";
import NumberCard from "@/components/NumberCard";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { TAXI_FALLBACK } from "@/data/numbers";
import { useI18n } from "@/lib/i18n";
import { prefs } from "@/lib/storage";

export default function Transport() {
  const { t } = useI18n();
  const taxiPhone = prefs.get().taxiPhone;

  return (
    <div className="space-y-8">
      <SectionHeader as="h1" icon={Car} title={t("transport.title")} subtitle={t("transport.intro")} />

      <section className="card-soft border-2 border-emergency bg-emergency-soft p-5" role="note" aria-labelledby="taxi-warning">
        <h2 id="taxi-warning" className="flex items-center gap-2 text-xl text-emergency-dark">
          <TriangleAlert className="h-6 w-6" aria-hidden="true" />
          {t("transport.warningTitle")}
        </h2>
        <p className="mt-2">{t("transport.warningText")}</p>
        <Button asChild size="lg" variant="emergency" className="mt-4 w-full">
          <a href="tel:112">
            <Phone aria-hidden="true" />
            {t("common.call112")}
          </a>
        </Button>
      </section>

      <section className="space-y-3" aria-labelledby="taxi-title">
        <h2 id="taxi-title" className="text-xl">
          {t("transport.taxiTitle")}
        </h2>
        {taxiPhone ? (
          <>
            <p className="text-muted-foreground">{t("transport.taxiText")}</p>
            <NumberCard number={taxiPhone} icon="Phone" label={t("transport.taxiCall")} callLabel={t("common.call")} />
          </>
        ) : (
          <div className="card-soft p-4">
            <p>{t("transport.taxiNone")}</p>
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link to="/settings#taxi">
                <Settings aria-hidden="true" />
                {t("transport.taxiSettings")}
              </Link>
            </Button>
          </div>
        )}
        <NumberCard
          number={TAXI_FALLBACK.number}
          icon="Phone"
          label={t("transport.fallbackTitle")}
          description={t("transport.fallbackText")}
          callLabel={t("common.call")}
        />
      </section>

      <LegalNote>{t("transport.krankenfahrt")}</LegalNote>
    </div>
  );
}
