import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, X } from "lucide-react-native";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors, radius, TAP } from "@/lib/theme";

/**
 * Auswahlliste als Bottom-Sheet (ersetzt Select und Sprachwahl-Dialog der Web-Version).
 * options: [{ value, label, left?, rtl? }]
 */
export function OptionSheet({ visible, onClose, title, titleIcon, options, selected, onSelect }) {
  const { t, rtl } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t("common.close")} accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 8, direction: rtl ? "rtl" : "ltr" }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {titleIcon && <Icon as={titleIcon} color={colors.primary} />}
            <T weight="heading" size="lg" accessibilityRole="header" style={styles.flex}>
              {title}
            </T>
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t("common.close")} style={styles.close} hitSlop={4}>
            <Icon as={X} size={26} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.list}>
          {options.map((o) => {
            const active = o.value === selected;
            return (
              <Pressable
                key={o.value}
                onPress={() => onSelect(o.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active, checked: active }}
                style={({ pressed }) => [styles.option, (active || pressed) && { backgroundColor: colors.accent }]}
              >
                {o.left}
                <T size="lg" weight={active ? "semibold" : "regular"} color={active ? colors.primary : colors.foreground} style={styles.flex}>
                  {o.label}
                </T>
                {active && <Icon as={Check} color={colors.primary} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(23,31,38,0.5)" },
  sheet: {
    maxHeight: "85%",
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  close: { width: TAP, height: TAP, alignItems: "center", justifyContent: "center", borderRadius: radius.full },
  list: { padding: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: TAP + 4,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  flex: { flex: 1 },
});
