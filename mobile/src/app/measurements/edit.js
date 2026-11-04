import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { NotebookPen, Save, Trash2 } from "lucide-react-native";
import { DateField } from "@/components/DateField";
import NotFound from "@/components/NotFound";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { TimeField } from "@/components/TimeField";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Muted, T } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { confirm } from "@/lib/confirm";
import { useI18n } from "@/lib/i18n";
import { checkInput, formatNumber, parseNumber, toTime, UNITS } from "@/lib/measurements";
import { measurementStore } from "@/lib/storage";
import { colors } from "@/lib/theme";
import { toIsoDate } from "@/lib/utils";

const numberText = (v) => (v == null ? "" : String(v));

function initialForm(existing, kind, unit) {
  const now = new Date();
  if (!existing) {
    return { kind, date: toIsoDate(now), time: toTime(now), sys: "", dia: "", pulse: "", value: "", unit, context: "", note: "" };
  }
  return {
    kind: existing.kind,
    date: existing.at.slice(0, 10),
    time: existing.at.slice(11, 16),
    sys: numberText(existing.sys),
    dia: numberText(existing.dia),
    pulse: numberText(existing.pulse),
    value: numberText(existing.value),
    unit: existing.unit || unit,
    context: existing.context || "",
    note: existing.note || "",
  };
}

/** Eintrag anlegen (`kind`) oder bearbeiten (`id`). Geprüft wird nur, ob eine Zahl im Eingabebereich steht. */
export default function EditMeasurement() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const params = useLocalSearchParams();
  const existing = params.id ? measurementStore.entry(String(params.id)) : null;
  const [form, setForm] = useState(() => initialForm(existing, params.kind === "glucose" ? "glucose" : "bp", measurementStore.get().glucoseUnit));
  const [errors, setErrors] = useState({});

  if (params.id && !existing) {
    return (
      <Screen title={t("meas.notFound")}>
        <NotFound title="meas.notFound" text="meas.notFoundText" back={{ to: "/measurements", label: "meas.title" }} />
      </Screen>
    );
  }

  const isBp = form.kind === "bp";
  const title = t(existing ? (isBp ? "meas.editBp" : "meas.editGlucose") : isBp ? "meas.addBp" : "meas.addGlucose");
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const leave = () => (router.canGoBack() ? router.back() : router.replace("/measurements"));

  const rangeError = (range) => {
    if (!range) return undefined;
    if (range.int) return t("meas.errInt", { min: range.min, max: range.max });
    const dec = form.unit === "mmol/l" ? 1 : 0;
    return t("meas.errNumber", { min: formatNumber(range.min, lang, dec), max: formatNumber(range.max, lang, dec) });
  };

  const save = () => {
    const next = {};
    const values = {};
    if (!form.date) next.date = t("meas.errDate");
    if (isBp) {
      for (const key of ["sys", "dia", "pulse"]) {
        values[key] = parseNumber(form[key]);
        next[key] = rangeError(checkInput(key, values[key], { optional: key === "pulse" }));
      }
    } else {
      values.value = parseNumber(form.value);
      next.value = rangeError(checkInput(form.unit, values.value));
    }
    const failed = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setErrors(failed);
    if (Object.keys(failed).length) return;

    const base = { ...existing, kind: form.kind, at: `${form.date}T${form.time}`, note: form.note.trim() };
    const entry = isBp
      ? { ...base, sys: values.sys, dia: values.dia, pulse: values.pulse, value: undefined, unit: undefined, context: undefined }
      : {
          ...base,
          value: values.value,
          unit: form.unit,
          context: form.context || null,
          sys: undefined,
          dia: undefined,
          pulse: undefined,
        };
    measurementStore.save(entry);
    toast(t("meas.saved"));
    leave();
  };

  const remove = () =>
    confirm(t("meas.deleteTitle"), t("meas.deleteText"), t("common.delete"), t("common.cancel"), () => {
      measurementStore.remove(existing.id);
      toast(t("meas.deleted"));
      leave();
    });

  return (
    <Screen title={title} keyboard>
      <SectionHeader level={1} icon={NotebookPen} title={title} />

      <View style={styles.row}>
        <View style={styles.flex}>
          <DateField label={t("meas.date")} value={form.date} onChange={set("date")} />
          {errors.date && (
            <T size="sm" weight="semibold" color={colors.emergency} accessibilityRole="alert">
              {errors.date}
            </T>
          )}
        </View>
        <View style={styles.flex}>
          <TimeField label={t("meas.time")} value={form.time} onChange={set("time")} />
        </View>
      </View>

      {isBp ? (
        <View style={styles.gap}>
          <TextField label={t("meas.sysLabel")} keyboardType="number-pad" ltr value={form.sys} onChangeText={set("sys")} error={errors.sys} maxLength={3} />
          <TextField label={t("meas.diaLabel")} keyboardType="number-pad" ltr value={form.dia} onChangeText={set("dia")} error={errors.dia} maxLength={3} />
          <TextField label={t("meas.pulseLabel")} keyboardType="number-pad" ltr value={form.pulse} onChangeText={set("pulse")} error={errors.pulse} maxLength={3} />
        </View>
      ) : (
        <View style={styles.gap}>
          <T weight="semibold">{t("meas.unit")}</T>
          <Segmented accessibilityLabel={t("meas.unit")} value={form.unit} onChange={set("unit")} options={UNITS.map((u) => ({ value: u, label: u }))} />
          <TextField
            label={t("meas.valueIn", { unit: form.unit })}
            keyboardType="decimal-pad"
            ltr
            value={form.value}
            onChangeText={set("value")}
            error={errors.value}
            maxLength={6}
          />
          <T weight="semibold">{t("meas.contextLabel")}</T>
          <Muted size="sm">{t("meas.contextHint")}</Muted>
          <Segmented
            accessibilityLabel={t("meas.contextLabel")}
            value={form.context}
            onChange={set("context")}
            options={[
              { value: "", label: t("meas.context.none") },
              { value: "fasting", label: t("meas.context.fasting") },
              { value: "afterMeal", label: t("meas.context.afterMeal") },
            ]}
          />
        </View>
      )}

      <TextField label={t("meas.note")} hint={t("meas.noteHint")} multiline value={form.note} onChangeText={set("note")} maxLength={500} />

      <View style={styles.gap}>
        <Button size="lg" icon={Save} label={t("common.save")} onPress={save} />
        <Button variant="outline" label={t("common.cancel")} onPress={leave} />
        {existing && <Button variant="ghost" icon={Trash2} label={t("meas.delete")} onPress={remove} />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  row: { flexDirection: "row", gap: 12 },
  flex: { flex: 1, gap: 6 },
});
