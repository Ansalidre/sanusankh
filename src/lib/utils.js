import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Formatiert ein ISO-Datum (YYYY-MM-DD) in der UI-Sprache. */
export function formatDate(iso, lang) {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(lang, { dateStyle: "medium" });
}
