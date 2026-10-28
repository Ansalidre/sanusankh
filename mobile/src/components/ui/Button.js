import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { colors, radius, TAP } from "@/lib/theme";

const VARIANTS = {
  default: { bg: colors.primary, pressed: "#0A3B49", fg: colors.primaryForeground },
  emergency: { bg: colors.emergency, pressed: colors.emergencyDark, fg: "#FFFFFF" },
  destructive: { bg: colors.destructive, pressed: colors.emergencyDark, fg: "#FFFFFF" },
  outline: { bg: colors.card, pressed: colors.accent, fg: colors.foreground, border: colors.border },
  secondary: { bg: colors.secondary, pressed: colors.accent, fg: colors.secondaryForeground },
  ghost: { bg: "transparent", pressed: colors.accent, fg: colors.foreground },
  link: { bg: "transparent", pressed: "transparent", fg: colors.primary },
};

const SIZES = {
  sm: { minHeight: 44, paddingHorizontal: 12, text: "sm" },
  default: { minHeight: TAP, paddingHorizontal: 18, text: "base" },
  lg: { minHeight: 56, paddingHorizontal: 20, text: "lg" },
  xl: { minHeight: 64, paddingHorizontal: 20, text: "xl" },
};

/**
 * Schaltfläche mit Mindesthöhe 52 px. `icon` ist eine lucide-Komponente; `flipIcon` spiegelt sie in RTL.
 * `align="start"` richtet Inhalt an der Leserichtung aus (für Aktionslisten).
 */
export function Button({
  label,
  onPress,
  variant = "default",
  size = "default",
  icon,
  flipIcon = false,
  loading = false,
  disabled = false,
  align = "center",
  style,
  accessibilityLabel,
  accessibilityHint,
  children,
}) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: s.minHeight,
          paddingHorizontal: s.paddingHorizontal,
          backgroundColor: pressed ? v.pressed : v.bg,
          justifyContent: align === "start" ? "flex-start" : "center",
        },
        v.border && { borderWidth: 2, borderColor: v.border },
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        icon && <Icon as={icon} color={v.fg} size={size === "xl" ? 28 : 22} flip={flipIcon} />
      )}
      {children ??
        (label != null && (
          <View style={align === "start" ? styles.labelStart : styles.labelCenter}>
            <T
              weight={size === "xl" ? "bold" : "semibold"}
              size={s.text}
              color={v.fg}
              align={align === "start" ? undefined : "center"}
              style={variant === "link" && styles.link}
            >
              {label}
            </T>
          </View>
        ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.md,
    paddingVertical: 8,
  },
  disabled: { opacity: 0.5 },
  labelCenter: { flexShrink: 1 },
  labelStart: { flex: 1 },
  link: { textDecorationLine: "underline" },
});
