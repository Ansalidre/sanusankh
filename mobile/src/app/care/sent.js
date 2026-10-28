import { Share, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CircleCheck, Inbox, Leaf, Share2 } from "lucide-react-native";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Muted, T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { requestStore } from "@/lib/storage";
import { colors } from "@/lib/theme";

const GREEN = colors.ampel.gruen;

/** Bestätigung nach dem Absenden: Rabattcode groß, zum Vorzeigen beim Bestatter. */
export default function Sent() {
  const { code, delivery, mailed } = useLocalSearchParams();
  const { t } = useI18n();
  const entry = requestStore.get(code);
  if (!entry) {
    return (
      <Screen title={t("done.title")} emergencyBar={false}>
        <Notice>{t("partner.notFound")}</Notice>
      </Screen>
    );
  }

  const share = () => Share.share({ message: t("done.shareText", { partner: entry.partnerName, code: entry.code }) }).catch(() => {});

  return (
    <Screen title={t("done.title")} emergencyBar={false}>
      <SectionHeader level={1} icon={CircleCheck} title={t("done.title")} subtitle={entry.serviceTitle} />
      <T>{t("done.text", { partner: entry.partnerName })}</T>

      <Card tone={GREEN} border="#A9D8BF" style={styles.codeCard}>
        <Muted size="sm">{t("done.code")}</Muted>
        <T size="3xl" weight="bold" color={GREEN.main} ltr selectable accessibilityLabel={entry.code.split("").join(" ")} style={styles.code}>
          {entry.code}
        </T>
        <Muted size="sm">{entry.partnerName}</Muted>
      </Card>

      {delivery === "test" ? <Notice>{t("done.test")}</Notice> : mailed === "1" && <Muted>{t("done.mailed")}</Muted>}

      <View style={styles.small}>
        <Button variant="outline" icon={Share2} label={t("done.share")} onPress={share} />
        <Button variant="outline" icon={Inbox} label={t("requests.title")} onPress={() => router.replace("/care/requests")} />
        <Button variant="ghost" icon={Leaf} label={t("done.back")} onPress={() => router.dismissTo("/care")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeCard: { alignItems: "center", gap: 6, paddingVertical: 24 },
  code: { letterSpacing: 2, textAlign: "center" },
  small: { gap: 8 },
});
