import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Car, Settings, TriangleAlert } from "lucide-react-native";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import LegalNote from "@/components/LegalNote";
import NumberCard from "@/components/NumberCard";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, Muted, T } from "@/components/ui/Text";
import { DEFAULT_COUNTRY } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { prefs } from "@/lib/storage";
import { colors } from "@/lib/theme";

export default function Transport() {
  const { t, country } = useI18n();
  const [taxiPhone, setTaxiPhone] = useState(() => prefs.get().taxiPhone);

  // Nach dem Festlegen in den Einstellungen beim Zurückkommen aktualisieren.
  useFocusEffect(
    useCallback(() => {
      setTaxiPhone(prefs.get().taxiPhone);
    }, []),
  );

  return (
    <Screen title={t("transport.title")}>
      <SectionHeader level={1} icon={Car} title={t("transport.title")} subtitle={t("transport.intro")} />

      <Card tone={colors.ampel.rot} border={colors.emergency} style={[styles.gap, styles.thick]}>
        <View style={styles.row}>
          <Icon as={TriangleAlert} color={colors.emergencyDark} />
          <H2 color={colors.emergencyDark} style={styles.flex}>
            {t("transport.warningTitle")}
          </H2>
        </View>
        <T>{t("transport.warningText")}</T>
        <EmergencyCallButton pulse={false} />
      </Card>

      <View style={styles.gap}>
        <H2>{t("transport.taxiTitle")}</H2>
        {taxiPhone ? (
          <>
            <Muted>{t("transport.taxiText")}</Muted>
            <NumberCard number={taxiPhone} icon="Phone" label={t("transport.taxiCall")} />
          </>
        ) : (
          <Card style={styles.gap}>
            <T>{t("transport.taxiNone")}</T>
            <Button variant="outline" icon={Settings} label={t("transport.taxiSettings")} onPress={() => router.navigate({ pathname: "/more", params: { focus: "taxi" } })} />
          </Card>
        )}
        {country.taxiShortcode && (
          <NumberCard number={country.taxiShortcode} icon="Phone" label={t("transport.fallbackTitle")} description={t("transport.fallbackText")} />
        )}
      </View>

      {/* Krankenfahrt-Regel (Verordnung, Krankenkasse) gilt für Deutschland */}
      {country.code === DEFAULT_COUNTRY && <LegalNote>{t("transport.krankenfahrt")}</LegalNote>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  thick: { borderWidth: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
});
