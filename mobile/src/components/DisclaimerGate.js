import { useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ShieldCheck } from "lucide-react-native";
import BrandMark from "@/components/BrandMark";
import CountryPicker from "@/components/CountryPicker";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import LanguagePicker from "@/components/LanguagePicker";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { H2, Muted, T } from "@/components/ui/Text";
import { suggestedCountry, useDisclaimerAccepted, useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/**
 * Erster Start in zwei Schritten: Hinweis bestätigen, dann Land bestätigen (Vorschlag aus der Geräteregion).
 * Beide Schritte enthalten einen 112-Knopf, damit nichts den Notruf blockiert.
 */
export default function DisclaimerGate() {
  const { t, rtl, country, setCountry, countryConfirmed } = useI18n();
  const [accepted, accept] = useDisclaimerAccepted();
  const [choice, setChoice] = useState(country.code);
  const [suggested] = useState(suggestedCountry);
  const insets = useSafeAreaInsets();
  const step = !accepted ? "disclaimer" : !countryConfirmed ? "country" : null;

  return (
    <Modal visible={step !== null} animationType="fade" onRequestClose={() => {}} statusBarTranslucent>
      <ScrollView
        style={{ direction: rtl ? "rtl" : "ltr", backgroundColor: colors.background }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.top}>
          <BrandMark size={52} />
          <LanguagePicker />
        </View>

        {step === "disclaimer" && (
          <>
            <H2 size="2xl">{t("disclaimer.title")}</H2>
            <T size="lg" weight="semibold">
              {t("disclaimer.text")}
            </T>
            <View style={styles.points}>
              {["disclaimer.point1", "disclaimer.point2", "disclaimer.point3"].map((key) => (
                <View key={key} style={styles.point}>
                  <Icon as={ShieldCheck} color={colors.primary} style={styles.pointIcon} />
                  <T style={styles.flex}>{t(key)}</T>
                </View>
              ))}
            </View>
            <View style={styles.actions}>
              <Button size="lg" icon={Check} label={t("disclaimer.accept")} onPress={accept} />
              <EmergencyCallButton pulse={false} />
            </View>
          </>
        )}

        {step === "country" && (
          <>
            <H2 size="2xl">{t("country.confirmTitle")}</H2>
            <Muted>{t("country.confirmText")}</Muted>
            <CountryPicker value={choice} onChange={setChoice} suggested={suggested} />
            <View style={styles.actions}>
              <Button size="lg" icon={Check} label={t("country.confirm", { country: t(`country.${choice}`) })} onPress={() => setCountry(choice)} />
              <EmergencyCallButton pulse={false} />
            </View>
          </>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, gap: 16 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 },
  points: { gap: 10 },
  point: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  pointIcon: { marginTop: 2 },
  flex: { flex: 1 },
  actions: { gap: 12, marginTop: 8 },
});
