import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { LocateFixed, RotateCcw, Settings } from "lucide-react-native";
import LegalNote from "@/components/LegalNote";
import MiniMap from "@/components/MiniMap";
import Notice from "@/components/Notice";
import PlaceList from "@/components/PlaceList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { findNearby, getPosition } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";

const ERROR_KEYS = {
  denied: "common.locDenied",
  servicesOff: "common.locServicesOff",
  unavailable: "common.locUnavailable",
  network: "common.netError",
};

/**
 * Standortbasierte Suche (Apotheken oder Kliniken) mit Lade-, Fehler- und Leer-Zuständen.
 * `alternatives` wird bei Fehlern und leerem Ergebnis angezeigt.
 */
export default function NearbyFinder({ kind, title, emergencyLabel, alternatives }) {
  const { t } = useI18n();
  const [state, setState] = useState({ status: "idle" });

  const search = async () => {
    try {
      setState((prev) => ({ status: "locating", origin: prev.origin }));
      const origin = state.origin || (await getPosition());
      setState({ status: "searching", origin });
      const places = await findNearby(kind, origin);
      setState({ status: places.length ? "done" : "empty", origin, places });
    } catch (error) {
      setState((prev) => ({ status: "error", code: error.code || "network", origin: prev.origin }));
    }
  };

  const busy = state.status === "locating" || state.status === "searching";
  const settingsHelp = state.code === "denied" || state.code === "servicesOff";

  return (
    <View style={styles.gap}>
      <H2>{title}</H2>

      {(state.status === "idle" || busy) && (
        <>
          <Button
            size="lg"
            icon={LocateFixed}
            loading={busy}
            label={state.status === "locating" ? t("common.locating") : state.status === "searching" ? t("common.searching") : t("common.locate")}
            onPress={search}
          />
          {busy && (
            <Muted align="center" accessibilityLiveRegion="polite">
              {state.status === "locating" ? t("common.locating") : t("common.searching")}
            </Muted>
          )}
          <LegalNote>{t("common.locPrivacy")}</LegalNote>
        </>
      )}

      {state.status === "error" && (
        <View style={styles.small}>
          <Notice weight="semibold">{t(ERROR_KEYS[state.code] || "common.netError")}</Notice>
          {settingsHelp && <Button variant="outline" icon={Settings} label={t("common.openSettings")} onPress={() => Linking.openSettings()} />}
          <Button variant="outline" icon={RotateCcw} label={t("common.retry")} onPress={search} />
        </View>
      )}

      {state.status === "empty" && (
        <Card style={styles.gap}>
          <T weight="semibold">{t("common.empty")}</T>
          <Button variant="outline" icon={RotateCcw} label={t("common.searchAgain")} onPress={search} />
        </Card>
      )}

      {state.status === "done" && (
        <>
          <MiniMap center={state.origin} places={state.places} />
          <Muted size="sm" accessibilityLiveRegion="polite">
            {t("common.results", { n: state.places.length })}
          </Muted>
          <PlaceList places={state.places} emergencyLabel={emergencyLabel} />
          <Button variant="outline" icon={RotateCcw} label={t("common.searchAgain")} onPress={search} />
        </>
      )}

      {(state.status === "error" || state.status === "empty") && alternatives && (
        <View style={styles.small}>
          <H3>{t("common.alternatives")}</H3>
          {alternatives}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  small: { gap: 8 },
});
