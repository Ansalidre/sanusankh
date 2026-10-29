/*
 * Anfragen bei Kooperations-Bestattern.
 *
 *   POST /api/requests          { partnerId, serviceId, name, email, phone?, preferredDate?, preferredTime?,
 *                                 message?, wishes?, consent: true }
 *        → { code, withdrawToken, createdAt, delivery: "live" | "test", userMail }
 *   POST /api/requests/withdraw { code, withdrawToken } → { status: "cancelled" }
 *
 * Kontaktdaten gehen nur in die E-Mail/den Webhook an den Bestatter und die Bestätigung an den Nutzer.
 * Gespeichert wird nur die Vermittlung (Code, Bestatter, Leistung, Datum, Status; Provisionsmodell nur mit
 * Provisionsvereinbarung) – siehe lib/model.mjs.
 * Das withdrawToken liegt nur auf dem Gerät; damit kann nur der Nutzer selbst (nicht der Bestatter,
 * der den Code ebenfalls kennt) die Anfrage zurückziehen. Gespeichert wird nur sein Hash.
 */
import crypto from "node:crypto";
import { partnerRequestMail, partnerWithdrawMail, userConfirmationMail } from "../lib/emails.mjs";
import { deliveryMode, sendMail, sendWebhook } from "../lib/delivery.mjs";
import { clientKey, json, preflight, randomToken, readJson, safeEqual, sha256, today } from "../lib/http.mjs";
import { activeDiscount, CODE_PATTERN, hasCommission, isEmail, isPartnerBookable, PREFERRED_TIMES, WITHDRAWABLE } from "../lib/model.mjs";
import { counters, partners, referrals } from "../lib/storage/index.mjs";

// Ohne verwechselbare Zeichen (0/O, 1/I).
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LIMITS = { request: { max: 5, windowMs: 60 * 60 * 1000 }, withdraw: { max: 20, windowMs: 60 * 60 * 1000 } };
const PHONE = /^[0-9+()/\s.-]{5,40}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const reply = (status, body) => json(status, body, { cors: true });

function newCode() {
  const pick = () => Array.from({ length: 4 }, () => CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join("");
  return `SA-${pick()}-${pick()}`;
}

/** Steuerzeichen entfernen (Zeilenumbrüche bleiben), kürzen. */
function clean(value, max) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n").replace(/[^\P{Cc}\n]/gu, "").trim().slice(0, max) : "";
}

/** Einfacher Zähler je pseudonymer Herkunft; true, wenn das Limit erreicht ist. */
async function limited(kind, context) {
  const { max, windowMs } = LIMITS[kind];
  const key = `${kind}-${clientKey(context)}`;
  const now = Date.now();
  const entry = await counters.get(key);
  const current = entry && entry.until > now ? entry : { count: 0, until: now + windowMs };
  if (current.count >= max) return true;
  await counters.save(key, { count: current.count + 1, until: current.until });
  return false;
}

function validate(body) {
  const day = today();
  const maxDay = new Date(Date.now() + 366 * 86400000).toISOString().slice(0, 10);
  const form = {
    partnerId: clean(body.partnerId, 60),
    serviceId: clean(body.serviceId, 60),
    name: clean(body.name, 100),
    email: clean(body.email, 200),
    phone: clean(body.phone, 40),
    preferredDate: clean(body.preferredDate, 10),
    preferredTime: PREFERRED_TIMES.includes(body.preferredTime) ? body.preferredTime : "any",
    message: clean(body.message, 1000),
    wishes: clean(body.wishes, 2000),
  };
  const errors = [];
  if (!form.partnerId || !form.serviceId) errors.push("service");
  if (form.name.length < 2) errors.push("name");
  if (!isEmail(form.email)) errors.push("email");
  if (form.phone && !PHONE.test(form.phone)) errors.push("phone");
  if (form.preferredDate && (!DATE.test(form.preferredDate) || form.preferredDate < day || form.preferredDate > maxDay)) errors.push("preferredDate");
  if (body.consent !== true) errors.push("consent");
  // Unsichtbares Feld gegen Bots (die App lässt es leer).
  if (body.website) errors.push("website");
  return { form, errors };
}

