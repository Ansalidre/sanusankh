import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { Icon } from "@/components/ui/Icon";
import { OptionSheet } from "@/components/ui/OptionSheet";
import { T } from "@/components/ui/Text";
import { colors, radius, TAP } from "@/lib/theme";

/** Auswahlfeld mit Beschriftung; öffnet ein OptionSheet. */
export function SelectField({ label, value, placeholder, options, onChange, ltrValue = false }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={styles.field}>
      <T weight="semibold">{label}</T>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current ? current.label : placeholder}`}
        style={({ pressed }) => [styles.trigger, pressed && { backgroundColor: colors.accent }]}
      >
        <T ltr={ltrValue && Boolean(current)} color={current ? colors.foreground : colors.mutedForeground} style={styles.flex}>
          {current ? current.label : placeholder}
        </T>
        <Icon as={ChevronDown} color={colors.mutedForeground} />
      </Pressable>
      <OptionSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={label}
        options={options}
        selected={value}
        onSelect={(v) => {
          setOpen(false);
          onChange(v);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  trigger: {
    minHeight: TAP,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
  },
  flex: { flex: 1 },
});
