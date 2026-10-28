import { Pressable, StyleSheet, View } from "react-native";
import { Check } from "lucide-react-native";
import { Icon } from "@/components/ui/Icon";
import { Muted, T } from "@/components/ui/Text";
import { COUNTRIES } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { colors, TAP } from "@/lib/theme";

/** Auswahl des Landes (unabhängig von der Sprache). `suggested` wird als „Vorschlag“ markiert. */
export default function CountryPicker({ value, onChange, suggested }) {
  const { t } = useI18n();
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {COUNTRIES.map((c) => {
        const active = c.code === value;
        const name = t(`country.${c.code}`);
        return (
          <Pressable
            key={c.code}
            onPress={() => onChange(c.code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={name}
            style={[styles.button, active && styles.active]}
          >
            <T size="xl" accessible={false}>
              {c.flag}
            </T>
            <View style={styles.flex}>
              <T weight="semibold" numberOfLines={2} color={active ? colors.primary : colors.foreground}>
                {name}
              </T>
              {suggested === c.code && <Muted size="xs">{t("country.suggested")}</Muted>}
            </View>
            {active && <Icon as={Check} size={20} color={colors.primary} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: TAP,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  active: { borderColor: colors.primary, backgroundColor: colors.accent },
  flex: { flex: 1 },
});
