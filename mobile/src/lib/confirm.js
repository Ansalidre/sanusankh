import { Alert, Platform } from "react-native";

/** Rückfrage vor einer nicht umkehrbaren Aktion (im Browser über window.confirm). */
export function confirm(title, text, confirmLabel, cancelLabel, onConfirm) {
  if (Platform.OS === "web") {
    if (globalThis.confirm?.(`${title}\n\n${text}`)) onConfirm();
    return;
  }
  Alert.alert(title, text, [
    { text: cancelLabel, style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
