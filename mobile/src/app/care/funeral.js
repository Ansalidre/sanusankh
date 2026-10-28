import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Flower2, IdCard, LocateFixed, RotateCcw, Search, Settings } from "lucide-react-native";
import LegalNote from "@/components/LegalNote";
import MiniMap from "@/components/MiniMap";
import Notice from "@/components/Notice";
import PlaceList from "@/components/PlaceList";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { H2, Muted, T } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { isActivePartner, providersFor, providerUrl } from "@/lib/content";
import { distanceKm, findNearby, geocodePlace, getPosition } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

const ERROR_KEYS = {
  denied: "common.locDenied",
  servicesOff: "common.locServicesOff",
  unavailable: "common.locUnavailable",
  network: "common.netError",
  notFound: "funeral.placeNotFound",
};
const PARTNER_RADIUS_KM = 50;

/** Partner aus providers.json in der Nähe – gekennzeichnet als „Anzeige“. */
function partnersNear(countryCode, origin, adLabel) {
  return providersFor(countryCode, "funeral")
    .filter((p) => isActivePartner(p) && p.lat != null && p.lon != null)
    .map((p) => ({
      id: `partner/${p.id}`,
      name: p.name,
      lat: p.lat,
      lon: p.lon,
      address: p.address,
      phone: p.phone,
      website: providerUrl(p),
      badge: adLabel,
      distanceKm: distanceKm(origin, { lat: p.lat, lon: p.lon }),
    }))
    .filter((p) => p.distanceKm <= PARTNER_RADIUS_KM);
}

/** Bestatter in der Nähe – über den Gerätestandort oder einen eingegebenen Ort / eine PLZ. */
export default function Funeral() {
  const { t, country } = useI18n();
  const [place, setPlace] = useState("");
  const [state, setState] = useState({ status: "idle" });

  const run = async (locate) => {
    try {
      setState({ status: "searching" });
      const origin = await locate();
      const osm = await findNearby("funeral", origin);
      const partners = partnersNear(country.code, origin, t("partner.ad"));
      setState({ status: osm.length || partners.length ? "done" : "empty", origin, osm, partners });
    } catch (error) {
      setState({ status: "error", code: error.code || "network" });
    }
  };

  const byLocation = () => run(getPosition);
  const byPlace = () => place.trim() && run(() => geocodePlace(place, country.code));
  const busy = state.status === "searching";

  return (
    <Screen title={t("care.funeral")} emergencyBar={false} keyboard>
      <SectionHeader level={1} icon={Flower2} title={t("care.funeral")} subtitle={t("funeral.intro")} />

      <Card border={colors.calm.border} style={styles.gap}>
        <Button size="lg" icon={LocateFixed} loading={busy} label={t("common.locate")} onPress={byLocation} />
        <TextField
          label={t("funeral.place")}
          value={place}
          onChangeText={setPlace}
          returnKeyType="search"
          onSubmitEditing={byPlace}
          autoComplete="postal-code"
        />
        <Button variant="outline" icon={Search} label={t("funeral.placeSearch")} disabled={!place.trim() || busy} onPress={byPlace} />
        <LegalNote>{t("common.locPrivacy")}</LegalNote>
      </Card>

      {busy && <Muted accessibilityLiveRegion="polite">{t("common.searching")}</Muted>}

      {state.status === "error" && (
        <View style={styles.small}>
          <Notice weight="semibold">{t(ERROR_KEYS[state.code] || "common.netError")}</Notice>
          {(state.code === "denied" || state.code === "servicesOff") && (
            <Button variant="outline" icon={Settings} label={t("common.openSettings")} onPress={() => Linking.openSettings()} />
          )}
        </View>
      )}

      {state.status === "empty" && (
        <Card style={styles.small}>
          <T weight="semibold">{t("common.empty")}</T>
          <Button variant="outline" icon={RotateCcw} label={t("common.searchAgain")} onPress={byLocation} />
        </Card>
      )}

      {state.status === "done" && (
        <View style={styles.gap}>
          <MiniMap center={state.origin} places={[...state.partners, ...state.osm]} />
          {state.partners.length > 0 && (
            <View style={styles.small}>
              <H2>{t("partner.section")}</H2>
              <Muted size="sm">{t("partner.note")}</Muted>
              <PlaceList places={state.partners} />
            </View>
          )}
          <View style={styles.small}>
            <H2>{t("funeral.nearby")}</H2>
            <Muted size="sm">{t("common.results", { n: state.osm.length })}</Muted>
            <PlaceList places={state.osm} />
          </View>
        </View>
      )}

      <Card tone={colors.calm} border={colors.calm.border} style={styles.small}>
        <H2 size="lg" color={colors.calm.main}>
          {t("funeral.wishTitle")}
        </H2>
        <T>{t("funeral.wishText")}</T>
        <Button variant="outline" icon={IdCard} label={t("nav.pass")} onPress={() => router.navigate("/pass")} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  small: { gap: 8 },
});
