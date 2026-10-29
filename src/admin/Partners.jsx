import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, hasCommission, isPartnerBookable, isPartnerVisible } from "../../netlify/lib/model.mjs";
import { adminApi } from "./api";
import { commissionText, CONTRACT_LABELS, germanDate, money, selectClass, smallInputClass } from "./labels";

const EMPTY = {
  id: "",
  name: "",
  country: "DE",
  address: "",
  lat: "",
  lon: "",
  phone: "",
  website: "",
  logo: "",
  tracking: "utm_source=sanusankh&utm_medium=app&utm_campaign=bestatter",
  priority: 10,
  active: true,
  demo: false,
  discount: { type: "percent", value: "", conditions: "", validFrom: "", validTo: "" },
  services: [{ id: "vorsorgegespraech", title: "Kostenloses Vorsorgegespräch", description: "", priceFrom: "" }],
  contact: { email: "", webhookUrl: "", webhookSecret: "" },
  commission: { agreed: false, type: "percent", value: "", from: "", to: "" },
  contract: { status: "draft", from: "", to: "", contactName: "", contactEmail: "", contactPhone: "" },
};

const today = () => new Date().toISOString().slice(0, 10);

function Field({ id, label, hint, children }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, note, internal, children }) {
  return (
    <fieldset className={`space-y-3 rounded-2xl border-2 p-4 ${internal ? "border-ampel-orange/40 bg-ampel-orange-soft/40" : "border-border"}`}>
      <legend className="px-1 font-heading font-bold">
        {title} {internal && <Badge className="ms-2 bg-ampel-orange text-white">intern – nie in der App</Badge>}
      </legend>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      {children}
    </fieldset>
  );
}

