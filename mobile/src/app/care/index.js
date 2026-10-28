import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { ChevronRight, FileSignature, Flower2, Inbox, Leaf, Lock, Umbrella } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import LegalNote from "@/components/LegalNote";
import Screen from "@/components/Screen";
import { cardStyle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H1, Muted, T } from "@/components/ui/Text";
import { hasInsurancePartner } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { requestStore } from "@/lib/storage";
import { colors } from "@/lib/theme";

const CALM = colors.calm;

function CareLink({ icon, title, subtitle, to }) {
  return (
    <Pressable
      onPress={() => router.push(to)}
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${subtitle}`}
      style={({ pressed }) => [styles.link, pressed && { backgroundColor: CALM.soft }]}
    >
      <IconBubble icon={icon} size={48} bg={CALM.soft} color={CALM.main} />
      <View style={styles.flex}>
        <T weight="heading" size="lg">
          {title}
        </T>
        <Muted size="sm">{subtitle}</Muted>
      </View>
      <Icon as={ChevronRight} color={colors.mutedForeground} flip />
    </Pressable>
  );
}

/**
 * Bereich „Vorsorge“: bewusst ruhig gestaltet und getrennt vom Notfall-Startbildschirm.
 * Die Sterbegeld-Seite erscheint nur, wenn es im Land einen aktiven Kooperationspartner gibt.
 */
export default function Care() {
  const { t, country } = useI18n();
  const [hasRequests, setHasRequests] = useState(false);
  useFocusEffect(useCallback(() => setHasRequests(requestStore.list().length > 0), []));
  return (
    <Screen title={t("care.title")} emergencyBar={false}>
      <View style={styles.intro}>
        <IconBubble icon={Leaf} size={52} bg={CALM.soft} color={CALM.main} round />
        <H1 size="2xl">{t("care.title")}</H1>
        <T color={CALM.main}>{t("care.intro")}</T>
      </View>

      <View style={styles.gap}>
        <CareLink icon={FileSignature} title={t("care.directive")} subtitle={t("care.directiveSub")} to="/care/directive" />
        <CareLink icon={Flower2} title={t("care.funeral")} subtitle={t("care.funeralSub")} to="/care/funeral" />
        {hasRequests && <CareLink icon={Inbox} title={t("requests.title")} subtitle={t("requests.sub")} to="/care/requests" />}
        {hasInsurancePartner(country.code) && (
          <CareLink icon={Umbrella} title={t("care.insurance")} subtitle={t("care.insuranceSub")} to="/care/insurance" />
        )}
      </View>

      <View style={styles.privacy}>
        <Icon as={Lock} size={18} color={CALM.main} style={styles.lock} />
        <Muted size="sm" style={styles.flex}>
          {t("care.privacy")}
        </Muted>
      </View>
      <LegalNote>{t("care.legal")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 10, backgroundColor: CALM.soft, borderRadius: 24, padding: 20 },
  gap: { gap: 12 },
  link: { ...cardStyle, borderColor: CALM.border, flexDirection: "row", alignItems: "center", gap: 14, padding: 16, minHeight: 80 },
  flex: { flex: 1, gap: 2 },
  privacy: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  lock: { marginTop: 2 },
});
