import { StyleSheet, View } from "react-native";
import { T } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

const VARIANTS = {
  secondary: { bg: colors.secondary, fg: colors.secondaryForeground },
  outline: { bg: "transparent", fg: colors.mutedForeground, border: colors.border },
  emergency: { bg: colors.emergency, fg: "#FFFFFF" },
};

export function Badge({ label, variant = "secondary", style }) {
  const v = VARIANTS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, v.border && { borderWidth: 1.5, borderColor: v.border }, style]}>
      <T size="xs" weight="semibold" color={v.fg}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
});
