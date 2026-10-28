import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors, radius, TAP } from "@/lib/theme";
import { formatDate, toIsoDate } from "@/lib/utils";

const DEFAULT_DATE = new Date(1980, 0, 1);

/**
 * Datumsfeld mit nativem Datumswähler. Wert als "YYYY-MM-DD" oder "".
 * `future` erlaubt Daten nach heute (z. B. Haltbarkeit) statt nur vergangener (Geburtsdatum).
 */
export function DateField({ label, value, onChange, future = false }) {
  const { t, lang } = useI18n();
  const [iosOpen, setIosOpen] = useState(false);
  const current = value ? new Date(`${value}T00:00:00`) : future ? new Date() : DEFAULT_DATE;
  const maximumDate = future ? undefined : new Date();

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: current,
        mode: "date",
        maximumDate,
        onChange: (event, date) => {
          if (event.type === "set" && date) onChange(toIsoDate(date));
        },
      });
    } else {
      if (!value) onChange(toIsoDate(current));
      setIosOpen((o) => !o);
    }
  };

  return (
    <View style={styles.field}>
      <T weight="semibold">{label}</T>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatDate(value, lang) : t("pass.chooseDate")}`}
        style={({ pressed }) => [styles.trigger, pressed && { backgroundColor: colors.accent }]}
      >
        <T ltr={Boolean(value)} color={value ? colors.foreground : colors.mutedForeground} style={styles.flex}>
          {value ? formatDate(value, lang) : t("pass.chooseDate")}
        </T>
        <Icon as={Calendar} color={colors.mutedForeground} />
      </Pressable>
      {Platform.OS === "ios" && iosOpen && (
        <View style={styles.ios}>
          <DateTimePicker
            value={current}
            mode="date"
            display="spinner"
            maximumDate={maximumDate}
            locale={lang}
            onChange={(_, date) => date && onChange(toIsoDate(date))}
          />
          <Button variant="secondary" label={t("common.done")} onPress={() => setIosOpen(false)} />
        </View>
      )}
      {value ? (
        <Button
          variant="link"
          size="sm"
          label={t("pass.clearDate")}
          onPress={() => {
            setIosOpen(false);
            onChange("");
          }}
          style={styles.start}
        />
      ) : null}
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
  start: { alignSelf: "flex-start" },
});
