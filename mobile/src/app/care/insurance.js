import { Info, Umbrella } from "lucide-react-native";
import CareInfo from "@/components/CareInfo";
import LegalNote from "@/components/LegalNote";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/**
 * Sterbegeldversicherung: nur eine neutrale Erklärung mit Link zur Verbraucherzentrale.
 * Keine Anbieter, keine Vergütung, kein Tracking, keine Empfehlung (auch nicht durch die KI).
 */
export default function Insurance() {
  const { t } = useI18n();
  return (
    <Screen title={t("care.insurance")} emergencyBar={false}>
      <SectionHeader level={1} icon={Umbrella} title={t("care.insurance")} />
      <CareInfo topic="insurance" />
      <Notice tone={colors.calm} icon={Info}>
        {t("insurance.noAdvice")}
      </Notice>
      <LegalNote>{t("care.legal")}</LegalNote>
    </Screen>
  );
}
