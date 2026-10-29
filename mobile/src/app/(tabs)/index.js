import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  BookOpen,
  BriefcaseMedical,
  Car,
  ChevronRight,
  FlaskConical,
  Hospital,
  IdCard,
  Leaf,
  Pill,
  ShieldCheck,
  Stethoscope,
  Video,
} from "lucide-react-native";
import AssistantPanel from "@/components/AssistantPanel";
import IconBubble from "@/components/IconBubble";
import LegalNote from "@/components/LegalNote";
import Notice from "@/components/Notice";
import NumberedList from "@/components/NumberedList";
import QuickTile from "@/components/QuickTile";
import Screen from "@/components/Screen";
import { Button } from "@/components/ui/Button";
import { Card, cardStyle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H1, H2, Muted, T } from "@/components/ui/Text";
import { findNumber, oncallEntry } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { expiryState } from "@/lib/reminders";
import { cabinetStore } from "@/lib/storage";
import { colors } from "@/lib/theme";

/** Gibt es in der Hausapotheke Abgelaufenes oder bald Ablaufendes? (bei jedem Fokus neu berechnet) */
function useCabinetAlert() {
  const [alert, setAlert] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setAlert(Object.values(cabinetStore.get()).some((e) => e?.have && expiryState(e.expires)));
    }, []),
  );
  return alert;
}

export default function Home() {
  const { t, country } = useI18n();
  const call = useCall();
  const cabinetAlert = useCabinetAlert();
  const oncall = oncallEntry(country);
  const poison = findNumber(country, "poison");

  // Länderspezifische Kacheln erscheinen nur, wenn das Land die Nummer hat (src/content/countries.json).
  const tiles = [
    { icon: BookOpen, title: t("tile.guides"), subtitle: t("tile.guidesSub"), onPress: () => router.navigate("/guides") },
    oncall && { icon: Stethoscope, title: oncall.number, subtitle: t(`num.${oncall.kind}`), onPress: () => call(oncall.number) },
    poison && {
      icon: FlaskConical,
      title: t("tile.poison"),
      subtitle: t(poison.regions ? "tile.poisonSub" : "tile.poisonSub24"),
      onPress: () => (poison.regions ? router.push("/numbers?focus=poison") : call(poison.number)),
    },
    { icon: Pill, title: t("tile.pharmacy"), subtitle: t("tile.pharmacySub"), onPress: () => router.push("/pharmacy") },
    { icon: BriefcaseMedical, title: t("tile.cabinet"), subtitle: t("tile.cabinetSub"), onPress: () => router.push("/cabinet") },
    { icon: Video, title: t("tile.tele"), subtitle: t("tile.teleSub"), onPress: () => router.push("/telemedicine") },
    { icon: Car, title: t("tile.transport"), subtitle: t("tile.transportSub"), onPress: () => router.push("/transport") },
    { icon: IdCard, title: t("tile.pass"), subtitle: t("tile.passSub"), onPress: () => router.navigate("/pass") },
    { icon: Hospital, title: t("tile.hospital"), subtitle: t("tile.hospitalSub"), onPress: () => router.push("/hospitals") },
  ].filter(Boolean);

  return (
    <Screen tab keyboard>
      <View style={styles.hero}>
        <H1 color="#fff">{t("home.heroTitle")}</H1>
        <T size="lg" color="rgba(255,255,255,0.92)">
          {t("home.heroText")}
        </T>
        <Button
          size="lg"
          variant="secondary"
          label={t("home.start")}
          onPress={() => router.navigate("/emergency")}
          style={styles.heroButton}
        />
      </View>

      {cabinetAlert && (
        <Pressable onPress={() => router.push("/cabinet")} accessibilityRole="link">
          <Notice weight="semibold">{`${t("cabinet.alert")} ${t("cabinet.alertAction")} ›`}</Notice>
        </Pressable>
      )}

      <View style={styles.section}>
        <H2>{t("home.quick")}</H2>
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <QuickTile key={tile.title} {...tile} />
          ))}
        </View>
      </View>

      <Card style={styles.section}>
        <View style={styles.titleRow}>
          <Icon as={ShieldCheck} color={colors.primary} />
          <H2 style={styles.flex}>{t("home.howTitle")}</H2>
        </View>
        <NumberedList items={[t("home.how1"), t("home.how2"), t("home.how3")]} />
        <LegalNote>{t("home.howDisclaimer")}</LegalNote>
      </Card>

      <AssistantPanel />

      {/* Vorsorge bewusst getrennt vom Notfallbereich und ruhig gestaltet */}
      <Pressable
        onPress={() => router.push("/care")}
        accessibilityRole="link"
        accessibilityLabel={`${t("tile.care")}, ${t("tile.careSub")}`}
        style={({ pressed }) => [styles.care, pressed && { backgroundColor: colors.calm.soft }]}
      >
        <IconBubble icon={Leaf} size={48} bg={colors.calm.soft} color={colors.calm.main} round />
        <View style={styles.flex}>
          <T weight="heading" size="lg">
            {t("tile.care")}
          </T>
          <Muted size="sm">{t("tile.careSub")}</Muted>
        </View>
        <Icon as={ChevronRight} color={colors.mutedForeground} flip />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primary, borderRadius: 24, padding: 22, gap: 12 },
  heroButton: { marginTop: 8 },
  section: { gap: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  care: { ...cardStyle, borderColor: colors.calm.border, flexDirection: "row", alignItems: "center", gap: 14, padding: 16, minHeight: 80 },
});
