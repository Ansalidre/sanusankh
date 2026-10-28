import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "./api";
import { money, selectClass, smallInputClass } from "./labels";

/** Monatsübersicht der Provisionen pro Bestatter (Monat der Beauftragung) mit CSV-Export für die Rechnung. */
export default function Report({ partners }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [partner, setPartner] = useState("");
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");

  const query = `month=${month}${partner ? `&partner=${encodeURIComponent(partner)}` : ""}`;

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await adminApi(`/report?${query}`);
      setGroups(data.partners);
    } catch (e) {
      if (e.code !== "unauthorized") setError("Übersicht konnte nicht geladen werden.");
    }
  }, [query]);

  useEffect(() => {
    if (/^\d{4}-\d{2}$/.test(month)) load();
  }, [load, month]);

  const download = async () => {
    try {
      const res = await adminApi(`/report?${query}&format=csv`, { raw: true });
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `provisionen-${month}${partner ? `-${partner}` : ""}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("CSV konnte nicht erstellt werden.");
    }
  };

  return (
    <section className="space-y-4 pt-2">
      <div className="grid gap-3 rounded-2xl border-2 border-border bg-card p-4 sm:grid-cols-3 sm:items-end">
        <div className="space-y-1">
          <Label htmlFor="r-month">Monat der Beauftragung</Label>
          <Input id="r-month" type="month" className={smallInputClass} value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="r-partner">Bestatter</Label>
          <select id="r-partner" className={selectClass} value={partner} onChange={(e) => setPartner(e.target.value)}>
            <option value="">alle</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" onClick={download} disabled={!groups?.length}>
          <Download aria-hidden /> CSV exportieren
        </Button>
      </div>
      {error && <p className="font-semibold text-emergency">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border-2 border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-2">Bestatter</th>
              <th className="p-2 text-right">Angefragt</th>
              <th className="p-2 text-right">Storniert</th>
              <th className="p-2 text-right">Beauftragt</th>
              <th className="p-2 text-right">Auftragswerte</th>
              <th className="p-2 text-right">Provision</th>
            </tr>
          </thead>
          <tbody>
            {groups?.map((g) => (
              <tr key={g.partnerId} className="border-t border-border">
                <td className="p-2 font-semibold">{g.partnerName}</td>
                <td className="p-2 text-right">{g.requested}</td>
                <td className="p-2 text-right">{g.cancelled}</td>
                <td className="p-2 text-right">{g.commissioned}</td>
                <td className="p-2 text-right">{money(g.orderTotal, g.currency)}</td>
                <td className="p-2 text-right font-bold">{money(g.commissionTotal, g.currency)}</td>
              </tr>
            ))}
            {groups?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  Keine Vermittlungen in diesem Monat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        Angefragt und storniert zählen nach Anfragedatum, beauftragt und Provision nach dem Monat der Beauftragung. Die CSV-Datei enthält jede beauftragte
        Vermittlung einzeln und eine Summenzeile je Bestatter (Trennzeichen Semikolon, für Excel).
      </p>
    </section>
  );
}
