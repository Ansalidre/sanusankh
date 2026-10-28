import { useCallback } from "react";
import { Alert, Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useI18n } from "@/lib/i18n";

/** Macht aus einer Anzeige-Nummer eine tel:-URL. */
export function telHref(number) {
  return `tel:${String(number).replace(/[^\d+]/g, "")}`;
}

/** Liefert `call(number)`: öffnet die Telefon-App; schlägt das fehl (z. B. Tablet), kommt ein Hinweis mit der Nummer. */
export function useCall() {
  const { t } = useI18n();
  return useCallback(
    (number) => {
      Linking.openURL(telHref(number)).catch(() => {
        Alert.alert(String(number), t("common.callFailed", { number }));
      });
    },
    [t],
  );
}

/** Webseiten im In-App-Browser, alles andere (Karten-App, geo:) über das System. */
export function openExternal(url) {
  if (/^https?:\/\//.test(url) && !url.startsWith("https://maps.apple.com")) {
    return WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
  }
  return Linking.openURL(url).catch(() => {});
}
