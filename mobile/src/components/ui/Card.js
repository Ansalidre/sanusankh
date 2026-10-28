import { StyleSheet, View } from "react-native";
import { colors, radius, shadow } from "@/lib/theme";

/** Weiche Karte (entspricht `.card-soft` der Web-Version). `tone` färbt Rand und Hintergrund. */
export function Card({ tone, border, padded = true, style, children, ...props }) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        tone && { backgroundColor: tone.soft, borderColor: border ?? tone.main },
        border && !tone && { borderColor: border },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export const cardStyle = {
  backgroundColor: colors.card,
  borderRadius: radius.xl,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow,
};

const styles = StyleSheet.create({
  card: cardStyle,
  padded: { padding: 18 },
});
