import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { adminApi } from "./api";
import { BILLING_LABELS, commissionText, germanDate, money, selectClass, smallInputClass, STATUS_LABELS, STATUS_STYLES } from "./labels";

/** Eine Vermittlung: Status, Auftragswert, Abrechnung und interne Notiz direkt in der Zeile pflegen. */
function Row({ referral, onSaved }) {
  const [orderValue, setOrderValue] = useState(referral.orderValue == null ? "" : String(referral.orderValue).replace(".", ","));
  const [note, setNote] = useState(referral.note || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (patch) => {
    setBusy(true);
    setError("");
    try {
      const { referral: updated } = await adminApi(`/referrals/${referral.code}`, { method: "PATCH", body: patch });
      onSaved(updated);
    } catch (e) {
      setError(e.code === "invalid_order_value" ? "Ungültiger Betrag" : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  const model = commissionText(referral.commissionModel, referral.currency);

  return (
    <tr className="border-t border-border align-top">
      <td className="whitespace-nowrap p-2 font-mono font-semibold">{referral.code}</td>
      <td className="whitespace-nowrap p-2">{germanDate(referral.createdAt)}</td>
      <td className="p-2">
        <div className="font-semibold">{referral.partnerName}</div>
        <div className="text-muted-foreground">{referral.serviceTitle}</div>
      </td>
      <td className="p-2">
        <select
          aria-label={`Status ${referral.code}`}
          className={cn(selectClass, "min-w-36 font-semibold", STATUS_STYLES[referral.status])}
          value={referral.status}
          disabled={busy}
          onChange={(e) => save({ status: e.target.value })}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2">
        <Input
          aria-label={`Auftragswert ${referral.code}`}
          inputMode="decimal"
          className={cn(smallInputClass, "w-28")}
          value={orderValue}
          placeholder="–"
          disabled={busy}
          onChange={(e) => setOrderValue(e.target.value)}
          onBlur={() => {
            const current = referral.orderValue == null ? "" : String(referral.orderValue).replace(".", ",");
            if (orderValue.trim() !== current) save({ orderValue: orderValue.trim() || null });
          }}
        />
        <div className="mt-1 text-xs text-muted-foreground">{referral.currency}</div>
      </td>
      <td className="whitespace-nowrap p-2">
        <div className="font-semibold">{money(referral.commission, referral.currency)}</div>
        <div className="text-xs text-muted-foreground">{model}</div>
      </td>
      <td className="p-2">
        <select
          aria-label={`Abrechnung ${referral.code}`}
          className={selectClass}
          value={referral.billingStatus}
          disabled={busy}
          onChange={(e) => save({ billingStatus: e.target.value })}
        >
          {Object.entries(BILLING_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2">
        <Input
          aria-label={`Notiz ${referral.code}`}
          className={cn(smallInputClass, "min-w-40")}
          value={note}
          maxLength={500}
          placeholder="intern, keine Personendaten"
          disabled={busy}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== (referral.note || "") && save({ note })}
        />
        {error && <div className="mt-1 text-xs font-semibold text-emergency">{error}</div>}
      </td>
    </tr>
  );
}

export default function Referrals({ partners }) {
  const [filters, setFilters] = useState({ partner: "", status: "", from: "", to: "" });
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
      const data = await adminApi(`/referrals?${params}`);
      setList(data.referrals);
    } catch (e) {
      if (e.code !== "unauthorized") setError("Vermittlungen konnten nicht geladen werden.");
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const replace = (updated) => setList((l) => l.map((r) => (r.code === updated.code ? updated : r)));

  return (
    <section className="space-y-4 pt-2">
      <div className="grid gap-3 rounded-2xl border-2 border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="space-y-1">
          <Label htmlFor="f-partner">Bestatter</Label>
          <select id="f-partner" className={selectClass} value={filters.partner} onChange={set("partner")}>
            <option value="">alle</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-status">Status</Label>
          <select id="f-status" className={selectClass} value={filters.status} onChange={set("status")}>
            <option value="">alle</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-from">Angefragt von</Label>
          <Input id="f-from" type="date" className={smallInputClass} value={filters.from} onChange={set("from")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-to">bis</Label>
          <Input id="f-to" type="date" className={smallInputClass} value={filters.to} onChange={set("to")} />
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw aria-hidden /> Aktualisieren
        </Button>
      </div>

      {error && <p className="font-semibold text-emergency">{error}</p>}
      {list && (
        <p className="text-sm text-muted-foreground">
          {list.length} Vermittlung(en). Status und Auftragswert pflegst du hier; die Provision wird nach dem bei der Anfrage gültigen Modell berechnet – nur bei Bestattern mit Provisionsvereinbarung.
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border-2 border-border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-2">Code</th>
              <th className="p-2">Angefragt</th>
              <th className="p-2">Bestatter / Leistung</th>
              <th className="p-2">Status</th>
              <th className="p-2">Auftragswert</th>
              <th className="p-2">Provision</th>
              <th className="p-2">Abrechnung</th>
              <th className="p-2">Notiz</th>
            </tr>
          </thead>
          <tbody>
            {list?.map((r) => (
              <Row key={`${r.code}-${r.status}-${r.orderValue}-${r.billingStatus}`} referral={r} onSaved={replace} />
            ))}
            {list?.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-muted-foreground">
                  Keine Vermittlungen für diese Filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
