import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Languages } from "lucide-react-native";
import { OptionSheet } from "@/components/ui/OptionSheet";
import { T } from "@/components/ui/Text";
import { LANGUAGES } from "@/data/languages";
import { useI18n } from "@/lib/i18n";
import { colors, radius, TAP } from "@/lib/theme";

/** Sprachwahl-Knopf mit Flagge; die Liste öffnet sich als Bottom-Sheet. */
export default function LanguagePicker() {
  const { lang, language, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${t("common.chooseLanguage")}: ${language.label}`}
        style={({ pressed }) => [styles.trigger, pressed && { backgroundColor: colors.accent }]}
      >
        <T size="xl" accessible={false}>
          {language.flag}
        </T>
        <T weight="semibold" numberOfLines={1} style={styles.label}>
          {language.label}
        </T>
      </Pressable>
      <OptionSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t("common.chooseLanguage")}
        titleIcon={Languages}
        selected={lang}
        options={LANGUAGES.map((l) => ({
          value: l.code,
          label: l.label,
          left: (
            <T size="2xl" accessible={false}>
              {l.flag}
            </T>
          ),
        }))}
        onSelect={(code) => {
          setLang(code);
          setOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: TAP,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
  },
  label: { maxWidth: 120 },
});
