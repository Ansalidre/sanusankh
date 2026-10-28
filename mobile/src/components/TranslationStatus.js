import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Languages } from "lucide-react-native";
import Notice from "@/components/Notice";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Muted } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/** Hinweiszeile zum KI-Übersetzungsstatus inkl. Umschalten Original/Übersetzung. */
export default function TranslationStatus({ status, onTranslate, onShowOriginal, showButtons = true }) {
  const { t } = useI18n();

  if (status === "loading") {
    return (
      <View style={styles.row} accessibilityLiveRegion="polite">
        <ActivityIndicator size="small" color={colors.mutedForeground} />
        <Muted size="sm">{t("common.translating")}</Muted>
      </View>
    );
  }
  if (status === "error") {
    return (
      <View style={styles.stack}>
        <Notice size="sm">{t("common.translateError")}</Notice>
        {showButtons && <Button variant="outline" size="sm" icon={Languages} label={t("guides.translate")} onPress={onTranslate} style={styles.start} />}
      </View>
    );
  }
  if (status === "translated") {
    return (
      <View style={styles.stack}>
        <View style={styles.row}>
          <Icon as={Languages} size={16} color={colors.mutedForeground} />
          <Muted size="sm" style={styles.flex}>
            {t("common.machineTranslated")}
          </Muted>
        </View>
        {showButtons && <Button variant="link" size="sm" label={t("guides.showOriginal")} onPress={onShowOriginal} style={styles.start} />}
      </View>
    );
  }
  if (status === "original" && showButtons) {
    return <Button variant="outline" size="sm" icon={Languages} label={t("guides.translate")} onPress={onTranslate} style={styles.start} />;
  }
  return null;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  stack: { gap: 8 },
  start: { alignSelf: "flex-start" },
  flex: { flex: 1 },
});
