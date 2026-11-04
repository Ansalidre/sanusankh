/*
 * Erzeugt aus dem HTML-Bericht ein PDF auf dem Gerät und öffnet das Teilen-Menü.
 * Das PDF liegt im Cache-Ordner der App (nicht in der Gerätesicherung) und wird beim nächsten
 * Export und beim Löschen aller Messwerte entfernt.
 */
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const A4 = { width: 595, height: 842 };
const FOLDER = "messwerte";

/** Entfernt erzeugte Berichte (Fehler werden ignoriert – dann sind sie bereits weg). */
export function deleteReports() {
  if (Platform.OS === "web") return;
  try {
    const dir = new Directory(Paths.cache, FOLDER);
    if (dir.exists) dir.delete();
  } catch {
    // bereits entfernt
  }
}

/** PDF erzeugen und teilen. Im Browser öffnet sich stattdessen der Druckdialog. Wirft bei Fehlern. */
export async function shareReport({ html, fileName, dialogTitle }) {
  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }
  deleteReports();
  const { uri } = await Print.printToFileAsync({ html, ...A4 });
  const dir = new Directory(Paths.cache, FOLDER);
  dir.create({ intermediates: true, idempotent: true });
  const target = new File(dir, fileName);
  await new File(uri).move(target);
  if (!(await Sharing.isAvailableAsync())) throw new Error("sharing_unavailable");
  await Sharing.shareAsync(target.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle });
}
