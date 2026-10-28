import { StyleSheet, View } from "react-native";
import { Hospital } from "lucide-react-native";
import LegalNote from "@/components/LegalNote";
import NearbyFinder from "@/components/NearbyFinder";
import NumberCard from "@/components/NumberCard";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Muted } from "@/components/ui/Text";
import { oncallEntry } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export default function Hospitals() {
  const { t, country } = useI18n();
  const oncall = oncallEntry(country);

  const alternatives = (
    <View style={styles.gap}>
      {oncall && (
        <>
          <Muted>{t("hospitals.altText")}</Muted>
          <NumberCard number={oncall.number} icon="Stethoscope" label={t(`num.${oncall.kind}`)} />
        </>
      )}
      <NumberCard emergency number={country.emergency} icon="Siren" label={t("action.call112")} />
    </View>
  );

  return (
    <Screen title={t("hospitals.title")}>
      <SectionHeader level={1} icon={Hospital} title={t("hospitals.title")} subtitle={t("hospitals.intro")} />
      <LegalNote>{t("hospitals.note")}</LegalNote>
      <NearbyFinder kind="hospital" title={t("hospitals.nearby")} emergencyLabel={t("hospitals.emergency")} alternatives={alternatives} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
});
