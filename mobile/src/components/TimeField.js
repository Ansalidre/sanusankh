import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Clock } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors, radius, TAP } from "@/lib/theme";
import { toTime } from "@/lib/measurements";

/** Uhrzeit "HH:MM" in der UI-Sprache. */
export function formatTime(time, lang) {
  const [h, m] = String(time).split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });
}

/** Uhrzeitfeld mit nativem Zeitwähler. Wert als "HH:MM". */
export function TimeField({ label, value, onChange }) {
  const { t, lang } = useI18n();
  const [iosOpen, setIosOpen] = useState(false);
  const [h, m] = String(value || "08:00").split(":").map(Number);
  const current = new Date(2000, 0, 1, h, m);

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: current,
        mode: "time",
        onChange: (event, date) => {
          if (event.type === "set" && date) onChange(toTime(date));
        },
      });
    } else {
      setIosOpen((o) => !o);
    }
  };

  return (
    <View style={styles.field}>
      <T weight="semibold">{label}</T>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatTime(value, lang)}`}
        style={({ pressed }) => [styles.trigger, pressed && { backgroundColor: colors.accent }]}
      >
        <T ltr style={styles.flex}>
          {formatTime(value, lang)}
        </T>
        <Icon as={Clock} color={colors.mutedForeground} />
      </Pressable>
      {Platform.OS === "ios" && iosOpen && (
        <View style={styles.ios}>
          <DateTimePicker value={current} mode="time" display="spinner" locale={lang} onChange={(_, date) => date && onChange(toTime(date))} />
          <Button variant="secondary" label={t("common.done")} onPress={() => setIosOpen(false)} />
        </View>
      )}
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
  ios: { gap: 8 },
});
