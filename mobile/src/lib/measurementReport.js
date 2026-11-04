/*
 * PDF des Messwerte-Tagebuchs zum Mitnehmen in die Arztpraxis. Der HTML-Bericht entsteht nur auf dem Gerät
 * (expo-print), das Teilen läuft über das Teilen-Menü des Handys (expo-sharing) – nichts geht an unseren Server.
 *
 * Sprache: Deutsch; bei anderer App-Sprache zweisprachig „App-Sprache / Deutsch“. Zahlen und Daten im
 * deutschen Format. Inhalt wie in der App: nur die eingetragenen Werte, keine Bewertung (MDR).
 */
import { buildChart, chartMinSpan, chartSeries, convertGlucose, entriesInRange, formatNumber, periodRange, unitDecimals } from "./measurements";

const DE = "de";
const CHART = { width: 515, height: 200 };

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const deDate = (d) => d.toLocaleDateString(DE, { day: "2-digit", month: "2-digit", year: "numeric" });
const deShortDate = (d) => d.toLocaleDateString(DE, { day: "2-digit", month: "2-digit" });

/** SVG-Markup derselben neutralen Kurve wie in der App (eine Farbe, keine Referenzlinien). */
function chartSvg(series, range, minSpan, formatY) {
  const chart = buildChart({ series, ...range, ...CHART, minSpan, formatY, formatX: deShortDate });
  if (chart.empty) return "";
  const ink = "#0C495A";
  const grid = chart.yTicks
    .map(
      (t) =>
        `<line x1="${chart.plot.left}" x2="${chart.plot.right}" y1="${t.y}" y2="${t.y}" stroke="#DBE1E6"/>` +
        `<text x="${chart.plot.left - 8}" y="${t.y + 4}" text-anchor="end">${escapeHtml(t.label)}</text>`,
    )
    .join("");
  const xLabels = chart.xLabels.map((l) => `<text x="${l.x}" y="${chart.height - 8}" text-anchor="${l.anchor}">${escapeHtml(l.label)}</text>`).join("");
  const lines = chart.lines
    .map((line) => {
      const path = `<path d="${line.d}" stroke="${ink}" stroke-width="2" fill="none"${line.dashed ? ' stroke-dasharray="6 5"' : ""}/>`;
      const marks = line.points
        .map((p) =>
          line.marker === "square"
            ? `<rect x="${p.x - 4}" y="${p.y - 4}" width="8" height="8" fill="#fff" stroke="${ink}" stroke-width="2"/>`
            : `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${p.converted ? "#fff" : ink}" stroke="${ink}" stroke-width="2"/>`,
        )
        .join("");
      return path + marks;
    })
    .join("");
  return `<svg width="${chart.width}" height="${chart.height}" viewBox="0 0 ${chart.width} ${chart.height}" font-size="11" font-family="Helvetica, Arial, sans-serif" fill="#55636D">${grid}${xLabels}${lines}</svg>`;
}

/**
 * Baut das HTML des Berichts. `t(lang, key, vars)` schlägt Texte nach (src/lib/translations.js).
 * Enthalten sind beide Arten mit Einträgen im Zeitraum von `days` Tagen bis `now`.
 */
