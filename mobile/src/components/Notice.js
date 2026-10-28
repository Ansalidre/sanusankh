import { StyleSheet, View } from "react-native";
import { TriangleAlert } from "lucide-react-native";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

/** Farbiger Hinweis (Standard: orange Warnung). */
export default function Notice({ children, tone = colors.ampel.orange, icon = TriangleAlert, size = "base", weight = "regular" }) {
  return (
    <View style={[styles.box, { backgroundColor: tone.soft }]} accessibilityRole="alert">
      <Icon as={icon} size={20} color={tone.main} style={styles.icon} />
      <T size={size} weight={weight} color={tone.main} style={styles.flex}>
        {children}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, padding: 12 },
  icon: { marginTop: 2 },
  flex: { flex: 1 },
});
