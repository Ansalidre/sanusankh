/** Formatiert ein ISO-Datum (YYYY-MM-DD) in der UI-Sprache. */
export function formatDate(iso, lang) {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(lang, { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Date → "YYYY-MM-DD" in lokaler Zeit. */
export function toIsoDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