async function createRequest(req, context) {
  const body = await readJson(req);
  const { form, errors } = validate(body || {});
  if (errors.length) return reply(400, { error: "invalid_fields", fields: errors });
  if (await limited("request", context)) return reply(429, { error: "rate_limited" });

  const day = today();
  const partner = await partners.get(form.partnerId);
  if (!partner || !isPartnerBookable(partner, day)) return reply(404, { error: "partner_unavailable" });
  const service = partner.services.find((s) => s.id === form.serviceId);
  if (!service) return reply(404, { error: "service_unavailable" });
  const discount = activeDiscount(partner, day);
  // Provision nur mit Provisionsvereinbarung; sonst bleibt die Vermittlung ohne Provisionsmodell.
  const commission = hasCommission(partner, day);

  const withdrawToken = randomToken(24);
  const createdAt = new Date().toISOString();
  let referral = null;
  for (let attempt = 0; attempt < 5 && !referral; attempt++) {
    const candidate = {
      code: newCode(),
      partnerId: partner.id,
      partnerName: partner.name,
      serviceId: service.id,
      serviceTitle: service.title,
      country: partner.country,
      currency: partner.currency,
      createdAt,
      status: "requested",
      history: [{ status: "requested", at: createdAt, by: "user" }],
      orderValue: null,
      commission: null,
      commissionModel: commission ? { type: partner.commission.type, value: partner.commission.value } : null,
      billingStatus: "none",
      discount,
      note: "",
      withdrawHash: sha256(withdrawToken),
    };
    if (await referrals.create(candidate)) referral = candidate;
  }
  if (!referral) return reply(500, { error: "code_failed" });

  const meta = { code: referral.code, partnerId: partner.id, serviceId: service.id };
  const mailData = { partner, service, referral, form, discount, commission };
  const channels = [];
  if (partner.contact.email) channels.push(sendMail(partnerRequestMail(mailData), meta));
  if (partner.contact.webhookUrl) {
    channels.push(
      sendWebhook(
        {
          url: partner.contact.webhookUrl,
          secret: partner.contact.webhookSecret,
          kind: "request.created",
          payload: {
            event: "request.created",
            code: referral.code,
            createdAt,
            service: { id: service.id, title: service.title },
            discount,
            customer: { name: form.name, email: form.email, phone: form.phone },
            preferredDate: form.preferredDate,
            preferredTime: form.preferredTime,
            message: form.message,
            wishes: form.wishes,
            consentAt: createdAt,
          },
        },
        meta,
      ),
    );
  }
  const delivered = (await Promise.all(channels)).some(Boolean);
  if (!delivered) {
    // Bestatter nicht erreichbar: keine Vermittlung ohne zugestellte Anfrage.
    await referrals.remove(referral.code);
    return reply(502, { error: "delivery_failed" });
  }

  const userMail = await sendMail(userConfirmationMail(mailData), meta);
  return reply(201, { code: referral.code, withdrawToken, createdAt, delivery: deliveryMode(), userMail });
}

async function withdrawRequest(req, context) {
  const body = (await readJson(req, 2000)) || {};
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const token = typeof body.withdrawToken === "string" ? body.withdrawToken : "";
  if (!CODE_PATTERN.test(code) || !token) return reply(400, { error: "invalid_fields" });
  if (await limited("withdraw", context)) return reply(429, { error: "rate_limited" });

  const referral = await referrals.get(code);
  if (!referral || !safeEqual(sha256(token), referral.withdrawHash)) return reply(404, { error: "not_found" });
  if (referral.status === "cancelled") return reply(200, { status: "cancelled" });
  if (!WITHDRAWABLE.includes(referral.status)) return reply(409, { error: "not_withdrawable", status: referral.status });

  const at = new Date().toISOString();
  await referrals.save({ ...referral, status: "cancelled", history: [...referral.history, { status: "cancelled", at, by: "user" }] });

  const partner = await partners.get(referral.partnerId);
  if (partner) {
    const meta = { code, partnerId: partner.id, serviceId: referral.serviceId };
    if (partner.contact?.email) await sendMail(partnerWithdrawMail({ partner, referral }), meta);
    if (partner.contact?.webhookUrl) {
      await sendWebhook(
        { url: partner.contact.webhookUrl, secret: partner.contact.webhookSecret, kind: "request.cancelled", payload: { event: "request.cancelled", code, cancelledAt: at } },
        meta,
      );
    }
  }
  return reply(200, { status: "cancelled" });
}

export default async function handler(req, context) {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" });
  try {
    const path = new URL(req.url).pathname.replace(/\/+$/, "");
    if (path.endsWith("/withdraw")) return await withdrawRequest(req, context);
    return await createRequest(req, context);
  } catch (error) {
    if (error.status) return reply(error.status, { error: error.message });
    console.error("requests failed:", error?.message || error);
    return reply(500, { error: "request_failed" });
  }
}

export const config = { path: ["/api/requests", "/api/requests/withdraw"] };
