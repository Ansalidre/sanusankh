import { StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";

export function Progress({ value = 0, color = colors.primary, style }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, style]} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: 999, backgroundColor: colors.secondary, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
});
