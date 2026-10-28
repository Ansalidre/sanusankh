import { Image, Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import { Phone, Share2, X } from "lucide-react-native";
import NotFound from "@/components/NotFound";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { profiles } from "@/lib/storage";
import { colors } from "@/lib/theme";
import { formatDate } from "@/lib/utils";

const BLACK = "#000000";
const GREY = "rgba(0,0,0,0.6)";

function lines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function Block({ label, items, none }) {
  const { lang } = useI18n();
  return (
    <View style={styles.block}>
      <T weight="bold" size="lg" color={GREY} accessibilityRole="header">
        {label.toLocaleUpperCase(lang)}
      </T>
      {items.length ? (
        items.map((item, i) => (
          <T key={i} weight="bold" size="2xl" color={BLACK}>
            {item}
          </T>
        ))
      ) : (
        <T size="xl" color={GREY}>
          {none}
        </T>
      )}
    </View>
  );
}

function CallButton({ number, color }) {
  const call = useCall();
  return (
    <Pressable onPress={() => call(number)} accessibilityRole="button" style={[styles.call, { backgroundColor: color }]}>
      <Icon as={Phone} size={24} color="#fff" />
      <T ltr weight="bold" size="2xl" color="#fff">
        {number}
      </T>
    </Pressable>
  );
}

/** Vollbild-Notfallpass für Rettungskräfte – ohne App-Navigation, maximale Lesbarkeit, Bildschirm bleibt an. */
export default function EmergencyPassView() {
  useKeepAwake();
  const { id } = useLocalSearchParams();
  const { t, lang, rtl } = useI18n();
  const insets = useSafeAreaInsets();
  const p = profiles.get(id);
  const close = () => (router.canGoBack() ? router.back() : router.replace("/pass"));
  const hasCare = Boolean(p && (p.directive || p.proxyName || p.proxyPhone));

  // Teilen nur auf ausdrücklichen Wunsch – Bestattungswünsche nur, wenn freigegeben.
  const share = () => {
    const parts = [
      `${t("pass.forRescuers")}: ${p.name}`,
      p.birthDate && t("pass.born", { date: formatDate(p.birthDate, lang) }),
      `${t("pass.blood")}: ${p.bloodType || t("pass.bloodUnknown")}`,
      p.allergies && `${t("pass.allergies")}: ${lines(p.allergies).join(", ")}`,
      p.conditions && `${t("pass.conditions")}: ${lines(p.conditions).join(", ")}`,
      p.medications && `${t("pass.medications")}: ${lines(p.medications).join(", ")}`,
      p.doctorName && `${t("pass.doctor")}: ${p.doctorName} ${p.doctorPhone || ""}`.trim(),
      ...(p.contacts || []).map((c) => `${t("pass.contacts")}: ${[c.name, c.relation, c.phone].filter(Boolean).join(" · ")}`),
      p.directive && `${t("pass.directive")}: ${p.directive === "yes" ? t("common.yes") : t("common.no")}`,
      p.directive === "yes" && p.directiveLocation && `${t("pass.directiveLocation")}: ${p.directiveLocation}`,
      (p.proxyName || p.proxyPhone) && `${t("pass.proxyName")}: ${[p.proxyName, p.proxyPhone].filter(Boolean).join(" · ")}`,
      p.funeralShare && p.funeralProvider && `${t("pass.funeralProvider")}: ${[p.funeralProvider, p.funeralPhone].filter(Boolean).join(" · ")}`,
      p.funeralShare && p.funeralWishes && `${t("pass.funeralWishes")}: ${lines(p.funeralWishes).join(", ")}`,
    ];
    Share.share({ message: parts.filter(Boolean).join("\n") }).catch(() => {});
  };

  if (!p) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 16, paddingHorizontal: 16 }]}>
        <NotFound title="pass.notFound" text="pass.emptyText" back={{ to: "/pass", label: "pass.title" }} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { direction: rtl ? "rtl" : "ltr" }]}>
      <StatusBar style="light" />
      <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
        <T weight="bold" size="lg" color="#fff" style={styles.flex}>
          {t("pass.forRescuers")}
        </T>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={t("common.close")} style={styles.close}>
          <Icon as={X} size={32} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <T weight="black" size="4xl" color={BLACK}>
          {p.name}
        </T>
        {p.birthDate ? (
          <T weight="semibold" size="2xl" color={BLACK}>
            {t("pass.born", { date: formatDate(p.birthDate, lang) })}
          </T>
        ) : null}

        <View style={styles.blood}>
          <T weight="bold" size="lg" color={GREY}>
            {t("pass.blood").toLocaleUpperCase(lang)}
          </T>
          <T ltr={Boolean(p.bloodType)} weight="black" size="3xl" color={colors.emergency}>
            {p.bloodType || t("pass.bloodUnknown")}
          </T>
        </View>

        <Block label={t("pass.allergies")} items={lines(p.allergies)} none={t("pass.none")} />
        <Block label={t("pass.conditions")} items={lines(p.conditions)} none={t("pass.none")} />
        <Block label={t("pass.medications")} items={lines(p.medications)} none={t("pass.none")} />

        {(p.doctorName || p.doctorPhone) && (
          <View style={styles.block}>
            <T weight="bold" size="lg" color={GREY} accessibilityRole="header">
              {t("pass.doctor").toLocaleUpperCase(lang)}
            </T>
            {p.doctorName ? (
              <T weight="bold" size="2xl" color={BLACK}>
                {p.doctorName}
              </T>
            ) : null}
            {p.doctorPhone ? <CallButton number={p.doctorPhone} color={BLACK} /> : null}
          </View>
        )}

        <View style={styles.block}>
          <T weight="bold" size="lg" color={GREY} accessibilityRole="header">
            {t("pass.contacts").toLocaleUpperCase(lang)}
          </T>
          {p.contacts?.length ? (
            p.contacts.map((c, i) => (
              <View key={i} style={styles.contact}>
                <T weight="bold" size="2xl" color={BLACK}>
                  {c.name}
                  {c.relation ? <T weight="semibold" size="2xl" color={GREY}>{` · ${c.relation}`}</T> : null}
                </T>
                {c.phone ? <CallButton number={c.phone} color={colors.emergency} /> : null}
              </View>
            ))
          ) : (
            <T size="xl" color={GREY}>
              {t("pass.none")}
            </T>
          )}
        </View>

        {hasCare && (
          <View style={styles.block}>
            <T weight="bold" size="lg" color={GREY} accessibilityRole="header">
              {t("pass.directive").toLocaleUpperCase(lang)}
            </T>
            <T weight="black" size="2xl" color={BLACK}>
              {p.directive === "yes" ? t("common.yes") : p.directive === "no" ? t("common.no") : t("pass.notStated")}
            </T>
            {p.directive === "yes" && p.directiveLocation ? (
              <T weight="semibold" size="xl" color={BLACK}>{`${t("pass.directiveLocation")}: ${p.directiveLocation}`}</T>
            ) : null}
            {p.directive === "yes" && p.directiveScan ? (
              <Image source={{ uri: p.directiveScan }} style={styles.scan} resizeMode="contain" accessibilityLabel={t("pass.scan")} />
            ) : null}
            {p.proxyName || p.proxyPhone ? (
              <View style={styles.contact}>
                <T weight="bold" size="lg" color={GREY}>
                  {t("pass.proxyName").toLocaleUpperCase(lang)}
                </T>
                {p.proxyName ? (
                  <T weight="bold" size="2xl" color={BLACK}>
                    {p.proxyName}
                  </T>
                ) : null}
                {p.proxyPhone ? <CallButton number={p.proxyPhone} color={BLACK} /> : null}
              </View>
            ) : null}
          </View>
        )}

        {p.funeralShare && (p.funeralProvider || p.funeralPhone || p.funeralWishes) ? (
          <View style={styles.block}>
            <T weight="bold" size="lg" color={GREY} accessibilityRole="header">
              {t("pass.funeralTitle").toLocaleUpperCase(lang)}
            </T>
            {p.funeralProvider ? (
              <T weight="bold" size="xl" color={BLACK}>
                {p.funeralProvider}
              </T>
            ) : null}
            {p.funeralPhone ? <CallButton number={p.funeralPhone} color={BLACK} /> : null}
            {lines(p.funeralWishes).map((w, i) => (
              <T key={i} size="xl" color={BLACK}>
                {w}
              </T>
            ))}
          </View>
        ) : null}

        <Pressable onPress={share} accessibilityRole="button" style={styles.share}>
          <Icon as={Share2} size={22} color={BLACK} />
          <T weight="semibold" size="lg" color={BLACK}>
            {t("pass.share")}
          </T>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.emergency,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  flex: { flex: 1 },
  close: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 4 },
  blood: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: 12,
    borderWidth: 4,
    borderColor: colors.emergency,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginVertical: 16,
  },
  block: { borderTopWidth: 2, borderTopColor: "rgba(0,0,0,0.1)", paddingVertical: 14, gap: 6 },
  contact: { gap: 6, marginTop: 6 },
  scan: { width: "100%", height: 320, marginTop: 8, borderRadius: 12, backgroundColor: "#F3F5F7" },
  share: {
    alignSelf: "flex-start",
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: 14,
    paddingHorizontal: 18,
    marginTop: 20,
  },
  call: {
    alignSelf: "flex-start",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: 20,
    marginTop: 4,
  },
});
