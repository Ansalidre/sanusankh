import { StyleSheet, View } from "react-native";
import GuideIcon from "@/components/GuideIcon";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/lib/theme";

/** Icon in farbigem Quadrat – `name` (Datendateien) oder `icon` (lucide-Komponente). */
export default function IconBubble({ name, icon, size = 48, bg = colors.accent, color = colors.primary, round = false }) {
  const iconSize = Math.round(size / 2);
  return (
    <View style={[styles.bubble, { width: size, height: size, backgroundColor: bg, borderRadius: round ? size / 2 : size / 4 }]}>
      {icon ? <Icon as={icon} size={iconSize} color={color} /> : <GuideIcon name={name} size={iconSize} color={color} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
