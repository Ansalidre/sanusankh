import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import {
  BriefcaseMedical,
  Car,
  Check,
  ChevronRight,
  FileText,
  Globe,
  History as HistoryIcon,
  Hospital,
  Info,
  Languages,
  Leaf,
  Phone,
  Pill,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Video,
} from "lucide-react-native";
import CountryPicker from "@/components/CountryPicker";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, Muted, T } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { LANGUAGES } from "@/data/languages";
import { useI18n } from "@/lib/i18n";
import { prefs } from "@/lib/storage";
import { colors, TAP } from "@/lib/theme";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

function LinkRow({ to, icon, label }) {
  return (
    <Pressable
      onPress={() => router.push(to)}
      accessibilityRole="link"
      style={({ pressed }) => [styles.linkRow, pressed && { backgroundColor: colors.muted }]}
    >
      <Icon as={icon} size={22} color={colors.primary} />
      <T weight="semibold" style={styles.flex}>
        {label}
      </T>
      <Icon as={ChevronRight} color={colors.mutedForeground} flip />
    </Pressable>
  );
}

/** „Mehr & Einstellungen“: weitere Hilfen, Sprache, Taxi-Nummer, Rechtliches. */
export default function More() {
  const { t, lang, setLang, country, setCountry } = useI18n();
  const toast = useToast();
  const { focus } = useLocalSearchParams();
  const scrollRef = useRef(null);
  const taxiRef = useRef(null);
  const taxiY = useRef(0);
  const [taxi, setTaxi] = useState(() => prefs.get().taxiPhone || "");

  useEffect(() => {
    if (focus !== "taxi") return undefined;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, taxiY.current - 16), animated: true });
      taxiRef.current?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, [focus]);

  const saveTaxi = () => {
    prefs.set({ taxiPhone: taxi.trim() });
    toast(t("settings.taxiSaved"));
  };

  return (
    <Screen tab keyboard scrollRef={scrollRef}>
      <SectionHeader level={1} icon={SettingsIcon} title={t("settings.title")} />

      <Card style={styles.list}>
        <H2 style={styles.listTitle}>{t("settings.services")}</H2>
        <LinkRow to="/numbers" icon={Phone} label={t("numbers.title")} />
        <LinkRow to="/pharmacy" icon={Pill} label={t("pharmacy.title")} />
        <LinkRow to="/hospitals" icon={Hospital} label={t("hospitals.title")} />
        <LinkRow to="/telemedicine" icon={Video} label={t("tele.title")} />
        <LinkRow to="/transport" icon={Car} label={t("transport.title")} />
        <LinkRow to="/cabinet" icon={BriefcaseMedical} label={t("cabinet.title")} />
        <LinkRow to="/care" icon={Leaf} label={t("care.title")} />
        <LinkRow to="/history" icon={HistoryIcon} label={t("settings.history")} />
      </Card>

      <View style={styles.gap}>
        <SectionHeader icon={Globe} title={t("country.title")} subtitle={t("country.text")} />
        <CountryPicker
          value={country.code}
          onChange={(code) => {
            setCountry(code);
            toast(t("country.saved"));
          }}
        />
      </View>

      <View style={styles.gap}>
        <SectionHeader icon={Languages} title={t("settings.language")} subtitle={t("settings.languageText")} />
        <View style={styles.langGrid}>
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <Pressable
                key={l.code}
                onPress={() => setLang(l.code)}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                accessibilityLabel={l.label}
                style={[styles.langButton, active && styles.langActive]}
              >
                <T size="xl" accessible={false}>
                  {l.flag}
                </T>
                <T weight="semibold" numberOfLines={1} color={active ? colors.primary : colors.foreground} style={styles.flex}>
                  {l.label}
                </T>
                {active && <Icon as={Check} size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card style={styles.gap} onLayout={(e) => (taxiY.current = e.nativeEvent.layout.y)}>
        <View style={styles.titleRow}>
          <Icon as={Car} color={colors.primary} />
          <H2 style={styles.flex}>{t("settings.taxi")}</H2>
        </View>
        <TextField
          inputRef={taxiRef}
          label={t("settings.taxiText")}
          ltr
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          value={taxi}
          onChangeText={setTaxi}
          placeholder={t("settings.taxiPlaceholder")}
          onSubmitEditing={saveTaxi}
        />
        <Button variant="outline" icon={Save} label={t("common.save")} onPress={saveTaxi} />
      </Card>

      <Card tone={colors.ampel.orange} border="#F0C9A6" style={styles.gap}>
        <View style={styles.titleRow}>
          <Icon as={ShieldCheck} color={colors.ampel.orange.main} />
          <H2 color={colors.ampel.orange.main} style={styles.flex}>
            {t("settings.hintTitle")}
          </H2>
        </View>
        <T>{t("settings.hintText")}</T>
      </Card>

      <Card style={styles.list}>
        <H2 style={styles.listTitle}>{t("settings.legal")}</H2>
        <LinkRow to="/legal/impressum" icon={FileText} label={t("legal.impressum")} />
        <LinkRow to="/legal/datenschutz" icon={FileText} label={t("legal.datenschutz")} />
        <LinkRow to="/legal/haftungsausschluss" icon={FileText} label={t("legal.haftung")} />
      </Card>

      <Card style={styles.gap}>
        <View style={styles.titleRow}>
          <Icon as={Info} color={colors.primary} />
          <H2 style={styles.flex}>{t("settings.about")}</H2>
        </View>
        <T>{t("settings.aboutText")}</T>
        <Muted size="sm">{t("settings.version", { v: APP_VERSION })}</Muted>
        <Muted size="sm">{t("footer.rights", { year: new Date().getFullYear() })}</Muted>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  list: { paddingHorizontal: 8, paddingVertical: 8 },
  listTitle: { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 4 },
  linkRow: { minHeight: TAP, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 10, borderRadius: 12 },
  flex: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  langButton: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: TAP,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
  },
  langActive: { borderColor: colors.primary, backgroundColor: colors.accent },
});
