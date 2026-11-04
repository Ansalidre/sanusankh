/*
 * Messwerte-Tagebuch (Blutdruck, Blutzucker): reine Logik ohne React – Umrechnung, Eingabeprüfung,
 * Zeiträume und die Geometrie der Kurve (gemeinsam für App und PDF).
 *
 * Wichtig (MDR): Hier wird nichts bewertet. Keine Grenz-, Ziel- oder Normalwerte, keine Einfärbung
 * nach Höhe, keine Durchschnitte, Minima, Maxima oder Trends. Die Eingabebereiche unten fangen nur
 * Tippfehler ab und sind bewusst weit gefasst.
 */

export const KINDS = ["bp", "glucose"];
export const UNITS = ["mg/dl", "mmol/l"];
export const CONTEXTS = ["fasting", "afterMeal"];
export const PERIODS = [7, 30, 90];

/** Standardfaktor mg/dl ↔ mmol/l für Glukose. */
export const GLUCOSE_FACTOR = 18.016;

/** Technische Eingabebereiche (nur gegen Tippfehler, keine medizinische Bedeutung). */
export const INPUT_RANGES = {
  sys: { min: 30, max: 300, int: true },
  dia: { min: 30, max: 300, int: true },
  pulse: { min: 20, max: 250, int: true },
  "mg/dl": { min: 10, max: 1000, int: false },
  "mmol/l": { min: 0.5, max: 55, int: false },
};

/** "5,6" oder "5.6" → 5.6; leer → null; sonst NaN. */
export function parseNumber(text) {
  const s = String(text ?? "").trim().replace(",", ".");
  if (s === "") return null;
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

/**
 * Prüft ein Eingabefeld gegen seinen Eingabebereich. Liefert null (in Ordnung) oder
 * { min, max, int } für die neutrale Meldung „Bitte eine Zahl zwischen … und … eingeben“.
 */
export function checkInput(rangeKey, value, { optional = false } = {}) {
  const range = INPUT_RANGES[rangeKey];
  if (value == null) return optional ? null : range;
  if (Number.isNaN(value) || value < range.min || value > range.max) return range;
  if (range.int && !Number.isInteger(value)) return range;
  return null;
}

/** Rechnet einen Glukosewert in die Zieleinheit um (ungerundet). */
export function convertGlucose(value, from, to) {
  if (from === to) return value;
  return from === "mg/dl" ? value / GLUCOSE_FACTOR : value * GLUCOSE_FACTOR;
}

/** Nachkommastellen für die Anzeige: mg/dl ganzzahlig, mmol/l eine Stelle. */
export const unitDecimals = (unit) => (unit === "mmol/l" ? 1 : 0);

/** Zahl in Sprache `lang` mit fester Anzahl Nachkommastellen. */
export function formatNumber(value, lang, decimals = 0) {
  return Number(value).toLocaleString(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Lokale Zeit "YYYY-MM-DDTHH:MM" → Date (lokal). */
export const entryDate = (at) => new Date(`${at}:00`);

/** Date → "HH:MM" (lokal). */
export function toTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Beginn (00:00 des ersten Tags) und Ende (Ende des heutigen Tags) eines Zeitraums von `days` Tagen. */
export function periodRange(days, now = new Date()) {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { from, to };
}

/** Einträge einer Art im Zeitraum, chronologisch aufsteigend. */
export function entriesInRange(entries, kind, { from, to }) {
  return entries
    .filter((e) => e.kind === kind)
    .filter((e) => {
      const t = entryDate(e.at).getTime();
      return t >= from.getTime() && t <= to.getTime();
    })
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
}

/**
 * Kurvendaten für eine Art. Blutdruck: zwei Reihen (systolisch, diastolisch); Puls bewusst nicht.
 * Blutzucker: eine Reihe in `unit`; umgerechnete Einträge sind mit `converted` markiert.
 */
export function chartSeries(entries, kind, unit) {
  if (kind === "bp") {
    return [
      { key: "sys", dashed: false, marker: "circle", points: entries.map((e) => ({ t: entryDate(e.at).getTime(), v: e.sys })) },
      { key: "dia", dashed: true, marker: "square", points: entries.map((e) => ({ t: entryDate(e.at).getTime(), v: e.dia })) },
    ];
  }
  return [
    {
      key: "glucose",
      dashed: false,
      marker: "circle",
      points: entries.map((e) => ({ t: entryDate(e.at).getTime(), v: convertGlucose(e.value, e.unit, unit), converted: e.unit !== unit })),
    },
  ];
}

/**
 * Mindestspanne der Achse je Art und Einheit. Verhindert, dass kleine Unterschiede auf die volle Höhe
 * gedehnt werden und wie ein deutlicher Anstieg oder Abfall aussehen. Ist kein Bewertungsmaßstab.
 */
export function chartMinSpan(kind, unit) {
  if (kind === "bp") return 20;
  return unit === "mmol/l" ? 1 : 20;
}

/** „Schöne“ Schrittweite für etwa `count` Achsenabschnitte (1, 2, 2,5, 5 × 10^n). */
function niceStep(range, count = 4) {
  const raw = range / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw);
  return step ?? 10 * power;
}

/**
 * Geometrie der Kurve: Achse nur aus den eingetragenen Werten, gleichmäßige Hilfslinien,
 * keine Referenzlinien oder Bereiche. `formatY(v)` und `formatX(date)` liefern die Beschriftungen.
 */
export function buildChart({ series, from, to, width, height, minSpan = 1, formatY = String, formatX = (d) => d.toISOString().slice(0, 10) }) {
  const pad = { left: 44, right: 14, top: 12, bottom: 30 };
  const plot = { left: pad.left, top: pad.top, right: width - pad.right, bottom: height - pad.bottom };
  const values = series.flatMap((s) => s.points.map((p) => p.v));
  if (values.length === 0 || plot.right <= plot.left) return { width, height, plot, yTicks: [], xLabels: [], lines: [], empty: true };

  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < minSpan) {
    const center = (min + max) / 2;
    min = Math.max(0, center - minSpan / 2);
    max = min + minSpan;
  }
  const step = niceStep(max - min);
  const yMin = Math.floor(min / step) * step;
  const yMax = Math.ceil(max / step) * step;

  const t0 = from.getTime();
  const t1 = to.getTime();
  const x = (t) => plot.left + ((t - t0) / (t1 - t0)) * (plot.right - plot.left);
  const y = (v) => plot.bottom - ((v - yMin) / (yMax - yMin)) * (plot.bottom - plot.top);

  const yTicks = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) yTicks.push({ y: y(v), label: formatY(v) });

  const mid = new Date((t0 + t1) / 2);
  const xLabels = [
    { x: plot.left, label: formatX(from), anchor: "start" },
    { x: (plot.left + plot.right) / 2, label: formatX(mid), anchor: "middle" },
    { x: plot.right, label: formatX(to), anchor: "end" },
  ];

  const lines = series.map((s) => {
    const points = s.points.map((p) => ({ x: x(p.t), y: y(p.v), converted: Boolean(p.converted) }));
    const d = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    return { key: s.key, dashed: s.dashed, marker: s.marker, points, d };
  });

  return { width, height, plot, yTicks, xLabels, lines, empty: false };
}

/** Einträge nach Tag gruppiert, neueste zuerst: [{ day: "YYYY-MM-DD", entries }]. */
export function groupByDay(entries) {
  const sorted = [...entries].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const groups = [];
  for (const e of sorted) {
    const day = e.at.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.entries.push(e);
    else groups.push({ day, entries: [e] });
  }
  return groups;
}
