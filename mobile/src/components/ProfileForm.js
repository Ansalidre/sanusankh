import { useRef, useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Camera, Image as ImageIcon, Plus, Save, Trash2 } from "lucide-react-native";
import { DateField } from "@/components/DateField";
import LegalNote from "@/components/LegalNote";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckRow } from "@/components/ui/CheckRow";
import { SelectField } from "@/components/ui/SelectField";
import { H2, Muted, T } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { useI18n } from "@/lib/i18n";
import { deleteScan, pickScan } from "@/lib/scans";

const BLOOD_TYPES = ["0+", "0−", "A+", "A−", "B+", "B−", "AB+", "AB−"];
const UNKNOWN = "unknown";

const EMPTY_PROFILE = {
  name: "",
  birthDate: "",
  bloodType: "",
  conditions: "",
  medications: "",
  allergies: "",
  doctorName: "",
  doctorPhone: "",
  contacts: [{ name: "", relation: "", phone: "" }],
  // Vorsorge (für Rettungskräfte im Vollbild sichtbar)
  directive: "", // "yes" | "no" | ""
  directiveLocation: "",
  proxyName: "",
  proxyPhone: "",
  directiveScan: "", // URI der App-eigenen Bildkopie (lib/scans.js)
  // Bestattungswünsche – nur sichtbar, wenn funeralShare
  funeralProvider: "",
  funeralPhone: "",
  funeralWishes: "",
  funeralShare: false,
};

