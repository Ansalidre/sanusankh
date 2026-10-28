import { Pressable, StyleSheet } from "react-native";
import IconBubble from "@/components/IconBubble";
import { cardStyle } from "@/components/ui/Card";
import { Muted, T } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

/** Kachel mit Icon, Titel und Untertitel für den Schnellzugriff. */
export default function QuickTile({ icon, title, subtitle, onPress, tone = "default", accessibilityRole = "button" }) {
  const emergency = tone === "emergency";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={({ pressed }) => [
        styles.tile,
        emergency && { backgroundColor: colors.emergencySoft, borderColor: "#F3B8C1" },
        pressed && { borderColor: colors.primary, backgroundColor: colors.accent },
      ]}
    >
      <IconBubble icon={icon} size={44} bg={emergency ? colors.emergency : colors.accent} color={emergency ? "#fff" : colors.primary} />
      <T weight="heading" size="base">
        {title}
      </T>
      {subtitle ? <Muted size={14}>{subtitle}</Muted> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { ...cardStyle, flexBasis: "46%", flexGrow: 1, minHeight: 128, padding: 12, gap: 8 },
});
