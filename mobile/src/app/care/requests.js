import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Inbox, Lock, Phone, Trash2, Undo2 } from "lucide-react-native";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H3, Muted, T } from "@/components/ui/Text";
import { confirm } from "@/lib/confirm";
import { useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { withdrawRequest } from "@/lib/partners";
import { requestStore } from "@/lib/storage";
import { colors } from "@/lib/theme";
import { formatDate } from "@/lib/utils";

const ERRORS = { offline: "partner.offline", not_withdrawable: "requests.notWithdrawable" };

/**
 * „Meine Anfragen“: nur auf dem Gerät gespeichert (Code, Bestatter, Leistung, Datum, Status).
 * Zurückziehen sendet nur den Code und das geräteeigene Token an den Server.
 */
export default function Requests() {
  const { t, lang } = useI18n();
  const call = useCall();
  const [list, setList] = useState(() => requestStore.list());
  const [busy, setBusy] = useState(null);
  const [messages, setMessages] = useState({});

  const refresh = () => setList(requestStore.list());
  const say = (code, message) => setMessages((m) => ({ ...m, [code]: message }));

  const withdraw = (entry) =>
    confirm(t("requests.withdrawTitle"), t("requests.withdrawText", { partner: entry.partnerName, code: entry.code }), t("requests.withdraw"), t("common.cancel"), async () => {
      setBusy(entry.code);
      say(entry.code, null);
      try {
        await withdrawRequest(entry.code);
        say(entry.code, { tone: colors.ampel.gruen, text: t("requests.withdrawDone") });
      } catch (error) {
        say(entry.code, { tone: colors.ampel.orange, text: t(ERRORS[error.code] || "request.errFailed") });
      } finally {
        setBusy(null);
        refresh();
      }
    });

  const remove = (entry) => {
    requestStore.remove(entry.code);
    refresh();
  };

  return (
    <Screen title={t("requests.title")} emergencyBar={false}>
      <SectionHeader level={1} icon={Inbox} title={t("requests.title")} subtitle={t("requests.sub")} />
      <View style={styles.inline}>
        <Icon as={Lock} size={16} color={colors.calm.main} />
        <Muted size="sm" style={styles.flex}>
          {t("requests.local")}
        </Muted>
      </View>

      {list.length === 0 && <Muted>{t("requests.empty")}</Muted>}

      {list.map((entry) => {
        const cancelled = entry.status === "cancelled";
        const message = messages[entry.code];
        return (
          <Card key={entry.code} border={colors.calm.border} style={styles.small}>
            <View style={styles.row}>
              <T size="xl" weight="bold" ltr selectable color={cancelled ? colors.mutedForeground : colors.calm.main} style={styles.flex}>
                {entry.code}
              </T>
              <Badge label={t(cancelled ? "requests.statusCancelled" : "requests.statusRequested")} variant={cancelled ? "outline" : "secondary"} />
            </View>
            <H3>{entry.partnerName}</H3>
            <T>{entry.serviceTitle}</T>
            <Muted size="sm">{t("requests.sentOn", { date: formatDate(entry.createdAt.slice(0, 10), lang) })}</Muted>
            {message ? (
              <Notice tone={message.tone} weight="semibold">
                {message.text}
              </Notice>
            ) : null}
            {cancelled ? (
              <Button variant="ghost" icon={Trash2} label={t("requests.remove")} onPress={() => remove(entry)} />
            ) : (
              <View style={styles.actions}>
                {entry.partnerPhone ? <Button variant="outline" icon={Phone} label={t("common.call")} onPress={() => call(entry.partnerPhone)} style={styles.flex} /> : null}
                <Button variant="outline" icon={Undo2} label={t("requests.withdraw")} loading={busy === entry.code} onPress={() => withdraw(entry)} style={styles.flex} />
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  small: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  inline: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  actions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  flex: { flex: 1 },
});
