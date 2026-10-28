import { StyleSheet, View } from "react-native";
import { T } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

/** Nummerierte Liste mit runden Ziffern (z. B. „So arbeitet SanusAnkh“). */
export default function NumberedList({ items, bubble = colors.accent, digit = colors.primary, size = "base" }) {
  return (
    <View style={styles.list}>
      {items.map((text, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.num, { backgroundColor: bubble }]}>
            <T weight="bold" color={digit} align="center">
              {i + 1}
            </T>
          </View>
          <T size={size} style={styles.text}>
            {text}
          </T>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  num: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, paddingTop: 3 },
});
