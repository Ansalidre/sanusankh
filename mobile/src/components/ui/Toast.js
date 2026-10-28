import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircleCheck } from "lucide-react-native";
import { T } from "@/components/ui/Text";
import { colors, radius, shadow } from "@/lib/theme";
import { useAnimatedValue } from "@/lib/useAnimatedValue";

const ToastContext = createContext(() => {});

/** Kurze Bestätigung am unteren Rand („Profil gespeichert“). */
export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const opacity = useAnimatedValue(0);
  const timer = useRef(null);
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (text) => {
      clearTimeout(timer.current);
      setMessage(text);
      AccessibilityInfo.announceForAccessibility(text);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMessage(null));
      }, 2600);
    },
    [opacity],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message && (
        <Animated.View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 90, opacity }]}>
          <View style={styles.toast}>
            <CircleCheck size={20} color="#fff" />
            <T weight="semibold" color="#fff" style={styles.text}>
              {message}
            </T>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, alignItems: "center" },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.foreground,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...shadow,
  },
  text: { flexShrink: 1 },
});
