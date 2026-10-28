import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/** Lucide-Icon; `flip` spiegelt Richtungs-Icons (Pfeile, Chevrons) in RTL. */
export function Icon({ as: Component, size = 22, color = colors.foreground, flip = false, style, ...props }) {
  const { rtl } = useI18n();
  return (
    <Component
      size={size}
      color={color}
      strokeWidth={2.2}
      style={[flip && rtl && { transform: [{ scaleX: -1 }] }, style]}
      accessible={false}
      importantForAccessibility="no"
      {...props}
    />
  );
}
