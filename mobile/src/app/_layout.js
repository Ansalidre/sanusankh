import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Figtree_700Bold } from "@expo-google-fonts/figtree/700Bold";
import { Figtree_800ExtraBold } from "@expo-google-fonts/figtree/800ExtraBold";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { IBMPlexSansArabic_400Regular } from "@expo-google-fonts/ibm-plex-sans-arabic/400Regular";
import { IBMPlexSansArabic_500Medium } from "@expo-google-fonts/ibm-plex-sans-arabic/500Medium";
import { IBMPlexSansArabic_600SemiBold } from "@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold";
import { IBMPlexSansArabic_700Bold } from "@expo-google-fonts/ibm-plex-sans-arabic/700Bold";
import DisclaimerGate from "@/components/DisclaimerGate";
import { ToastProvider } from "@/components/ui/Toast";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { initStorage } from "@/lib/storage";
import { colors, fonts } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Schriften liegen im App-Paket – keine Verbindung zu Google Fonts.
  const [fontsLoaded, fontError] = useFonts({
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });
  const [storageReady, setStorageReady] = useState(false);
  const ready = (fontsLoaded || Boolean(fontError)) && storageReady;

  useEffect(() => {
    initStorage().finally(() => setStorageReady(true));
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ToastProvider>
          <RootStack />
          <DisclaimerGate />
        </ToastProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { rtl } = useI18n();
  const family = fonts[rtl ? "arabic" : "latin"];
  return (
    <View style={{ flex: 1, direction: rtl ? "rtl" : "ltr" }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: family.heading, color: colors.foreground },
          headerStyle: { backgroundColor: colors.card },
          headerShadowVisible: true,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile/show/[id]" options={{ headerShown: false, presentation: "fullScreenModal", animation: "fade" }} />
      </Stack>
    </View>
  );
}
