import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FlaskConical, HeartHandshake, Phone } from "lucide-react-native";
import Notice from "@/components/Notice";
import NumberCard from "@/components/NumberCard";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { SelectField } from "@/components/ui/SelectField";
import { H2 } from "@/components/ui/Text";
import { DEFAULT_COUNTRY, findNumber } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { prefs } from "@/lib/storage";

const ICONS = {
  emergency: "Siren",
  ambulance: "Ambulance",
  fire: "Flame",
  police: "ShieldAlert",
  oncall: "Stethoscope",
  advice: "Stethoscope",
  poison: "FlaskConical",
  crisis: "HeartHandshake",
  crisisAlt: "Phone",
};
const NATIONAL = ["ambulance", "fire", "police", "oncall", "advice"];
const CRISIS = ["crisis", "crisisAlt"];

/** Nummern des gewählten Landes aus src/content/countries.json. */
export default function Numbers() {
  const { t, country } = useI18n();
  const { focus } = useLocalSearchParams();
  const scrollRef = useRef(null);
  const poisonY = useRef(null);
  const scrolled = useRef(false);
  const [region, setRegion] = useState(() => prefs.get().poisonState || "");

  const emergency = findNumber(country, "emergency") || { kind: "emergency", number: country.emergency };
  const poison = findNumber(country, "poison");
  const poisonRegion = poison?.regions?.find((p) => p.region === region);
  const national = country.numbers.filter((n) => NATIONAL.includes(n.kind));
  const crisis = country.numbers.filter((n) => CRISIS.includes(n.kind));

  // Einmaliger Sprung zum Giftnotruf (Kachel auf der Startseite, Ergebnis „Vergiftung“).
  const scrollToPoison = () => {
    if (focus === "poison" && poisonY.current != null && !scrolled.current) {
      scrolled.current = true;
      scrollRef.current?.scrollTo({ y: Math.max(0, poisonY.current - 12), animated: true });
    }
  };
  useEffect(() => {
    const timer = setTimeout(scrollToPoison, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const chooseRegion = (value) => {
    setRegion(value);
    prefs.set({ poisonState: value });
  };

  const card = (n) => (
    <NumberCard
      key={`${n.kind}-${n.number}`}
      number={n.number}
      icon={ICONS[n.kind] || "Phone"}
      label={n.name || t(`num.${n.kind}`)}
      description={t(`num.${n.kind}Desc`)}
    />
  );

  return (
    <Screen title={t("numbers.title")} scrollRef={scrollRef}>
      <SectionHeader level={1} icon={Phone} title={t("numbers.title")} subtitle={t("numbers.intro")} />
      {country.code !== DEFAULT_COUNTRY && <Notice size="sm">{t("country.limited")}</Notice>}

      <View style={styles.gap}>
        <H2>{t("numbers.emergency")}</H2>
        <NumberCard emergency number={emergency.number} icon="Siren" label={t("num.emergency")} description={t("num.emergencyDesc")} />
      </View>

      {national.length > 0 && (
        <View style={styles.gap}>
          <H2>{t("numbers.national")}</H2>
          {national.map(card)}
        </View>
      )}

      {poison && (
        <View
          style={styles.gap}
          onLayout={(e) => {
            poisonY.current = e.nativeEvent.layout.y;
            scrollToPoison();
          }}
        >
          {poison.regions ? (
            <>
              <SectionHeader icon={FlaskConical} title={t("numbers.poisonTitle")} subtitle={t("numbers.poisonText")} />
              <SelectField
                label={t("numbers.selectState")}
                placeholder={t("numbers.selectState")}
                value={region}
                onChange={chooseRegion}
                options={poison.regions.map((p) => ({ value: p.region, label: p.region }))}
              />
              {poisonRegion && (
                <NumberCard
                  number={poisonRegion.phone}
                  icon="FlaskConical"
                  label={t("numbers.poisonCenter", { city: poisonRegion.city })}
                  description={t("num.poison")}
                />
              )}
            </>
          ) : (
            <>
              <H2>{t("num.poison")}</H2>
              {card(poison)}
            </>
          )}
        </View>
      )}

      {crisis.length > 0 && (
        <View style={styles.gap}>
          <SectionHeader icon={HeartHandshake} title={t("numbers.crisisTitle")} subtitle={t("numbers.crisisText")} />
          {crisis.map(card)}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
});
