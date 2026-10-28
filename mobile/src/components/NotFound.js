import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { H2, Muted } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";

/** Hinweis für nicht vorhandene Inhalte; `back` = { to, label } (Übersetzungsschlüssel). */
export default function NotFound({ title = "common.notFoundTitle", text = "common.notFoundText", back = { to: "/", label: "common.toHome" } }) {
  const { t } = useI18n();
  return (
    <Card style={styles.card}>
      <IconBubble icon={CircleAlert} size={64} round />
      <H2 align="center">{t(title)}</H2>
      <Muted align="center">{t(text)}</Muted>
      <Button size="lg" label={t(back.label)} onPress={() => router.replace(back.to)} style={styles.full} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", gap: 12, paddingVertical: 28 },
  full: { alignSelf: "stretch", marginTop: 8 },
});
