import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { telHref } from "@/data/numbers";
import { routeUrl } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function PlaceList({ places, origin, emergencyLabel }) {
  const { t, lang } = useI18n();
  const km = (d) => d.toLocaleString(lang, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

  return (
    <ol className="space-y-3">
      {places.map((place, i) => (
        <li key={place.id} className="card-soft p-4">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                place.emergency ? "bg-emergency" : "bg-primary",
              )}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg leading-snug">{place.name || t("common.unnamed")}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-primary">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {t("common.distanceKm", { km: km(place.distanceKm) })}
              </p>
              {place.emergency && emergencyLabel && (
                <Badge variant="emergency" className="mt-2">
                  {emergencyLabel}
                </Badge>
              )}
              {place.address && <p className="mt-2 text-sm text-muted-foreground">{place.address}</p>}
              {place.openingHours && (
                <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="sr-only">{t("common.hours")}: </span>
                    <span dir="ltr">{place.openingHours}</span>
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={routeUrl(origin, place)}
              target="_blank"
              rel="noreferrer"
              className="tap gap-2 rounded-xl bg-primary px-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Navigation className="h-5 w-5" aria-hidden="true" />
              {t("common.route")}
              <span className="sr-only">({t("common.externalLink")})</span>
            </a>
            {place.phone ? (
              <a
                href={telHref(place.phone.split(";")[0])}
                className="tap gap-2 rounded-xl border-2 px-3 text-base font-semibold hover:bg-accent"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                {t("common.call")}
              </a>
            ) : (
              <span />
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
