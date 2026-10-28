import { StyleSheet, View } from "react-native";
import { Info } from "lucide-react-native";
import { Icon } from "@/components/ui/Icon";
import { Muted } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

/** Kleiner Hinweistext mit Info-Symbol. */
export default function LegalNote({ children, style }) {
  return (
    <View style={[styles.row, style]}>
      <Icon as={Info} size={18} color={colors.mutedForeground} style={styles.icon} />
      <Muted size="sm" style={styles.flex}>
        {children}
      </Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  icon: { marginTop: 2 },
  flex: { flex: 1 },
});
