import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import LegalNote from "@/components/LegalNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

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
};

function Field({ id, label, hint, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

/** Formular für einen Notfallpass. Speichert nichts selbst – `onSubmit(profile)` übernimmt das. */
export default function ProfileForm({ initial, onSubmit, onCancel }) {
  const { t } = useI18n();
  const [profile, setProfile] = useState(() => ({
    ...EMPTY_PROFILE,
    ...initial,
    contacts: initial?.contacts?.length ? initial.contacts : EMPTY_PROFILE.contacts,
  }));
  const [error, setError] = useState("");

  const set = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  const setContact = (index, key, value) =>
    setProfile((p) => ({ ...p, contacts: p.contacts.map((c, i) => (i === index ? { ...c, [key]: value } : c)) }));
  const addContact = () => setProfile((p) => ({ ...p, contacts: [...p.contacts, { name: "", relation: "", phone: "" }] }));
  const removeContact = (index) => setProfile((p) => ({ ...p, contacts: p.contacts.filter((_, i) => i !== index) }));

  const submit = (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      setError(t("pass.nameRequired"));
      document.getElementById("pf-name")?.focus();
      return;
    }
    onSubmit({
      ...profile,
      name: profile.name.trim(),
      contacts: profile.contacts.filter((c) => c.name.trim() || c.phone.trim()),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field id="pf-name" label={`${t("pass.name")} *`}>
        <Input
          id="pf-name"
          value={profile.name}
          onChange={(e) => {
            setError("");
            set("name")(e);
          }}
          autoComplete="name"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "pf-name-error" : undefined}
        />
        {error && (
          <p id="pf-name-error" className="text-sm font-semibold text-emergency" role="alert">
            {error}
          </p>
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pf-birth" label={t("pass.birth")}>
          <Input id="pf-birth" type="date" value={profile.birthDate} onChange={set("birthDate")} autoComplete="bday" />
        </Field>
        <Field id="pf-blood" label={t("pass.blood")}>
          <Select
            value={profile.bloodType || UNKNOWN}
            onValueChange={(value) => setProfile((p) => ({ ...p, bloodType: value === UNKNOWN ? "" : value }))}
          >
            <SelectTrigger id="pf-blood">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNKNOWN}>{t("pass.bloodUnknown")}</SelectItem>
              {BLOOD_TYPES.map((b) => (
                <SelectItem key={b} value={b}>
                  <span dir="ltr">{b}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field id="pf-conditions" label={t("pass.conditions")} hint={t("pass.multiHint")}>
        <Textarea id="pf-conditions" value={profile.conditions} onChange={set("conditions")} aria-describedby="pf-conditions-hint" />
      </Field>
      <Field id="pf-medications" label={t("pass.medications")} hint={t("pass.multiHint")}>
        <Textarea id="pf-medications" value={profile.medications} onChange={set("medications")} aria-describedby="pf-medications-hint" />
      </Field>
      <Field id="pf-allergies" label={t("pass.allergies")} hint={t("pass.multiHint")}>
        <Textarea id="pf-allergies" value={profile.allergies} onChange={set("allergies")} aria-describedby="pf-allergies-hint" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pf-doctor" label={t("pass.doctor")}>
          <Input id="pf-doctor" value={profile.doctorName} onChange={set("doctorName")} />
        </Field>
        <Field id="pf-doctor-phone" label={t("pass.doctorPhone")}>
          <Input id="pf-doctor-phone" type="tel" dir="ltr" value={profile.doctorPhone} onChange={set("doctorPhone")} />
        </Field>
      </div>

      <fieldset className="space-y-4">
        <legend className="mb-2 font-heading text-xl font-bold">{t("pass.contacts")}</legend>
        {profile.contacts.map((contact, i) => (
          <div key={i} className="card-soft space-y-3 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id={`pf-c${i}-name`} label={t("pass.contactName")}>
                <Input id={`pf-c${i}-name`} value={contact.name} onChange={(e) => setContact(i, "name", e.target.value)} />
              </Field>
              <Field id={`pf-c${i}-rel`} label={t("pass.contactRelation")}>
                <Input id={`pf-c${i}-rel`} value={contact.relation} onChange={(e) => setContact(i, "relation", e.target.value)} />
              </Field>
            </div>
            <Field id={`pf-c${i}-phone`} label={t("pass.contactPhone")}>
              <Input
                id={`pf-c${i}-phone`}
                type="tel"
                dir="ltr"
                value={contact.phone}
                onChange={(e) => setContact(i, "phone", e.target.value)}
              />
            </Field>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeContact(i)}>
              <Trash2 aria-hidden="true" />
              {t("pass.removeContact")}
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addContact}>
          <Plus aria-hidden="true" />
          {t("pass.addContact")}
        </Button>
      </fieldset>

      <LegalNote>{t("pass.localOnly")}</LegalNote>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="submit" size="lg">
          <Save aria-hidden="true" />
          {t("common.save")}
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
