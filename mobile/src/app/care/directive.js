import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { FileSignature, IdCard } from "lucide-react-native";
import CareInfo from "@/components/CareInfo";
import LegalNote from "@/components/LegalNote";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { H2, T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/** Patientenverfügung, Vorsorgevollmacht, Betreuungsverfügung – Inhalte und Links je Land aus careInfo.json. */
export default function Directive() {
  const { t } = useI18n();
  return (
    <Screen title={t("care.directive")} emergencyBar={false}>
      <SectionHeader level={1} icon={FileSignature} title={t("care.directive")} subtitle={t("care.directiveSub")} />
      <CareInfo topic="directive" />

      <Card tone={colors.calm} border={colors.calm.border} style={styles.gap}>
        <H2 size="lg" color={colors.calm.main}>
          {t("care.inPass")}
        </H2>
        <T>{t("care.inPassText")}</T>
        <Button variant="outline" icon={IdCard} label={t("nav.pass")} onPress={() => router.navigate("/pass")} />
      </Card>

      <View>
        <LegalNote>{t("care.legal")}</LegalNote>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 10 },
});
