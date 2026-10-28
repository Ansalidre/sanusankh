/*
 * GET /api/partners?country=DE → { partners: [...] }
 * Öffentliche Daten der Kooperations-Bestatter für die App (ohne Provision, Vertrag und Kontaktweg).
 */
import { json, preflight, today } from "../lib/http.mjs";
import { COUNTRIES, isPartnerVisible, publicPartner } from "../lib/model.mjs";
import { ensureDemoPartners } from "../lib/seed.mjs";
import { partners } from "../lib/storage/index.mjs";

export default async function handler(req) {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "GET") return json(405, { error: "method_not_allowed" }, { cors: true });

  const country = new URL(req.url).searchParams.get("country");
  if (!COUNTRIES.includes(country)) return json(400, { error: "invalid_country" }, { cors: true });

  try {
    await ensureDemoPartners();
    const day = today();
    const list = (await partners.list())
      .filter((p) => p.country === country && isPartnerVisible(p, day))
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
      .map((p) => publicPartner(p, day));
    return json(200, { partners: list, date: day }, { cors: true, headers: { "cache-control": "public, max-age=300" } });
  } catch (error) {
    console.error("partners failed:", error?.message || error);
    return json(500, { error: "partners_failed" }, { cors: true });
  }
}

export const config = { path: "/api/partners" };
