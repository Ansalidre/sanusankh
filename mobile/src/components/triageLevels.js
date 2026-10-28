import { CircleAlert, CircleCheck, Clock, Siren } from "lucide-react-native";
import { colors } from "@/lib/theme";

/** Darstellung der Ampel-Stufen. */
export const LEVELS = {
  rot: { icon: Siren, ...colors.ampel.rot },
  orange: { icon: CircleAlert, ...colors.ampel.orange },
  gelb: { icon: Clock, ...colors.ampel.gelb },
  gruen: { icon: CircleCheck, ...colors.ampel.gruen },
};
