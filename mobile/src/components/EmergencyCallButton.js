import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Phone } from "lucide-react-native";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { FALLBACK_EMERGENCY } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { useCall } from "@/lib/links";
import { colors, radius } from "@/lib/theme";
import { useAnimatedValue } from "@/lib/useAnimatedValue";

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

/** Roter 112-Knopf mit pulsierendem Ring (aus bei „Bewegung reduzieren“). `size="hero"` für Notfall-Ergebnisse. */
export default function EmergencyCallButton({ label, size = "bar", pulse = true, style }) {
  const { t, country } = useI18n();
  const call = useCall();
  const number = country.emergency || FALLBACK_EMERGENCY;
  const reduceMotion = useReduceMotion();
  const ring = useAnimatedValue(0);
  const animate = pulse && !reduceMotion;

  useEffect(() => {
    if (!animate) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 1700, useNativeDriver: true }),
        Animated.delay(700),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      ring.setValue(0);
    };
  }, [animate, ring]);

  const hero = size === "hero";
  const text = label ?? t("common.call112");

  return (
    <View style={style}>
      {animate && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.ring,
            {
              opacity: ring.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.45, 0, 0] }),
              transform: [{ scaleX: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }, { scaleY: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
            },
          ]}
        />
      )}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          call(number);
        }}
        accessibilityRole="button"
        accessibilityLabel={text}
        style={({ pressed }) => [styles.button, hero && styles.hero, { backgroundColor: pressed ? colors.emergencyDark : colors.emergency }]}
      >
        <Icon as={Phone} color="#fff" size={hero ? 28 : 24} />
        <T weight="bold" size={hero ? "xl" : "lg"} color="#fff" align="center" style={styles.label}>
          {text}
        </T>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderRadius: radius.lg, backgroundColor: colors.emergency },
  button: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hero: { minHeight: 68 },
  label: { flexShrink: 1 },
});
