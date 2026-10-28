/*
 * Foto der Patientenverfügung: wird in den privaten Dokumentenordner der App kopiert
 * (nicht in die Fotomediathek, nicht in die Cloud, nicht an einen Server).
 */
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { newId } from "@/lib/storage";

export class ScanError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // "permission" | "failed"
  }
}

/** Fotografieren (`camera`) oder aus den Fotos wählen. Liefert die URI der App-eigenen Kopie oder null (abgebrochen). */
export async function pickScan(source) {
  const permission =
    source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new ScanError("permission");
  const options = { mediaTypes: ["images"], quality: 0.7, allowsEditing: false };
  const result = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const picked = result.assets[0].uri;
  if (Platform.OS === "web") return picked; // Browser-Vorschau: keine Dateiablage
  try {
    const dir = new Directory(Paths.document, "vorsorge");
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const target = new File(dir, `${newId()}.jpg`);
    await new File(picked).copy(target);
    return target.uri;
  } catch {
    throw new ScanError("failed");
  }
}

/** Löscht eine gespeicherte Kopie (Fehler werden ignoriert – die Datei ist dann bereits weg). */
export function deleteScan(uri) {
  if (!uri || Platform.OS === "web") return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // bereits entfernt
  }
}