/** Formular für einen Notfallpass. Speichert nichts selbst – `onSubmit(profile)` übernimmt das. */
export default function ProfileForm({ initial, onSubmit, onCancel }) {
  const { t } = useI18n();
  const nameRef = useRef(null);
  const [profile, setProfile] = useState(() => ({
    ...EMPTY_PROFILE,
    ...initial,
    contacts: initial?.contacts?.length ? initial.contacts : EMPTY_PROFILE.contacts,
  }));
  const [error, setError] = useState("");

  const set = (key) => (value) => setProfile((p) => ({ ...p, [key]: value }));
  const setContact = (index, key, value) =>
    setProfile((p) => ({ ...p, contacts: p.contacts.map((c, i) => (i === index ? { ...c, [key]: value } : c)) }));
  const addContact = () => setProfile((p) => ({ ...p, contacts: [...p.contacts, { name: "", relation: "", phone: "" }] }));
  const removeContact = (index) => setProfile((p) => ({ ...p, contacts: p.contacts.filter((_, i) => i !== index) }));

  const addScan = async (source) => {
    try {
      const uri = await pickScan(source);
      if (!uri) return;
      if (profile.directiveScan && profile.directiveScan !== initial?.directiveScan) deleteScan(profile.directiveScan);
      set("directiveScan")(uri);
    } catch (e) {
      Alert.alert(t("pass.scan"), t(e.code === "permission" ? "pass.scanPermission" : "pass.scanError"));
    }
  };

  // Die gespeicherte Datei wird erst beim Speichern bzw. Löschen des Profils entfernt (Abbrechen bleibt möglich).
  const removeScan = () => {
    if (profile.directiveScan !== initial?.directiveScan) deleteScan(profile.directiveScan);
    set("directiveScan")("");
  };

  const submit = () => {
    if (!profile.name.trim()) {
      setError(t("pass.nameRequired"));
      nameRef.current?.focus();
      return;
    }
    // Nicht mehr verwendete Bildkopien entfernen (ersetzt, gelöscht oder Verfügung auf „nein“ gesetzt)
    const scan = profile.directive === "yes" ? profile.directiveScan : "";
    for (const uri of new Set([initial?.directiveScan, profile.directiveScan])) {
      if (uri && uri !== scan) deleteScan(uri);
    }
    onSubmit({
      ...profile,
      directiveScan: scan,
      name: profile.name.trim(),
      contacts: profile.contacts.filter((c) => c.name.trim() || c.phone.trim()),
    });
  };

  return (
    <View style={styles.form}>
      <TextField
        inputRef={nameRef}
        label={`${t("pass.name")} *`}
        value={profile.name}
        onChangeText={(v) => {
          setError("");
          set("name")(v);
        }}
        autoComplete="name"
        textContentType="name"
        error={error || undefined}
      />

      <DateField label={t("pass.birth")} value={profile.birthDate} onChange={set("birthDate")} />

      <SelectField
        label={t("pass.blood")}
        value={profile.bloodType || UNKNOWN}
        onChange={(value) => set("bloodType")(value === UNKNOWN ? "" : value)}
        options={[{ value: UNKNOWN, label: t("pass.bloodUnknown") }, ...BLOOD_TYPES.map((b) => ({ value: b, label: b }))]}
      />

      <TextField label={t("pass.conditions")} hint={t("pass.multiHint")} multiline value={profile.conditions} onChangeText={set("conditions")} />
      <TextField label={t("pass.medications")} hint={t("pass.multiHint")} multiline value={profile.medications} onChangeText={set("medications")} />
      <TextField label={t("pass.allergies")} hint={t("pass.multiHint")} multiline value={profile.allergies} onChangeText={set("allergies")} />

      <TextField label={t("pass.doctor")} value={profile.doctorName} onChangeText={set("doctorName")} />
      <TextField
        label={t("pass.doctorPhone")}
        ltr
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        value={profile.doctorPhone}
        onChangeText={set("doctorPhone")}
      />

      <View style={styles.contacts}>
        <H2>{t("pass.contacts")}</H2>
        {profile.contacts.map((contact, i) => (
          <Card key={i} style={styles.contact}>
            <TextField label={t("pass.contactName")} value={contact.name} onChangeText={(v) => setContact(i, "name", v)} />
            <TextField label={t("pass.contactRelation")} value={contact.relation} onChangeText={(v) => setContact(i, "relation", v)} />
            <TextField
              label={t("pass.contactPhone")}
              ltr
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              value={contact.phone}
              onChangeText={(v) => setContact(i, "phone", v)}
            />
            <Button variant="ghost" size="sm" icon={Trash2} label={t("pass.removeContact")} onPress={() => removeContact(i)} style={styles.start} />
          </Card>
        ))}
        <Button variant="outline" icon={Plus} label={t("pass.addContact")} onPress={addContact} />
      </View>

      <View style={styles.contacts}>
        <H2>{t("pass.careTitle")}</H2>
        <Muted size="sm">{t("pass.sensitive")}</Muted>
        <SelectField
          label={t("pass.directive")}
          value={profile.directive || UNKNOWN}
          onChange={(value) => set("directive")(value === UNKNOWN ? "" : value)}
          options={[
            { value: UNKNOWN, label: t("pass.notStated") },
            { value: "yes", label: t("common.yes") },
            { value: "no", label: t("common.no") },
          ]}
        />
        {profile.directive === "yes" && (
          <>
            <TextField
              label={t("pass.directiveLocation")}
              placeholder={t("pass.directiveLocationHint")}
              value={profile.directiveLocation}
              onChangeText={set("directiveLocation")}
            />
            <View style={styles.scan}>
              <T weight="semibold">{t("pass.scan")}</T>
              {profile.directiveScan ? (
                <>
                  <Image source={{ uri: profile.directiveScan }} style={styles.scanImage} resizeMode="contain" accessibilityLabel={t("pass.scan")} />
                  <Button variant="ghost" size="sm" icon={Trash2} label={t("pass.scanRemove")} onPress={removeScan} style={styles.start} />
                </>
              ) : (
                <View style={styles.scanButtons}>
                  <Button variant="outline" icon={Camera} label={t("pass.scanCamera")} onPress={() => addScan("camera")} />
                  <Button variant="outline" icon={ImageIcon} label={t("pass.scanLibrary")} onPress={() => addScan("library")} />
                </View>
              )}
            </View>
          </>
        )}
        <TextField label={t("pass.proxyName")} value={profile.proxyName} onChangeText={set("proxyName")} />
        <TextField
          label={t("pass.proxyPhone")}
          ltr
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          value={profile.proxyPhone}
          onChangeText={set("proxyPhone")}
        />
      </View>

      <View style={styles.contacts}>
        <H2>{t("pass.funeralTitle")}</H2>
        <TextField label={t("pass.funeralProvider")} value={profile.funeralProvider} onChangeText={set("funeralProvider")} />
        <TextField
          label={t("pass.funeralPhone")}
          ltr
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          value={profile.funeralPhone}
          onChangeText={set("funeralPhone")}
        />
        <TextField label={t("pass.funeralWishes")} multiline value={profile.funeralWishes} onChangeText={set("funeralWishes")} />
        <CheckRow checked={profile.funeralShare} onChange={set("funeralShare")} label={t("pass.funeralShare")} hint={t("pass.funeralShareHint")} />
      </View>

      <LegalNote>{t("pass.localOnly")}</LegalNote>

      <View style={styles.actions}>
        <Button size="lg" icon={Save} label={t("common.save")} onPress={submit} />
        <Button size="lg" variant="outline" label={t("common.cancel")} onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 20 },
  contacts: { gap: 14 },
  contact: { gap: 12 },
  start: { alignSelf: "flex-start" },
  actions: { gap: 12 },
  scan: { gap: 8 },
  scanButtons: { gap: 8 },
  scanImage: { width: "100%", height: 220, borderRadius: 12, backgroundColor: "#F3F5F7" },
});