export function buildReportHtml({ entries, days, now = new Date(), lang, printName, glucoseUnit, t }) {
  const bilingual = lang !== DE;
  const L = (key, vars) => {
    const de = t(DE, key, vars);
    if (!bilingual) return escapeHtml(de);
    const own = t(lang, key, vars);
    return own === de ? escapeHtml(de) : `${escapeHtml(own)} / ${escapeHtml(de)}`;
  };
  const range = periodRange(days, now);
  const bp = entriesInRange(entries, "bp", range);
  const glucose = entriesInRange(entries, "glucose", range);
  const unit = glucoseUnit;
  const dec = unitDecimals(unit);
  const when = (e) => {
    const d = new Date(`${e.at}:00`);
    return `<td class="nowrap">${deDate(d)}</td><td class="nowrap">${e.at.slice(11, 16)}</td>`;
  };
  const note = (e) => `<td>${escapeHtml(e.note)}</td>`;

  const sections = [];

  if (bp.length) {
    const rows = bp
      .map(
        (e) =>
          `<tr>${when(e)}<td class="num">${e.sys}</td><td class="num">${e.dia}</td><td class="num">${e.pulse ?? ""}</td>${note(e)}</tr>`,
      )
      .join("");
    sections.push(`
      <h2>${L("meas.bp")}</h2>
      <div class="chart">${chartSvg(chartSeries(bp, "bp"), range, chartMinSpan("bp"), (v) => formatNumber(v, DE))}</div>
      <p class="legend">— ${L("meas.sys")} &nbsp; - - ${L("meas.dia")} · mmHg</p>
      <table>
        <thead><tr><th>${L("meas.date")}</th><th>${L("meas.time")}</th><th>${L("meas.sysShort")}</th><th>${L("meas.diaShort")}</th><th>${L("meas.pulseShort")}</th><th>${L("meas.note")}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`);
  }

  if (glucose.length) {
    const anyConverted = glucose.some((e) => e.unit !== unit);
    const rows = glucose
      .map((e) => {
        const shown = formatNumber(convertGlucose(e.value, e.unit, unit), DE, dec);
        const original =
          e.unit !== unit
            ? `<br><span class="small">${L("meas.convertedFrom", { value: formatNumber(e.value, DE, unitDecimals(e.unit)), unit: e.unit })}</span>`
            : "";
        const context = e.context ? L(`meas.context.${e.context}`) : "";
        return `<tr>${when(e)}<td class="num">${shown}${original}</td><td>${context}</td>${note(e)}</tr>`;
      })
      .join("");
    sections.push(`
      <h2>${L("meas.glucose")}</h2>
      <div class="chart">${chartSvg(chartSeries(glucose, "glucose", unit), range, chartMinSpan("glucose", unit), (v) => formatNumber(v, DE, dec))}</div>
      <p class="legend">${L("meas.unitNote", { unit })}${anyConverted ? ` ${L("meas.convertedNote", { factor: "18,016" })}` : ""}</p>
      <table>
        <thead><tr><th>${L("meas.date")}</th><th>${L("meas.time")}</th><th>${L("meas.valueIn", { unit })}</th><th>${L("meas.contextShort")}</th><th>${L("meas.note")}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`);
  }

  if (!sections.length) sections.push(`<p>${L("meas.pdfEmpty")}</p>`);

  return `<!doctype html>
<html lang="${bilingual ? lang : DE}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @page { margin: 18mm 16mm; }
  body { font-family: Helvetica, Arial, sans-serif; color: #171F26; font-size: 11pt; line-height: 1.4; }
  h1 { font-size: 18pt; margin: 0 0 6px; }
  h2 { font-size: 14pt; margin: 22px 0 6px; }
  p { margin: 4px 0; }
  .meta { color: #55636D; }
  .hint { border: 1px solid #DBE1E6; border-radius: 6px; padding: 8px 10px; margin: 12px 0; }
  .chart { margin: 6px 0 2px; }
  .legend, .small { color: #55636D; font-size: 9pt; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border-bottom: 1px solid #DBE1E6; padding: 4px 6px; text-align: start; vertical-align: top; }
  th { font-size: 9pt; color: #55636D; }
  tr { page-break-inside: avoid; }
  .num { text-align: end; white-space: nowrap; }
  .nowrap { white-space: nowrap; }
  footer { margin-top: 24px; color: #55636D; font-size: 9pt; }
</style>
</head>
<body>
  <h1>${L("meas.pdfTitle")}</h1>
  ${printName ? `<p><strong>${L("meas.pdfName")}:</strong> ${escapeHtml(printName)}</p>` : ""}
  <p class="meta">${L("meas.pdfPeriod")}: ${deDate(range.from)} – ${deDate(now)} · ${L("meas.pdfCreated")}: ${deDate(now)}</p>
  <div class="hint">${L("meas.hint")}</div>
  ${sections.join("\n")}
  <footer>${L("meas.pdfFooter")}</footer>
</body>
</html>`;
}
