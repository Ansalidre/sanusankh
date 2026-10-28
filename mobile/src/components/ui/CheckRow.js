import { Pressable, StyleSheet, View } from "react-native";
import { Check } from "lucide-react-native";
import { Icon } from "@/components/ui/Icon";
import { Muted, T } from "@/components/ui/Text";
import { colors, TAP } from "@/lib/theme";

const GREEN = colors.ampel.gruen;

/** Großes Ankreuzfeld (≥ 52 px) mit Beschriftung und optionalem Hinweis. */
export function CheckRow({ checked, onChange, label, hint, accessibilityLabel }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: Boolean(checked) }}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={hint}
      style={({ pressed }) => [styles.row, checked && styles.checked, pressed && !checked && { backgroundColor: colors.accent }]}
    >
      <View style={[styles.box, checked && { backgroundColor: GREEN.main, borderColor: GREEN.main }]}>
        {checked && <Icon as={Check} size={20} color="#fff" />}
      </View>
      <View style={styles.flex}>
        <T weight="semibold" color={checked ? GREEN.main : colors.foreground}>
          {label}
        </T>
        {hint ? <Muted size="sm">{hint}</Muted> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: TAP,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checked: { backgroundColor: GREEN.soft, borderColor: "#A9D8BF" },
  box: { width: 30, height: 30, borderRadius: 8, borderWidth: 2, borderColor: "#B7CDD3", alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, gap: 2 },
});
