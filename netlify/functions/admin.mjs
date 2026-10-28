/*
 * Admin-Schnittstelle (nur für die Admin-Ansicht unter /admin). Alle Aufrufe brauchen den Header
 * X-Requested-With: sanusankh-admin (Schutz gegen fremde Formulare) und – außer login – eine Sitzung.
 *
 *   POST   /api/admin/login            { password }
 *   POST   /api/admin/logout
 *   GET    /api/admin/session
 *   GET    /api/admin/partners
 *   PUT    /api/admin/partners/:id     Partner anlegen/ändern
 *   DELETE /api/admin/partners/:id
 *   GET    /api/admin/referrals?partner=&status=&from=&to=
 *   PATCH  /api/admin/referrals/:code  { status?, orderValue?, billingStatus?, note? }
 *   GET    /api/admin/report?month=YYYY-MM&partner=&format=json|csv
 */
import { adminConfigured, currentSession, login, logout } from "../lib/auth.mjs";
import { deliveryMode } from "../lib/delivery.mjs";
import { json, randomToken, readJson } from "../lib/http.mjs";
import { BILLING, commissionedAt, commissionedMonth, computeCommission, normalizePartner, STATUSES } from "../lib/model.mjs";
import { ensureDemoPartners } from "../lib/seed.mjs";
import { counters, partners, referrals } from "../lib/storage/index.mjs";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-\d{2}$/;

function withoutSecrets(referral) {
  const { withdrawHash: _hash, ...rest } = referral;
  return rest;
}

async function listReferrals(params) {
  const partner = params.get("partner") || "";
  const status = params.get("status") || "";
  const from = DATE.test(params.get("from") || "") ? params.get("from") : "";
  const to = DATE.test(params.get("to") || "") ? params.get("to") : "";
  counters.prune().catch(() => {});
  return (await referrals.list())
    .filter((r) => !partner || r.partnerId === partner)
    .filter((r) => !status || r.status === status)
    .filter((r) => (!from || r.createdAt.slice(0, 10) >= from) && (!to || r.createdAt.slice(0, 10) <= to))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(withoutSecrets);
}

async function updateReferral(code, body) {
  const referral = await referrals.get(code);
  if (!referral) return json(404, { error: "not_found" });
  const next = { ...referral };

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return json(400, { error: "invalid_status" });
    if (body.status !== referral.status) {
      next.status = body.status;
      next.history = [...referral.history, { status: body.status, at: new Date().toISOString(), by: "admin" }];
    }
  }
  if (body.orderValue !== undefined) {
    const value = body.orderValue === null || body.orderValue === "" ? null : Number(String(body.orderValue).replace(",", "."));
    if (value !== null && !(Number.isFinite(value) && value >= 0)) return json(400, { error: "invalid_order_value" });
    next.orderValue = value === null ? null : Math.round(value * 100) / 100;
  }
  if (body.billingStatus !== undefined) {
    if (!BILLING.includes(body.billingStatus)) return json(400, { error: "invalid_billing" });
    next.billingStatus = body.billingStatus;
  }
  if (body.note !== undefined) next.note = String(body.note).slice(0, 500);

  next.commission = computeCommission(next);
  if (next.commission != null && next.billingStatus === "none") next.billingStatus = "open";
  if (next.status === "invoiced" && ["none", "open"].includes(next.billingStatus)) next.billingStatus = "invoiced";
  if (next.status === "cancelled" && next.billingStatus === "open") next.billingStatus = "none";

  await referrals.save(next);
  return json(200, { referral: withoutSecrets(next) });
}

async function savePartner(id, body) {
  const { partner, errors } = normalizePartner({ ...body, id });
  if (errors) return json(400, { error: "invalid_partner", fields: errors });
  const existing = await partners.get(id);
  if (partner.contact.webhookUrl && !partner.contact.webhookSecret) {
    partner.contact.webhookSecret = existing?.contact?.webhookSecret || randomToken(24);
  }
  const saved = { ...partner, createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  await partners.save(saved);
  return json(200, { partner: saved });
}

function report(list, month, partnerFilter) {
  const groups = new Map();
  for (const r of list) {
    if (partnerFilter && r.partnerId !== partnerFilter) continue;
    const g =
      groups.get(r.partnerId) ||
      { partnerId: r.partnerId, partnerName: r.partnerName, currency: r.currency, requested: 0, cancelled: 0, commissioned: 0, orderTotal: 0, commissionTotal: 0, items: [] };
    if (r.createdAt.slice(0, 7) === month) {
      g.requested += 1;
      if (r.status === "cancelled") g.cancelled += 1;
    }
    if (["commissioned", "invoiced"].includes(r.status) && commissionedMonth(r) === month) {
      g.commissioned += 1;
      g.orderTotal += r.orderValue || 0;
      g.commissionTotal += r.commission || 0;
      g.items.push(withoutSecrets(r));
    }
    groups.set(r.partnerId, g);
  }
  return [...groups.values()]
    .filter((g) => g.requested || g.items.length)
    .map((g) => ({ ...g, orderTotal: Math.round(g.orderTotal * 100) / 100, commissionTotal: Math.round(g.commissionTotal * 100) / 100 }))
    .sort((a, b) => a.partnerName.localeCompare(b.partnerName, "de"));
}

const STATUS_DE = { requested: "angefragt", contacted: "kontaktiert", commissioned: "beauftragt", invoiced: "abgerechnet", cancelled: "storniert" };
const BILLING_DE = { none: "nicht fällig", open: "offen", invoiced: "in Rechnung gestellt", paid: "bezahlt" };

function csvCell(value) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // keine Formeln in Tabellenprogrammen
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Byte-Order-Mark, damit Excel die UTF-8-Datei mit Umlauten richtig öffnet.
const BOM = String.fromCharCode(0xfeff);
const decimal = (n) => (n == null ? "" : n.toFixed(2).replace(".", ","));
const germanDate = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : "");

