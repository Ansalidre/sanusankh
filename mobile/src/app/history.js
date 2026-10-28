import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { History as HistoryIcon, Trash2 } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { LEVELS } from "@/components/triageLevels";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Collapsible } from "@/components/ui/Collapsible";
import { H2, Muted, T } from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n";
import { historyStore } from "@/lib/storage";

export default function History() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [list, setList] = useState(() => historyStore.list());

  const confirmClear = () => {
    Alert.alert(t("history.clearTitle"), t("history.clearText"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("history.clear"),
        style: "destructive",
        onPress: () => {
          historyStore.clear();
          setList([]);
          toast(t("history.cleared"));
        },
      },
    ]);
  };

  const formatDateTime = (iso) => new Date(iso).toLocaleString(lang, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Screen title={t("history.title")}>
      <SectionHeader level={1} icon={HistoryIcon} title={t("history.title")} subtitle={t("history.intro")} />

      {list.length === 0 ? (
        <Card style={styles.empty}>
          <IconBubble icon={HistoryIcon} size={64} round />
          <H2 align="center">{t("history.emptyTitle")}</H2>
          <Muted align="center">{t("history.emptyText")}</Muted>
          <Button
            size="lg"
            label={t("home.start")}
            onPress={() => router.navigate({ pathname: "/triage", params: { run: String(Date.now()) } })}
            style={styles.full}
          />
        </Card>
      ) : (
        <>
          {list.map((entry) => {
            const style = LEVELS[entry.level] || LEVELS.gelb;
            return (
              <Card key={entry.id} padded={false} tone={style} border={style.main} style={styles.entry}>
                <Collapsible
                  accessibilityLabel={`${t(`level.${entry.level}`)}: ${entry.title}. ${t("history.showAnswers")}`}
                  header={
                    <View style={styles.headerText}>
                      <View style={styles.levelRow}>
                        <View style={[styles.dot, { backgroundColor: style.main }]} />
                        <T size="sm" weight="semibold" color={style.main}>
                          {t(`level.${entry.level}`)}
                        </T>
                        {entry.type === "redflag" && <Badge variant="emergency" label={t("history.redflag")} />}
                      </View>
                      <T weight="heading" size="lg">
                        {entry.title}
                      </T>
                      <Muted size="sm">{formatDateTime(entry.date)}</Muted>
                    </View>
                  }
                >
                  <View style={styles.answers}>
                    {(entry.answers || []).map((a, i) => (
                      <View key={i}>
                        <Muted size="sm">{a.question}</Muted>
                        <T weight="semibold">{a.answer}</T>
                      </View>
                    ))}
                  </View>
                </Collapsible>
              </Card>
            );
          })}
          <Button variant="outline" size="lg" icon={Trash2} label={t("history.clear")} onPress={confirmClear} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", gap: 12, paddingVertical: 28 },
  full: { alignSelf: "stretch", marginTop: 8 },
  entry: { paddingHorizontal: 16, borderStartWidth: 8 },
  headerText: { gap: 4 },
  levelRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  answers: { gap: 10 },
});