/** Formular für einen Kooperations-Bestatter (öffentliche und interne Felder getrennt gekennzeichnet). */
function Editor({ initial, isNew, onDone }) {
  const [p, setP] = useState(initial);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const set = (path) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setP((current) => {
      const next = structuredClone(current);
      const keys = path.split(".");
      let obj = next;
      for (const k of keys.slice(0, -1)) obj = obj[k];
      obj[keys.at(-1)] = value;
      return next;
    });
  };
  const input = (path, props = {}) => {
    const id = `p-${path.replace(/\./g, "-")}`;
    const value = path.split(".").reduce((o, k) => o?.[k], p);
    return <Input id={id} className={smallInputClass} value={value ?? ""} onChange={set(path)} {...props} />;
  };

  const save = async () => {
    setBusy(true);
    setErrors([]);
    try {
      await adminApi(`/partners/${encodeURIComponent(p.id.trim().toLowerCase())}`, { method: "PUT", body: p });
      onDone(true);
    } catch (e) {
      setErrors(e.data?.fields || ["Speichern fehlgeschlagen"]);
      setBusy(false);
    }
  };

  const services = p.services;
  const setServices = (list) => setP((c) => ({ ...c, services: list }));

  return (
    <div className="space-y-4 rounded-2xl border-2 border-primary bg-card p-4">
      <h2 className="font-heading text-xl font-bold">{isNew ? "Neuer Kooperations-Bestatter" : p.name}</h2>

      <Section title="Stammdaten" note="Öffentlich: erscheint in der App.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="p-id" label="Kennung (ID)" hint="a–z, 0–9, Bindestrich; nicht änderbar">
            {input("id", { disabled: !isNew, placeholder: "bestatter-musterstadt" })}
          </Field>
          <Field id="p-name" label="Name">
            {input("name")}
          </Field>
          <Field id="p-country" label="Land">
            <select id="p-country" className={selectClass} value={p.country} onChange={set("country")}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field id="p-address" label="Adresse">
            {input("address")}
          </Field>
          <Field id="p-lat" label="Breitengrad" hint="z. B. 52.532 – für die Umkreissuche (50 km)">
            {input("lat", { inputMode: "decimal" })}
          </Field>
          <Field id="p-lon" label="Längengrad">
            {input("lon", { inputMode: "decimal" })}
          </Field>
          <Field id="p-phone" label="Telefon">
            {input("phone", { type: "tel" })}
          </Field>
          <Field id="p-website" label="Website (https)">
            {input("website", { type: "url" })}
          </Field>
          <Field id="p-logo" label="Logo (https)" hint="wird in der App noch nicht angezeigt">
            {input("logo", { type: "url" })}
          </Field>
          <Field id="p-tracking" label="Tracking-Parameter" hint="ohne personenbezogene Daten">
            {input("tracking")}
          </Field>
          <Field id="p-priority" label="Priorität" hint="kleiner = weiter oben">
            {input("priority", { type: "number" })}
          </Field>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={p.active} onChange={set("active")} /> aktiv
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={p.demo} onChange={set("demo")} /> Demo (nur in Entwicklungs-Builds sichtbar)
            </label>
          </div>
        </div>
      </Section>

      <Section title="Rabatt für App-Nutzer" note="Öffentlich: erscheint mit Bedingungen und Gültigkeit in der App.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="p-discount-type" label="Art">
            <select id="p-discount-type" className={selectClass} value={p.discount.type} onChange={set("discount.type")}>
              <option value="percent">Prozent</option>
              <option value="amount">fester Betrag</option>
              <option value="none">kein Rabatt</option>
            </select>
          </Field>
          <Field id="p-discount-value" label={p.discount.type === "amount" ? "Betrag" : "Prozent"}>
            {input("discount.value", { inputMode: "decimal", disabled: p.discount.type === "none" })}
          </Field>
          <Field id="p-discount-validFrom" label="gültig von">
            {input("discount.validFrom", { type: "date" })}
          </Field>
          <Field id="p-discount-validTo" label="gültig bis">
            {input("discount.validTo", { type: "date" })}
          </Field>
        </div>
        <Field id="p-discount-conditions" label="Bedingungen (Freitext)">
          <Textarea id="p-discount-conditions" value={p.discount.conditions} maxLength={600} onChange={set("discount.conditions")} />
        </Field>
      </Section>

      <Section title="Buchbare Leistungen" note="Öffentlich. Richtpreis „ab …“ optional; leer = „Preis auf Anfrage“.">
        {services.map((s, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_8rem_auto] sm:items-end">
            <Field id={`s-${i}-title`} label="Titel">
              <Input id={`s-${i}-title`} className={smallInputClass} value={s.title} onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
            </Field>
            <Field id={`s-${i}-id`} label="Kennung">
              <Input id={`s-${i}-id`} className={smallInputClass} value={s.id} onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)))} />
            </Field>
            <Field id={`s-${i}-price`} label="ab (Betrag)">
              <Input
                id={`s-${i}-price`}
                className={smallInputClass}
                inputMode="decimal"
                value={s.priceFrom ?? ""}
                onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, priceFrom: e.target.value } : x)))}
              />
            </Field>
            <Button variant="ghost" size="sm" aria-label={`Leistung ${i + 1} entfernen`} onClick={() => setServices(services.filter((_, j) => j !== i))}>
              <Trash2 aria-hidden />
            </Button>
            <div className="sm:col-span-4">
              <Field id={`s-${i}-desc`} label="Beschreibung">
                <Textarea
                  id={`s-${i}-desc`}
                  value={s.description}
                  maxLength={500}
                  onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))}
                />
              </Field>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setServices([...services, { id: "", title: "", description: "", priceFrom: "" }])}>
          <Plus aria-hidden /> Leistung hinzufügen
        </Button>
      </Section>

      <Section internal title="Kontaktweg für Anfragen" note="Anfragen gehen per E-Mail und/oder Webhook an den Bestatter.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="p-contact-email" label="E-Mail für Anfragen">
            {input("contact.email", { type: "email" })}
          </Field>
          <Field id="p-contact-webhookUrl" label="Webhook-URL (optional, https)">
            {input("contact.webhookUrl", { type: "url" })}
          </Field>
        </div>
        {p.contact.webhookSecret && (
          <p className="text-sm">
            Webhook-Geheimnis für die Signaturprüfung beim Bestatter: <code className="break-all rounded bg-muted px-1">{p.contact.webhookSecret}</code>
          </p>
        )}
      </Section>

      <Section
        internal
        title="Provision"
        note="Nur mit unterschriebenem Kooperationsvertrag ankreuzen. Erst dann zeigt die App den Provisionshinweis und die Vermittlung bekommt ein Provisionsmodell."
      >
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={p.commission.agreed} onChange={set("commission.agreed")} /> Provisionsvereinbarung liegt vor
        </label>
        {p.commission.agreed && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="p-commission-type" label="Art">
              <select id="p-commission-type" className={selectClass} value={p.commission.type} onChange={set("commission.type")}>
                <option value="percent">Prozent vom Auftragswert</option>
                <option value="fixed">Festbetrag pro Buchung</option>
              </select>
            </Field>
            <Field id="p-commission-value" label={p.commission.type === "fixed" ? "Betrag" : "Prozent"} hint="gilt für neue Anfragen; bestehende behalten ihr Modell">
              {input("commission.value", { inputMode: "decimal" })}
            </Field>
            <Field id="p-commission-from" label="Vereinbarung ab">
              {input("commission.from", { type: "date" })}
            </Field>
            <Field id="p-commission-to" label="Vereinbarung bis" hint="leer = unbefristet">
              {input("commission.to", { type: "date" })}
            </Field>
          </div>
        )}
      </Section>

      <Section internal title="Freischaltung in der App" note="Nur bei Status „freigeschaltet“ (und im Zeitraum, falls angegeben) erscheint der Bestatter in der App. Ein Vertrag ist dafür nicht nötig – der Bestatter muss nur zugestimmt haben, gelistet zu werden und Anfragen zu bekommen.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field id="p-contract-status" label="Status">
            <select id="p-contract-status" className={selectClass} value={p.contract.status} onChange={set("contract.status")}>
              {Object.entries(CONTRACT_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field id="p-contract-from" label="sichtbar ab" hint="optional">
            {input("contract.from", { type: "date" })}
          </Field>
          <Field id="p-contract-to" label="sichtbar bis" hint="optional">
            {input("contract.to", { type: "date" })}
          </Field>
          <Field id="p-contract-contactName" label="Ansprechpartner">
            {input("contract.contactName")}
          </Field>
          <Field id="p-contract-contactEmail" label="E-Mail Ansprechpartner">
            {input("contract.contactEmail", { type: "email" })}
          </Field>
          <Field id="p-contract-contactPhone" label="Telefon Ansprechpartner">
            {input("contract.contactPhone", { type: "tel" })}
          </Field>
        </div>
      </Section>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc space-y-1 rounded-lg bg-emergency-soft p-3 ps-8 text-sm font-semibold text-emergency-dark">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={busy || !p.id || !p.name}>
          Speichern
        </Button>
        <Button variant="outline" onClick={() => onDone(false)}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}

/** Liste der Kooperations-Bestatter mit Freischaltung und Provision; Bearbeiten öffnet das Formular. */
export default function Partners({ partners, reload }) {
  const [editing, setEditing] = useState(null);
  const day = today();

  const toForm = (partner) => ({
    ...EMPTY,
    ...partner,
    lat: partner.lat ?? "",
    lon: partner.lon ?? "",
    discount: { ...EMPTY.discount, ...partner.discount, value: partner.discount?.value ?? "" },
    services: partner.services.map((s) => ({ ...s, priceFrom: s.priceFrom ?? "" })),
    contact: { ...EMPTY.contact, ...partner.contact },
    commission: { ...EMPTY.commission, ...partner.commission, agreed: partner.commission?.agreed === true, value: partner.commission?.value ?? "" },
    contract: { ...EMPTY.contract, ...partner.contract },
  });

  const remove = async (partner) => {
    if (!window.confirm(`„${partner.name}“ löschen? Bestehende Vermittlungen bleiben erhalten. Alternativ die Freischaltung auf „beendet“ setzen.`)) return;
    await adminApi(`/partners/${encodeURIComponent(partner.id)}`, { method: "DELETE" }).catch(() => {});
    reload();
  };

  if (editing) {
    return (
      <div className="pt-2">
        <Editor
          initial={editing.partner}
          isNew={editing.isNew}
          onDone={(saved) => {
            setEditing(null);
            if (saved) reload();
          }}
        />
      </div>
    );
  }

  return (
    <section className="space-y-4 pt-2">
      <Button onClick={() => setEditing({ partner: structuredClone(EMPTY), isNew: true })}>
        <Plus aria-hidden /> Bestatter anlegen
      </Button>
      <div className="grid gap-3 lg:grid-cols-2">
        {partners.map((p) => {
          const visible = isPartnerVisible(p, day);
          const bookable = isPartnerBookable(p, day);
          return (
            <article key={p.id} className="space-y-2 rounded-2xl border-2 border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-lg font-bold">{p.name}</h3>
                <Badge variant={visible ? "default" : "outline"}>{visible ? "in der App sichtbar" : "nicht sichtbar"}</Badge>
                {visible && !bookable && <Badge variant="emergency">keine Anfragen möglich</Badge>}
                {p.demo && <Badge variant="secondary">Demo</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {p.country} · {p.address || "ohne Adresse"} · {p.services.length} Leistung(en)
              </p>
              <p className="text-sm">
                Freischaltung: <strong>{CONTRACT_LABELS[p.contract.status]}</strong>
                {(p.contract.from || p.contract.to) && ` · ${germanDate(p.contract.from) || "…"} – ${germanDate(p.contract.to) || "…"}`}
                {p.contract.contactName && ` · ${p.contract.contactName}`}
              </p>
              <p className="text-sm">
                Rabatt: {p.discount.type === "none" ? "keiner" : p.discount.type === "percent" ? `${p.discount.value} %` : money(p.discount.value, p.currency)} · Provision:{" "}
                {hasCommission(p, day) ? commissionText(p.commission, p.currency) : p.commission?.agreed ? "Vereinbarung nicht im Zeitraum" : "keine Vereinbarung"}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setEditing({ partner: toForm(p), isNew: false })}>
                  Bearbeiten
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p)}>
                  <Trash2 aria-hidden /> Löschen
                </Button>
              </div>
            </article>
          );
        })}
        {partners.length === 0 && <p className="text-muted-foreground">Noch keine Kooperations-Bestatter angelegt.</p>}
      </div>
    </section>
  );
}
