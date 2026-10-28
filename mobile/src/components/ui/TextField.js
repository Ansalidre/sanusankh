import { StyleSheet, TextInput, View } from "react-native";
import { Muted, T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors, fonts, radius, sizes, TAP } from "@/lib/theme";

/** Beschriftetes Eingabefeld. `ltr` für Telefonnummern, `multiline` für mehrzeilige Angaben. */
export function TextField({ label, hint, error, ltr = false, multiline = false, style, inputStyle, inputRef, ...props }) {
  const { rtl } = useI18n();
  const dirRtl = rtl && !ltr;
  return (
    <View style={[styles.field, style]}>
      {label && (
        <T weight="semibold" nativeID={props.nativeID ? `${props.nativeID}-label` : undefined}>
          {label}
        </T>
      )}
      {hint && <Muted size="sm">{hint}</Muted>}
      <TextInput
        ref={inputRef}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={hint}
        maxFontSizeMultiplier={1.6}
        {...props}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.error,
          {
            fontFamily: fonts[rtl ? "arabic" : "latin"].regular,
            textAlign: dirRtl ? "right" : "left",
            writingDirection: dirRtl ? "rtl" : "ltr",
          },
          inputStyle,
        ]}
      />
      {error && (
        <T size="sm" weight="semibold" color={colors.emergency} accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </T>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    minHeight: TAP,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: sizes.base,
    color: colors.foreground,
  },
  multiline: { minHeight: 104, textAlignVertical: "top" },
  error: { borderColor: colors.emergency },
});
