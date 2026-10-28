import { StyleSheet, View } from "react-native";
import IconBubble from "@/components/IconBubble";
import { H1, H2, Muted } from "@/components/ui/Text";

/** Überschrift mit Icon und optionalem Untertitel. `level={1}` für Seitentitel. */
export default function SectionHeader({ icon, title, subtitle, level = 2 }) {
  const Heading = level === 1 ? H1 : H2;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {icon && <IconBubble icon={icon} size={level === 1 ? 48 : 40} />}
        <Heading style={styles.flex} size={level === 1 ? "2xl" : "xl"}>
          {title}
        </Heading>
      </View>
      {subtitle ? <Muted>{subtitle}</Muted> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
});
