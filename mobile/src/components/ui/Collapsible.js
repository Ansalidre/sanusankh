import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { Icon } from "@/components/ui/Icon";
import { colors, TAP } from "@/lib/theme";

/** Auf- und zuklappbarer Bereich (ersetzt das Accordion der Web-Version). */
export function Collapsible({ header, accessibilityLabel, children, initiallyOpen = false, style }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={style}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open }}
        style={styles.trigger}
      >
        <View style={styles.flex}>{header}</View>
        <Icon as={ChevronDown} color={colors.mutedForeground} style={open && styles.open} />
      </Pressable>
      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: TAP, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  flex: { flex: 1 },
  open: { transform: [{ rotate: "180deg" }] },
  content: { paddingBottom: 16 },
});
