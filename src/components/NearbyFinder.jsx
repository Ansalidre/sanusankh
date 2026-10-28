import { useState } from "react";
import { LoaderCircle, LocateFixed, RotateCcw, TriangleAlert } from "lucide-react";
import MiniMap from "@/components/MiniMap";
import PlaceList from "@/components/PlaceList";
import LegalNote from "@/components/LegalNote";
import { Button } from "@/components/ui/button";
import { findNearby, getPosition } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";

const ERROR_KEYS = {
  denied: "common.locDenied",
  unavailable: "common.locUnavailable",
  unsupported: "common.locUnsupported",
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
      setState({ status: "locating" });
      const origin = state.origin || (await getPosition());
      setState({ status: "searching", origin });
      const places = await findNearby(kind, origin);
      setState({ status: places.length ? "done" : "empty", origin, places });
    } catch (error) {
      setState((prev) => ({ status: "error", code: error.code || "network", origin: prev.origin }));
    }
  };

  const busy = state.status === "locating" || state.status === "searching";

  return (
    <section aria-labelledby={`nearby-${kind}`} className="space-y-4">
      <h2 id={`nearby-${kind}`} className="text-xl">
        {title}
      </h2>

      {(state.status === "idle" || busy) && (
        <>
          <Button size="lg" className="w-full" onClick={search} disabled={busy}>
            {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LocateFixed aria-hidden="true" />}
            {state.status === "locating" ? t("common.locating") : state.status === "searching" ? t("common.searching") : t("common.locate")}
          </Button>
          <LegalNote>{t("common.locPrivacy")}</LegalNote>
        </>
      )}

      {state.status === "error" && (
        <div className="card-soft border-ampel-orange/40 bg-ampel-orange-soft p-4" role="alert">
          <p className="flex items-start gap-2 font-semibold text-ampel-orange">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            {t(ERROR_KEYS[state.code] || "common.netError")}
          </p>
          {state.code !== "unsupported" && (
            <Button variant="outline" className="mt-3 w-full" onClick={search}>
              <RotateCcw aria-hidden="true" />
              {t("common.retry")}
            </Button>
          )}
        </div>
      )}

      {state.status === "empty" && (
        <div className="card-soft p-4">
          <p className="font-semibold">{t("common.empty")}</p>
          <Button variant="outline" className="mt-3 w-full" onClick={search}>
            <RotateCcw aria-hidden="true" />
            {t("common.searchAgain")}
          </Button>
        </div>
      )}

      {state.status === "done" && (
        <>
          <MiniMap center={state.origin} places={state.places} />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t("common.results", { n: state.places.length })}
          </p>
          <PlaceList places={state.places} origin={state.origin} emergencyLabel={emergencyLabel} />
          <Button variant="outline" className="w-full" onClick={search}>
            <RotateCcw aria-hidden="true" />
            {t("common.searchAgain")}
          </Button>
        </>
      )}

      {(state.status === "error" || state.status === "empty") && alternatives && (
        <div>
          <h3 className="mb-2 text-lg">{t("common.alternatives")}</h3>
          {alternatives}
        </div>
      )}
    </section>
  );
}
