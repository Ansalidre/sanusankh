import { Pressable, StyleSheet, View } from "react-native";
import { Phone } from "lucide-react-native";
import IconBubble from "@/components/IconBubble";
import { cardStyle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { colors } from "@/lib/theme";

/** Tap-to-Call-Karte. `emergency` hebt die Karte rot hervor (112). */
export default function NumberCard({ number, label, description, icon = "Phone", emergency = false }) {
  const { t } = useI18n();
  const call = useCall();
  const fg = emergency ? "#fff" : colors.foreground;
  const sub = emergency ? "rgba(255,255,255,0.9)" : colors.mutedForeground;
  return (
    <Pressable
      onPress={() => call(number)}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${number}. ${t("common.call")}`}
      accessibilityHint={description}
      style={({ pressed }) => [
        styles.card,
        emergency && { backgroundColor: pressed ? colors.emergencyDark : colors.emergency, borderColor: colors.emergency },
        !emergency && pressed && { borderColor: colors.primary, backgroundColor: colors.accent },
      ]}
    >
      <IconBubble name={icon} size={48} bg={emergency ? "rgba(255,255,255,0.15)" : colors.accent} color={emergency ? "#fff" : colors.primary} />
      <View style={styles.text}>
        <T weight="semibold" color={fg}>
          {label}
        </T>
        {description ? (
          <T size="sm" color={sub}>
            {description}
          </T>
        ) : null}
      </View>
      <View style={styles.number}>
        <T ltr weight="black" size="xl" color={emergency ? "#fff" : colors.primary}>
          {number}
        </T>
        <View style={styles.callRow}>
          <Icon as={Phone} size={14} color={sub} />
          <T size="xs" weight="semibold" color={sub}>
            {t("common.call")}
          </T>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { ...cardStyle, minHeight: 80, flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  text: { flex: 1, gap: 2 },
  number: { alignItems: "flex-end", gap: 2, maxWidth: "45%" },
  callRow: { flexDirection: "row", alignItems: "center", gap: 4 },
});