function reportCsv(groups, month) {
  const rows = [["Monat", "Bestatter", "Code", "Leistung", "Angefragt am", "Beauftragt am", "Status", "Auftragswert", "Provisionsmodell", "Provision", "Währung", "Abrechnung"]];
  for (const g of groups) {
    for (const r of g.items) {
      const model = r.commissionModel?.type === "fixed" ? `fest ${decimal(r.commissionModel.value)}` : `${decimal(r.commissionModel?.value)} %`;
      rows.push([month, g.partnerName, r.code, r.serviceTitle, germanDate(r.createdAt), germanDate(commissionedAt(r)), STATUS_DE[r.status], decimal(r.orderValue), model, decimal(r.commission), r.currency, BILLING_DE[r.billingStatus]]);
    }
    rows.push([month, `Summe ${g.partnerName}`, "", `${g.commissioned} beauftragt / ${g.requested} angefragt / ${g.cancelled} storniert`, "", "", "", decimal(g.orderTotal), "", decimal(g.commissionTotal), g.currency, ""]);
  }
  return BOM + rows.map((row) => row.map(csvCell).join(";")).join("\r\n") + "\r\n";
}

async function route(req, context, parts) {
  const [resource, id] = parts;
  const method = req.method;

  if (resource === "login" && method === "POST") {
    const body = (await readJson(req, 2000)) || {};
    const result = await login(req, context, body.password);
    if (!result.ok) {
      const headers = result.retryAfter ? { "retry-after": String(result.retryAfter) } : {};
      return json(result.status, { error: result.error, retryAfter: result.retryAfter, attemptsLeft: result.attemptsLeft }, { headers });
    }
    return json(200, { expiresAt: result.expiresAt, delivery: deliveryMode() }, { headers: { "set-cookie": result.setCookie } });
  }

  const session = await currentSession(req);
  if (resource === "logout" && method === "POST") {
    return json(200, { ok: true }, { headers: { "set-cookie": await logout(req) } });
  }
  if (!session) return json(401, { error: adminConfigured() ? "unauthorized" : "not_configured" });

  if (resource === "session" && method === "GET") return json(200, { expiresAt: session.expiresAt, delivery: deliveryMode() });

  if (resource === "partners") {
    await ensureDemoPartners();
    if (!id && method === "GET") {
      const list = (await partners.list()).sort((a, b) => a.name.localeCompare(b.name, "de"));
      return json(200, { partners: list });
    }
    if (id && method === "PUT") return savePartner(id, (await readJson(req, 50000)) || {});
    if (id && method === "DELETE") {
      await partners.remove(id);
      return json(200, { ok: true });
    }
  }

  if (resource === "referrals") {
    if (!id && method === "GET") return json(200, { referrals: await listReferrals(new URL(req.url).searchParams) });
    if (id && method === "PATCH") return updateReferral(id.toUpperCase(), (await readJson(req, 5000)) || {});
  }

  if (resource === "report" && method === "GET") {
    const params = new URL(req.url).searchParams;
    const month = params.get("month") || "";
    if (!MONTH.test(month)) return json(400, { error: "invalid_month" });
    const partner = params.get("partner") || "";
    const groups = report(await referrals.list(), month, partner);
    if (params.get("format") === "csv") {
      const name = `provisionen-${month}${partner ? `-${partner}` : ""}.csv`;
      return new Response(reportCsv(groups, month), {
        status: 200,
        headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}"`, "cache-control": "no-store" },
      });
    }
    return json(200, { month, partners: groups });
  }

  return json(404, { error: "not_found" });
}

export default async function handler(req, context) {
  if (req.headers.get("x-requested-with") !== "sanusankh-admin") return json(403, { error: "forbidden" });
  try {
    const parts = new URL(req.url).pathname
      .replace(/^\/api\/admin\/?/, "")
      .split("/")
      .filter(Boolean)
      .map(decodeURIComponent);
    return await route(req, context, parts);
  } catch (error) {
    if (error.status) return json(error.status, { error: error.message });
    console.error("admin failed:", error?.message || error);
    return json(500, { error: "admin_failed" });
  }
}

export const config = { path: ["/api/admin/*"] };
