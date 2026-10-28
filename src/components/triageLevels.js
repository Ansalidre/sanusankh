import { CircleAlert, CircleCheck, Clock, Siren } from "lucide-react";

/** Darstellung der Ampel-Stufen. Klassen stehen ausgeschrieben, damit Tailwind sie findet. */
export const LEVELS = {
  rot: {
    icon: Siren,
    box: "border-ampel-rot bg-ampel-rot-soft",
    text: "text-ampel-rot",
    dot: "bg-ampel-rot",
  },
  orange: {
    icon: CircleAlert,
    box: "border-ampel-orange bg-ampel-orange-soft",
    text: "text-ampel-orange",
    dot: "bg-ampel-orange",
  },
  gelb: {
    icon: Clock,
    box: "border-ampel-gelb bg-ampel-gelb-soft",
    text: "text-ampel-gelb",
    dot: "bg-ampel-gelb",
  },
  gruen: {
    icon: CircleCheck,
    box: "border-ampel-gruen bg-ampel-gruen-soft",
    text: "text-ampel-gruen",
    dot: "bg-ampel-gruen",
  },
};
