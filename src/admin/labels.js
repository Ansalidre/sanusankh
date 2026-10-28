/* Deutsche Beschriftungen und Formatierung der Admin-Ansicht. */

export const STATUS_LABELS = {
  requested: "angefragt",
  contacted: "kontaktiert",
  commissioned: "beauftragt",
  invoiced: "abgerechnet",
  cancelled: "storniert",
};

export const BILLING_LABELS = {
  none: "nicht fällig",
  open: "offen",
  invoiced: "in Rechnung gestellt",
  paid: "bezahlt",
};

export const CONTRACT_LABELS = { draft: "Entwurf", active: "aktiv", paused: "pausiert", ended: "beendet" };

export const STATUS_STYLES = {
  requested: "bg-secondary text-secondary-foreground",
  contacted: "bg-accent text-accent-foreground",
  commissioned: "bg-ampel-gruen-soft text-ampel-gruen",
  invoiced: "bg-ampel-gruen text-white",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export function money(value, currency = "EUR") {
  if (value == null || value === "") return "–";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value);
}

export function germanDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export const selectClass =
  "min-h-[2.75rem] w-full rounded-lg border-2 border-input bg-card px-3 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30";
export const smallInputClass = "min-h-[2.75rem] rounded-lg px-3 text-sm";
