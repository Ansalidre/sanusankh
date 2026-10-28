import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import AppHeader from "@/components/AppHeader";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/**
 * Seitenrahmen. Tab-Seiten (`tab`) bekommen den App-Kopf, Unterseiten die native Kopfzeile mit `title`.
 * Die 112-Leiste steht fest über dem scrollenden Inhalt. `direction` setzt die Leserichtung (RTL).
 */
export default function Screen({ children, title, tab = false, emergencyBar = true, scrollRef, keyboard = false, contentStyle }) {
  const { rtl } = useI18n();
  const insets = useSafeAreaInsets();
  const direction = rtl ? "rtl" : "ltr";

  const content = (
    <ScrollView
      ref={scrollRef}
      style={[styles.flex, { direction }]}
      contentContainerStyle={[styles.content, { paddingBottom: (tab ? 0 : insets.bottom) + 32 }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {children}
    </ScrollView>
  );

  return (
    <View style={[styles.root, { direction }]}>
      {title != null && <Stack.Screen options={{ title }} />}
      {tab ? (
        <AppHeader emergencyBar={emergencyBar} />
      ) : (
        emergencyBar && (
          <View style={styles.bar}>
            <EmergencyCallButton />
          </View>
        )
      )}
      {keyboard && Platform.OS === "android" ? (
        <KeyboardAvoidingView style={styles.flex}>{content}</KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  bar: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: { padding: 16, gap: 24 },
});
