import { Hospital } from "lucide-react";
import LegalNote from "@/components/LegalNote";
import NearbyFinder from "@/components/NearbyFinder";
import NumberCard from "@/components/NumberCard";
import SectionHeader from "@/components/SectionHeader";
import { useI18n } from "@/lib/i18n";

export default function Hospitals() {
  const { t } = useI18n();

  const alternatives = (
    <div className="space-y-3">
      <p className="text-muted-foreground">{t("hospitals.altText")}</p>
      <NumberCard number="116117" icon="Stethoscope" label={t("tile.oncallSub")} callLabel={t("common.call")} />
      <NumberCard emergency number="112" icon="Siren" label={t("action.call112")} callLabel={t("common.call")} />
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader as="h1" icon={Hospital} title={t("hospitals.title")} subtitle={t("hospitals.intro")} />
      <LegalNote>{t("hospitals.note")}</LegalNote>
      <NearbyFinder
        kind="hospital"
        title={t("hospitals.nearby")}
        emergencyLabel={t("hospitals.emergency")}
        alternatives={alternatives}
      />
    </div>
  );
}
