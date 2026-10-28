/*
 * Lokale Erinnerungen an Ablaufdaten der Hausapotheke (expo-notifications, ohne Server, ohne Push-Token).
 * Pro Artikel zwei Termine: 14 Tage vorher und am Ablauftag, jeweils 9 Uhr.
 */
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const SOON_DAYS = 14;
const supported = Platform.OS !== "web";

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

const atNine = (isoDate, minusDays = 0) => {
  const d = new Date(`${isoDate}T09:00:00`);
  d.setDate(d.getDate() - minusDays);
  return d;
};

async function cancel(id) {
  await Promise.all(
    [`cabinet-${id}-soon`, `cabinet-${id}-expired`].map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {}),
    ),
  );
}

/**
 * Plant die Erinnerungen für einen Artikel neu (oder löscht sie, wenn `expires` leer ist).
 * Fragt beim ersten Mal nach der Erlaubnis; ohne Erlaubnis bleibt der Hinweis in der App.
 */
export async function scheduleExpiry({ id, title, expires, texts }) {
  if (!supported) return;
  try {
    await cancel(id);
    if (!expires) return;
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== "granted") return;
    const now = Date.now();
    const plan = [
      { identifier: `cabinet-${id}-soon`, date: atNine(expires, SOON_DAYS), body: texts.soon },
      { identifier: `cabinet-${id}-expired`, date: atNine(expires), body: texts.expired },
    ];
    for (const { identifier, date, body } of plan) {
      if (date.getTime() <= now) continue;
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: { title, body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  } catch {
    // Erinnerungen sind eine Zusatzfunktion – der Hinweis in der App funktioniert auch ohne.
  }
}

/** "expired" | "soon" | null für ein Ablaufdatum (YYYY-MM-DD). */
export function expiryState(expires, today = new Date()) {
  if (!expires) return null;
  const end = new Date(`${expires}T23:59:59`);
  if (end < today) return "expired";
  const soon = new Date(today);
  soon.setDate(soon.getDate() + SOON_DAYS);
  return end <= soon ? "soon" : null;
}
