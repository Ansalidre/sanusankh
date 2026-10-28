import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { BriefcaseMedical, Info, Pill } from "lucide-react-native";
import { DateField } from "@/components/DateField";
import LegalNote from "@/components/LegalNote";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import TranslationStatus from "@/components/TranslationStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckRow } from "@/components/ui/CheckRow";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { translateCabinet } from "@/lib/ai";
import { cabinetItems, hasReviewedMedicines } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { expiryState, scheduleExpiry } from "@/lib/reminders";
import { cabinetStore } from "@/lib/storage";
import { colors } from "@/lib/theme";
import { useAiTranslation } from "@/lib/useAiTranslation";
import { formatDate } from "@/lib/utils";

const GREEN = colors.ampel.gruen;

/**
 * Hausapotheke: Checkliste je Land (src/content/medicineCabinet.json) mit „Habe ich“ und Haltbarkeit.
 * Arzneimittel nur als Wirkstoffgruppe, ohne Dosierung – immer mit Apotheken-Hinweis.
 */
export default function Cabinet() {
  const { t, lang, country } = useI18n();
  const source = cabinetItems(country.code);
  const translation = useAiTranslation(source, lang, translateCabinet, `cabinet-${country.code}`);
  const items = translation.data;
  const [state, setState] = useState(() => cabinetStore.get());

  const supplies = items.filter((i) => i.kind === "supply");
  const medicines = items.filter((i) => i.kind === "medicine");
  const reviewed = hasReviewedMedicines(country.code);
  const done = items.filter((i) => state[i.id]?.have).length;

  const update = (item, patch) => {
    setState(cabinetStore.set(item.id, patch));
    if ("expires" in patch) {
      scheduleExpiry({
        id: item.id,
        title: t("cabinet.alertAction"),
        expires: patch.expires,
        texts: { soon: t("cabinet.notifySoon", { item: item.title }), expired: t("cabinet.notifyExpired", { item: item.title }) },
      });
    }
  };

  const renderItem = (item) => {
    const entry = state[item.id] || {};
    const expiry = expiryState(entry.expires);
    return (
      <Card key={item.id} style={styles.item}>
        <View style={styles.row}>
          <H3 style={styles.flex}>{item.title}</H3>
          {item.status !== "reviewed" && <Badge variant="outline" label={t("cabinet.unreviewed")} />}
        </View>
        <T>{item.description}</T>
        {item.kind === "medicine" && (
          <View style={styles.hint}>
            <Icon as={Info} size={18} color={colors.primary} style={styles.hintIcon} />
            <T size="sm" weight="semibold" color={colors.secondaryForeground} style={styles.flex}>
              {t("cabinet.medHint")}
            </T>
          </View>
        )}
        {item.status === "reviewed" && item.reviewedAt ? (
          <Muted size="sm">{t("cabinet.reviewed", { date: formatDate(item.reviewedAt, lang) })}</Muted>
        ) : null}
        {item.source ? <Muted size="sm">{t("cabinet.source", { source: item.source })}</Muted> : null}

        <CheckRow
          checked={Boolean(entry.have)}
          onChange={(have) => update(item, { have })}
          label={t("cabinet.have")}
          accessibilityLabel={`${item.title}: ${t("cabinet.have")}`}
        />

        <DateField future label={t("cabinet.expires")} value={entry.expires || ""} onChange={(expires) => update(item, { expires })} />
        {expiry === "expired" && <Badge variant="emergency" label={t("cabinet.expired")} />}
        {expiry === "soon" && <Badge label={t("cabinet.expiresSoon")} style={styles.soon} />}
      </Card>
    );
  };

  return (
    <Screen title={t("cabinet.title")} keyboard>
      <SectionHeader level={1} icon={BriefcaseMedical} title={t("cabinet.title")} subtitle={t("cabinet.intro")} />
      {translation.needsTranslation && <TranslationStatus status={translation.status} showButtons={false} />}

      <View style={styles.progressRow}>
        <Progress value={items.length ? (done / items.length) * 100 : 0} color={GREEN.main} style={styles.flex} />
        <Muted size="sm" weight="semibold" accessibilityLiveRegion="polite">
          {t("cabinet.progress", { done, total: items.length })}
        </Muted>
      </View>

      <View style={styles.gap}>
        <H2>{t("cabinet.supplies")}</H2>
        {supplies.map(renderItem)}
      </View>

      {!reviewed && (
        <Notice tone={colors.calm} icon={Info}>
          <T weight="bold" color={colors.calm.main}>
            {t("cabinet.pendingTitle")}.{" "}
          </T>
          {t("cabinet.pendingText")}
        </Notice>
      )}

      {medicines.length > 0 && (
        <View style={styles.gap}>
          <H2>{t("cabinet.medicines")}</H2>
          {__DEV__ && !reviewed && <Muted size="sm">{t("cabinet.devPreview")}</Muted>}
          {medicines.map(renderItem)}
        </View>
      )}

      <Button variant="outline" size="lg" icon={Pill} label={t("cabinet.toPharmacy")} onPress={() => router.push("/pharmacy")} />
      <LegalNote>{t("cabinet.noAdvice")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  item: { gap: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  hint: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: colors.accent, borderRadius: 12, padding: 10 },
  hintIcon: { marginTop: 2 },
  soon: { backgroundColor: colors.ampel.orange.soft },
});
