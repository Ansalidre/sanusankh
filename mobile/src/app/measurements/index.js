import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { BellRing, ChevronRight, HardDrive, Info, NotebookPen, Plus, Share2 } from "lucide-react-native";
import LegalNote from "@/components/LegalNote";
import MeasurementChart, { EmptyChart } from "@/components/MeasurementChart";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { formatTime, TimeField } from "@/components/TimeField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckRow } from "@/components/ui/CheckRow";
import { Icon } from "@/components/ui/Icon";
import { Segmented } from "@/components/ui/Segmented";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n";
import { buildReportHtml } from "@/lib/measurementReport";
import { chartMinSpan, chartSeries, entriesInRange, formatNumber, groupByDay, PERIODS, periodRange, unitDecimals } from "@/lib/measurements";
import { cancelMeasurementReminder, scheduleMeasurementReminder } from "@/lib/reminders";
import { shareReport } from "@/lib/shareReport";
import { measurementStore } from "@/lib/storage";
import { colors, TAP } from "@/lib/theme";
import { translate } from "@/lib/translations";
import { formatDate, toIsoDate } from "@/lib/utils";

/** Kurzer Text eines Eintrags für die Liste – nur die eingetragenen Werte. */
function entryText(e, t, lang) {
  if (e.kind === "bp") {
    const pulse = e.pulse != null ? ` · ${t("meas.pulse")} ${e.pulse}` : "";
    return `${e.sys} / ${e.dia} mmHg${pulse}`;
  }
  const context = e.context ? ` · ${t(`meas.context.${e.context}`)}` : "";
  return `${formatNumber(e.value, lang, unitDecimals(e.unit))} ${e.unit}${context}`;
}

/**
 * Messwerte-Tagebuch: Blutdruck und Blutzucker als Liste und einfache Kurve, PDF zum Teilen,
 * optionale tägliche Erinnerung. Alles bleibt auf dem Gerät; die App bewertet die Werte nicht.
 */
