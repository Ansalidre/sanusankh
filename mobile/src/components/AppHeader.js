import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import BrandMark from "@/components/BrandMark";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import LanguagePicker from "@/components/LanguagePicker";
import { T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/** Kopf der Tab-Seiten: Marke, Sprachwahl und (außer im Symptom-Check) die feste 112-Leiste. */
export default function AppHeader({ emergencyBar = true }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        <Pressable onPress={() => router.navigate("/")} accessibilityRole="link" accessibilityLabel={t("brand.name")} style={styles.brand}>
          <BrandMark size={40} />
          <T weight="heading" size="xl" color={colors.primary} numberOfLines={1} style={styles.name}>
            {t("brand.name")}
          </T>
        </Pressable>
        <LanguagePicker />
      </View>
      {emergencyBar && <EmergencyCallButton style={styles.bar} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, minHeight: 52 },
  name: { flexShrink: 1 },
  bar: { marginTop: 8 },
});
