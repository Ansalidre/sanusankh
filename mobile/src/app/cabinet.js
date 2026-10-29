import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { BriefcaseMedical, ExternalLink, Info, Pill } from "lucide-react-native";
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
import { Progress } from "@/components/ui/Progress";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { translateCabinet } from "@/lib/ai";
import { cabinetItems } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { openExternal } from "@/lib/links";
import { expiryState, scheduleExpiry } from "@/lib/reminders";
import { cabinetStore } from "@/lib/storage";
import { colors } from "@/lib/theme";
import { useAiTranslation } from "@/lib/useAiTranslation";

const GREEN = colors.ampel.gruen;
// Anerkannte Quelle zum Inhalt eines Erste-Hilfe-Kastens (geprüft am 29.10.2026).
const KIT_SOURCE = "https://www.malteser.de/aware/hilfreich/erste-hilfe-kasten-inhalt-und-verwendung-der-komponenten.html";

/**
 * Hausapotheke: Checkliste mit Verbandsmaterial und Hilfsmitteln (src/content/medicineCabinet.json)
 * mit „Habe ich“ und Haltbarkeit. Keine Arzneimittel – dafür der Verweis auf die Apotheke.
 */
export default function Cabinet() {
  const { t, lang, country } = useI18n();
  const source = cabinetItems(country.code);
  const translation = useAiTranslation(source, lang, translateCabinet, `cabinet-${country.code}`);
  const items = translation.data;
  const [state, setState] = useState(() => cabinetStore.get());

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
        <H3>{item.title}</H3>
        <T>{item.description}</T>

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
        {items.map(renderItem)}
      </View>

      <Card style={styles.gap}>
        <H2>{t("cabinet.moreTitle")}</H2>
        <T>{t("cabinet.moreText")}</T>
        <Button
          variant="outline"
          icon={ExternalLink}
          label={t("cabinet.kitSource")}
          accessibilityHint={t("common.externalLink")}
          onPress={() => openExternal(KIT_SOURCE)}
        />
        {lang !== "de" && <Muted size="sm">{t("guides.germanOnly")}</Muted>}
      </Card>

      <Notice tone={colors.calm} icon={Info}>
        {t("cabinet.medHint")}
      </Notice>
      <Button variant="outline" size="lg" icon={Pill} label={t("cabinet.toPharmacy")} onPress={() => router.push("/pharmacy")} />
      <LegalNote>{t("cabinet.noAdvice")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  item: { gap: 10 },
  flex: { flex: 1 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  soon: { backgroundColor: colors.ampel.orange.soft },
});