export default function Measurements() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const params = useLocalSearchParams();
  const [kind, setKind] = useState(params.kind === "glucose" ? "glucose" : "bp");
  const [days, setDays] = useState(30);
  const [showAll, setShowAll] = useState(false);
  const [data, setData] = useState(() => measurementStore.get());
  const [printName, setPrintName] = useState(() => measurementStore.get().printName);
  const [sharing, setSharing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setData(measurementStore.get());
    }, []),
  );

  const reminderTexts = { title: t("meas.title"), body: t("meas.reminderBody") };

  // Erinnerungstext in der aktuellen Sprache halten (nur, wenn sie schon eingeschaltet ist – ohne neue Rückfrage).
  useEffect(() => {
    const { reminder } = measurementStore.get();
    if (reminder.enabled) scheduleMeasurementReminder({ time: reminder.time, title: t("meas.title"), body: t("meas.reminderBody") });
  }, [t]);

  const range = periodRange(days);
  const unit = data.glucoseUnit;
  const ofKind = data.entries.filter((e) => e.kind === kind);
  const inRange = entriesInRange(data.entries, kind, range);
  const older = ofKind.length - inRange.length;
  const groups = groupByDay(showAll ? ofKind : inRange);
  const converted = kind === "glucose" && inRange.some((e) => e.unit !== unit);
  const shortDate = (d) => d.toLocaleDateString(lang, { day: "2-digit", month: "2-digit" });
  const legend =
    kind === "bp"
      ? [
          { label: t("meas.sys"), marker: "circle" },
          { label: t("meas.dia"), marker: "square", dashed: true },
        ]
      : [{ label: t("meas.valueIn", { unit }), marker: "circle" }, ...(converted ? [{ label: t("meas.converted"), marker: "circle", hollow: true }] : [])];

  const setReminder = async (patch) => {
    const reminder = { ...data.reminder, ...patch };
    setData(measurementStore.set({ reminder }));
    if (!reminder.enabled) {
      await cancelMeasurementReminder();
      return;
    }
    const result = await scheduleMeasurementReminder({ time: reminder.time, ...reminderTexts });
    if (result === "denied") {
      setData(measurementStore.set({ reminder: { ...reminder, enabled: false } }));
      toast(t("meas.reminderDenied"));
    } else if (result === "scheduled") {
      toast(t("meas.reminderSaved", { time: formatTime(reminder.time, lang) }));
    }
  };

  const share = async () => {
    setSharing(true);
    try {
      const html = buildReportHtml({ entries: data.entries, days, lang, printName: printName.trim(), glucoseUnit: unit, t: translate });
      await shareReport({ html, fileName: `Messwerte-${toIsoDate(new Date())}.pdf`, dialogTitle: t("meas.pdfTitle") });
    } catch {
      toast(t("meas.pdfError"));
    } finally {
      setSharing(false);
    }
  };

  return (
    <Screen title={t("meas.title")} keyboard>
      <SectionHeader level={1} icon={NotebookPen} title={t("meas.title")} subtitle={t("meas.intro")} />

      <Notice tone={colors.calm} icon={Info} weight="semibold">
        {t("meas.hint")}
      </Notice>

      <Segmented
        accessibilityLabel={t("meas.kindLabel")}
        value={kind}
        onChange={(k) => {
          setKind(k);
          setShowAll(false);
        }}
        options={[
          { value: "bp", label: t("meas.bp") },
          { value: "glucose", label: t("meas.glucose") },
        ]}
      />

      <Button size="lg" icon={Plus} label={t(kind === "bp" ? "meas.addBp" : "meas.addGlucose")} onPress={() => router.push(`/measurements/edit?kind=${kind}`)} />

      <Card style={styles.gap}>
        <H2>{t("meas.chartTitle")}</H2>
        <Segmented
          accessibilityLabel={t("meas.periodLabel")}
          value={days}
          onChange={(d) => {
            setDays(d);
            setShowAll(false);
          }}
          options={PERIODS.map((d) => ({ value: d, label: t("meas.days", { days: d }) }))}
        />
        {inRange.length ? (
          <MeasurementChart
            series={chartSeries(inRange, kind, unit)}
            from={range.from}
            to={range.to}
            minSpan={chartMinSpan(kind, unit)}
            formatY={(v) => formatNumber(v, lang, kind === "glucose" ? unitDecimals(unit) : 0)}
            formatX={shortDate}
            legend={legend}
            accessibilityLabel={t("meas.chartA11y", { count: inRange.length, from: formatDate(toIsoDate(range.from), lang), to: formatDate(toIsoDate(range.to), lang) })}
          />
        ) : (
          <EmptyChart text={t("meas.emptyPeriod")} />
        )}
        {kind === "bp" && inRange.length > 0 && <Muted size="sm">{t("meas.bpChartNote")}</Muted>}
        {kind === "glucose" && inRange.length > 0 && (
          <Muted size="sm">{`${t("meas.unitNote", { unit })}${converted ? ` ${t("meas.convertedNote", { factor: formatNumber(18.016, lang, 3) })}` : ""}`}</Muted>
        )}
      </Card>

      <View style={styles.gap}>
        <H2>{t("meas.listTitle")}</H2>
        {groups.length === 0 && <Muted>{t("meas.emptyList")}</Muted>}
        {groups.map((g) => (
          <Card key={g.day} style={styles.day}>
            <H3>{formatDate(g.day, lang)}</H3>
            {g.entries.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => router.push(`/measurements/edit?id=${e.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${formatTime(e.at.slice(11, 16), lang)}: ${entryText(e, t, lang)}. ${t("common.edit")}`}
                style={({ pressed }) => [styles.entry, pressed && { backgroundColor: colors.accent }]}
              >
                <T ltr weight="semibold" style={styles.time}>
                  {formatTime(e.at.slice(11, 16), lang)}
                </T>
                <View style={styles.flex}>
                  <T>{entryText(e, t, lang)}</T>
                  {e.note ? <Muted size="sm">{e.note}</Muted> : null}
                </View>
                <Icon as={ChevronRight} color={colors.mutedForeground} flip />
              </Pressable>
            ))}
          </Card>
        ))}
        {!showAll && older > 0 && <Button variant="outline" label={t("meas.showOlder", { count: older })} onPress={() => setShowAll(true)} />}
      </View>

      <Card style={styles.gap}>
        <View style={styles.titleRow}>
          <Icon as={Share2} color={colors.primary} />
          <H2 style={styles.flex}>{t("meas.pdfSection")}</H2>
        </View>
        <T>{t("meas.pdfText", { days })}</T>
        <TextField
          label={t("meas.pdfNameLabel")}
          hint={t("meas.pdfNameHint")}
          value={printName}
          maxLength={80}
          onChangeText={setPrintName}
          onEndEditing={() => measurementStore.set({ printName: printName.trim() })}
          onBlur={() => measurementStore.set({ printName: printName.trim() })}
          autoComplete="off"
        />
        <Button icon={Share2} label={t("meas.pdfShare", { days })} loading={sharing} onPress={share} />
      </Card>

      <Card style={styles.gap}>
        <View style={styles.titleRow}>
          <Icon as={BellRing} color={colors.primary} />
          <H2 style={styles.flex}>{t("meas.reminderTitle")}</H2>
        </View>
        <CheckRow checked={data.reminder.enabled} onChange={(enabled) => setReminder({ enabled })} label={t("meas.reminderToggle")} hint={t("meas.reminderHint")} />
        {data.reminder.enabled && <TimeField label={t("meas.reminderTime")} value={data.reminder.time} onChange={(time) => setReminder({ time })} />}
      </Card>

      <Card style={styles.gap}>
        <View style={styles.titleRow}>
          <Icon as={HardDrive} color={colors.primary} />
          <H2 style={styles.flex}>{t("meas.storageTitle")}</H2>
        </View>
        <T>{t("meas.storageText")}</T>
        <Button variant="link" size="sm" label={t("meas.deleteHint")} onPress={() => router.navigate("/more")} style={styles.start} />
      </Card>

      <LegalNote>{t("meas.noAdvice")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  day: { gap: 4 },
  entry: { minHeight: TAP, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 10 },
  time: { minWidth: 52 },
  flex: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  start: { alignSelf: "flex-start" },
});
