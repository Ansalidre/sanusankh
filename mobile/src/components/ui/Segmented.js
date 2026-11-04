import { Pressable, StyleSheet, View } from "react-native";
import { T } from "@/components/ui/Text";
import { colors, radius, TAP } from "@/lib/theme";

/** Umschalter mit 2–4 gleich breiten Optionen: [{ value, label }]. */
export function Segmented({ options, value, onChange, accessibilityLabel }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={o.accessibilityLabel || o.label}
            style={({ pressed }) => [styles.option, active && styles.active, pressed && !active && { backgroundColor: colors.accent }]}
          >
            <T weight="semibold" size="sm" align="center" color={active ? colors.primaryForeground : colors.foreground}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, padding: 4, borderRadius: radius.md, backgroundColor: colors.muted },
  option: { flex: 1, minHeight: TAP - 8, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, paddingHorizontal: 8 },
  active: { backgroundColor: colors.primary },
});
