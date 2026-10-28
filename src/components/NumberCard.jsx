import { Phone } from "lucide-react";
import GuideIcon from "@/components/GuideIcon";
import { telHref } from "@/data/numbers";
import { cn } from "@/lib/utils";

/** Tap-to-Call-Karte. `emergency` hebt die Karte rot hervor (112). */
export default function NumberCard({ number, label, description, icon = "Phone", emergency = false, callLabel }) {
  return (
    <a
      href={telHref(number)}
      aria-label={`${label}: ${number}`}
      className={cn(
        "card-soft flex min-h-[4.5rem] items-center gap-4 p-4 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        emergency ? "border-emergency bg-emergency text-white hover:bg-emergency-dark" : "hover:border-primary/40",
      )}
    >
      <span
        className={cn(
          "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          emergency ? "bg-white/15 text-white" : "bg-accent text-primary",
        )}
      >
        <GuideIcon name={icon} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-semibold leading-snug", emergency ? "text-white" : "text-foreground")}>{label}</span>
        {description && (
          <span className={cn("mt-0.5 block text-sm", emergency ? "text-white/90" : "text-muted-foreground")}>{description}</span>
        )}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className={cn("ltr-nums font-heading text-xl font-extrabold", emergency ? "text-white" : "text-primary")}>
          {number}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold",
            emergency ? "text-white/90" : "text-muted-foreground",
          )}
        >
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          {callLabel}
        </span>
      </span>
    </a>
  );
}
