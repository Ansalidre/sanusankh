import { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { IdCard, Maximize2, Pencil, Plus, Trash2 } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import LegalNote from "@/components/LegalNote";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { H2, Muted } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { deleteScan } from "@/lib/scans";
import { profiles } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

export default function EmergencyPass() {
  const { t, lang } = useI18n();
  const [list, setList] = useState(() => profiles.list());

  // Nach dem Bearbeiten (eigener Stack-Screen) beim Zurückkommen neu laden.
  useFocusEffect(
    useCallback(() => {
      setList(profiles.list());
    }, []),
  );

  const confirmRemove = (profile) => {
    Alert.alert(t("pass.deleteTitle"), t("pass.deleteText", { name: profile.name }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteScan(profile.directiveScan);
          profiles.remove(profile.id);
          setList(profiles.list());
        },
      },
    ]);
  };

  return (
    <Screen tab>
      <SectionHeader level={1} icon={IdCard} title={t("pass.title")} subtitle={t("pass.intro")} />

      {list.length === 0 ? (
        <Card style={styles.empty}>
          <IconBubble icon={IdCard} size={64} round />
          <H2 align="center">{t("pass.emptyTitle")}</H2>
          <Muted align="center">{t("pass.emptyText")}</Muted>
          <Button size="lg" icon={Plus} label={t("pass.new")} onPress={() => router.push("/profile/new")} style={styles.full} />
        </Card>
      ) : (
        <>
          {list.map((p) => (
            <Card key={p.id} style={styles.item}>
              <View>
                <H2>{p.name}</H2>
                <Muted size="sm">
                  {[p.birthDate && t("pass.born", { date: formatDate(p.birthDate, lang) }), p.bloodType && `${t("pass.blood")}: ${p.bloodType}`]
                    .filter(Boolean)
                    .join(" · ")}
                </Muted>
              </View>
              <Button variant="emergency" icon={Maximize2} label={t("pass.show")} onPress={() => router.push(`/profile/show/${p.id}`)} />
              <View style={styles.row}>
                <Button variant="outline" icon={Pencil} label={t("common.edit")} onPress={() => router.push(`/profile/${p.id}`)} style={styles.flex} />
                <Button variant="ghost" icon={Trash2} label={t("common.delete")} onPress={() => confirmRemove(p)} style={styles.flex} />
              </View>
            </Card>
          ))}
          <Button size="lg" variant="outline" icon={Plus} label={t("pass.new")} onPress={() => router.push("/profile/new")} />
        </>
      )}

      <LegalNote>{t("pass.localOnly")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", gap: 12, paddingVertical: 28 },
  full: { alignSelf: "stretch", marginTop: 8 },
  item: { gap: 12 },
  row: { flexDirection: "row", gap: 8 },
  flex: { flex: 1 },
});
