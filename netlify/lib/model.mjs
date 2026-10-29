/*
 * Datenmodell Kooperations-Bestatter und Vermittlungen. Ohne Node-Abhängigkeiten,
 * damit auch die Admin-Ansicht (src/admin) dieselben Regeln verwendet.
 *
 * Partner (gespeichert unter partners/<id>):
 *   id, name, country, currency, address, lat, lon, phone, website, logo, tracking, priority, active, demo,
 *   discount  { type: "percent" | "amount" | "none", value, conditions, validFrom, validTo }   – öffentlich
 *   services  [{ id, title, description, priceFrom }]                                          – öffentlich
 *   contact   { email, webhookUrl, webhookSecret }                                             – NUR Server
 *   commission{ agreed, type: "percent" | "fixed", value, from, to }                           – NUR Server/Admin
 *               agreed=false (Standard): keine Provisionsvereinbarung → kein Provisionshinweis, keine Provision
 *   contract  { status: "draft" | "active" | "paused" | "ended", from, to, contactName, contactEmail, contactPhone } – NUR Server/Admin
 *               Freischaltung in der App (kein Vertrag nötig); from/to optional
 *
 * Vermittlung (gespeichert unter referrals/<code>), ohne Kontaktdaten des Nutzers:
 *   code, partnerId, partnerName, serviceId, serviceTitle, country, currency, createdAt,
 *   status, history [{ status, at, by }], orderValue, commission, commissionModel, billingStatus,
 *   note (intern, keine personenbezogenen Daten), withdrawHash
 */

export const COUNTRIES = ["DE", "AT", "CH", "IT", "FR", "TR", "PL"];
export const CURRENCY = { DE: "EUR", AT: "EUR", IT: "EUR", FR: "EUR", CH: "CHF", PL: "PLN", TR: "TRY" };

/** angefragt → kontaktiert → beauftragt → abgerechnet / storniert */
export const STATUSES = ["requested", "contacted", "commissioned", "invoiced", "cancelled"];
/** Provision: keine fällig → offen → in Rechnung gestellt → bezahlt */
export const BILLING = ["none", "open", "invoiced", "paid"];
/** Bis zu diesem Status kann der Nutzer seine Anfrage selbst zurückziehen. */
export const WITHDRAWABLE = ["requested", "contacted"];

export const PREFERRED_TIMES = ["any", "morning", "afternoon", "evening"];

export const CODE_PATTERN = /^SA-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

const ID = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/;
/** Tracking-Parameter dürfen nichts Personenbezogenes enthalten. */
const PERSONAL_PARAM = /(^|&)(email|mail|name|phone|tel|user|uid|id|device|ip)=/i;

export function isEmail(value) {
  return typeof value === "string" && value.length <= 200 && EMAIL.test(value);
}

function str(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Zahl aus der Admin-Ansicht (Komma oder Punkt), gerundet auf `decimals` Stellen; Beträge 2, Koordinaten 6. */
function num(value, decimals = 2) {
  if (value === "" || value == null) return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  const factor = 10 ** decimals;
  return Number.isFinite(n) ? Math.round(n * factor) / factor : NaN;
}

function date(value) {
  const s = str(value, 10);
  return DATE.test(s) ? s : "";
}

function httpsUrl(value) {
  const s = str(value, 500);
  if (!s) return "";
  try {
    return new URL(s).protocol === "https:" ? s : null;
  } catch {
    return null;
  }
}

/**
 * Prüft und bereinigt einen Partner aus der Admin-Ansicht.
 * Gibt { partner } oder { errors: [Feld: Meldung] } zurück.
 */
export function normalizePartner(input) {
  const errors = [];
  const p = input && typeof input === "object" ? input : {};
  const err = (field, message) => errors.push(`${field}: ${message}`);

  const id = str(p.id, 60).toLowerCase();
  if (!ID.test(id)) err("id", "3–60 Zeichen, nur a–z, 0–9 und Bindestrich");
  const name = str(p.name, 120);
  if (!name) err("name", "Pflichtfeld");
  const country = COUNTRIES.includes(p.country) ? p.country : null;
  if (!country) err("country", "unbekanntes Land");

  // 6 Nachkommastellen ≈ 0,1 m – Standort des Bestatters, nicht des Nutzers.
  const lat = num(p.lat, 6);
  const lon = num(p.lon, 6);
  if ((lat == null) !== (lon == null) || Number.isNaN(lat) || Number.isNaN(lon) || (lat != null && (Math.abs(lat) > 90 || Math.abs(lon) > 180))) {
    err("lat/lon", "beide Koordinaten angeben (Dezimalgrad)");
  }

  const website = httpsUrl(p.website);
  if (website === null) err("website", "muss mit https:// beginnen");
  const logo = httpsUrl(p.logo);
  if (logo === null) err("logo", "muss mit https:// beginnen");
  const tracking = str(p.tracking, 300).replace(/^[?&]/, "");
  if (PERSONAL_PARAM.test(tracking)) err("tracking", "keine personenbezogenen Parameter");

  const d = p.discount || {};
  const discountType = ["percent", "amount", "none"].includes(d.type) ? d.type : "none";
  const discountValue = num(d.value);
  if (discountType !== "none" && !(discountValue > 0)) err("discount.value", "Wert größer 0 angeben");
  if (discountType === "percent" && discountValue > 100) err("discount.value", "höchstens 100 %");
  const discount = {
    type: discountType,
    value: discountType === "none" ? null : discountValue,
    conditions: str(d.conditions, 600),
    validFrom: date(d.validFrom),
    validTo: date(d.validTo),
  };

  const services = (Array.isArray(p.services) ? p.services : []).slice(0, 20).map((s, i) => {
    const sid = str(s?.id, 60).toLowerCase() || `leistung-${i + 1}`;
    const title = str(s?.title, 100);
    const priceFrom = num(s?.priceFrom);
    if (!ID.test(sid)) err(`services[${i}].id`, "nur a–z, 0–9 und Bindestrich");
    if (!title) err(`services[${i}].title`, "Pflichtfeld");
    if (Number.isNaN(priceFrom) || (priceFrom != null && priceFrom < 0)) err(`services[${i}].priceFrom`, "Zahl ≥ 0 oder leer");
    return { id: sid, title, description: str(s?.description, 500), priceFrom };
  });
  if (new Set(services.map((s) => s.id)).size !== services.length) err("services", "IDs doppelt");

  const c = p.contact || {};
  const contactEmail = str(c.email, 200);
  const webhookUrl = httpsUrl(c.webhookUrl);
  if (contactEmail && !isEmail(contactEmail)) err("contact.email", "ungültige E-Mail");
  if (webhookUrl === null) err("contact.webhookUrl", "muss mit https:// beginnen");
  const contact = { email: contactEmail, webhookUrl: webhookUrl || "", webhookSecret: str(c.webhookSecret, 100) };

  const m = p.commission || {};
  const commissionAgreed = m.agreed === true;
  const commissionType = m.type === "fixed" ? "fixed" : "percent";
  const commissionValue = num(m.value);
  const commission = { agreed: commissionAgreed, type: commissionType, value: null, from: date(m.from), to: date(m.to) };
  if (commissionAgreed) {
    if (commissionValue == null || Number.isNaN(commissionValue) || !(commissionValue > 0)) err("commission.value", "Wert größer 0 angeben");
    if (commissionType === "percent" && commissionValue > 100) err("commission.value", "höchstens 100 %");
    if (!commission.from) err("commission.from", "Beginn der Vereinbarung angeben");
    if (commission.from && commission.to && commission.from > commission.to) err("commission", "Beginn liegt nach dem Ende");
    commission.value = commissionValue;
  } else if (commissionValue != null && !Number.isNaN(commissionValue)) {
    // Vorbereiteter Wert bleibt erhalten, gilt aber erst mit Vereinbarung.
    commission.value = commissionValue;
  }

  const k = p.contract || {};
  const contract = {
    status: ["draft", "active", "paused", "ended"].includes(k.status) ? k.status : "draft",
    from: date(k.from),
    to: date(k.to),
    contactName: str(k.contactName, 120),
    contactEmail: str(k.contactEmail, 200),
    contactPhone: str(k.contactPhone, 40),
  };
  if (contract.from && contract.to && contract.from > contract.to) err("contract", "Beginn liegt nach dem Ende");
  if (contract.contactEmail && !isEmail(contract.contactEmail)) err("contract.contactEmail", "ungültige E-Mail");
  if (contract.status === "active") {
    if (!services.length) err("services", "mindestens eine Leistung");
    if (!contact.email && !contact.webhookUrl) err("contact", "E-Mail oder Webhook für Anfragen angeben");
    if (lat == null) err("lat/lon", "für die Umkreissuche erforderlich");
  }

  if (errors.length) return { errors };
  return {
    partner: {
      id,
      name,
      country,
      currency: CURRENCY[country],
      address: str(p.address, 200),
      lat,
      lon,
      phone: str(p.phone, 40),
      website: website || "",
      logo: logo || "",
      tracking,
      priority: Number.isInteger(Number(p.priority)) ? Number(p.priority) : 99,
      active: p.active !== false,
      demo: p.demo === true,
      discount,
      services,
      contact,
      commission,
      contract,
    },
  };
}

function inRange(day, from, to) {
  return (!from || day >= from) && (!to || day <= to);
}

/** Partner erscheint in der App: aktiv, freigeschaltet und im Freischaltungszeitraum (falls angegeben). */
export function isPartnerVisible(partner, day) {
  return Boolean(partner?.active && partner.contract?.status === "active" && inRange(day, partner.contract.from, partner.contract.to));
}

/** Anfragen möglich: sichtbar, mit Leistungen und einem Kontaktweg. */
export function isPartnerBookable(partner, day) {
  return isPartnerVisible(partner, day) && partner.services?.length > 0 && Boolean(partner.contact?.email || partner.contact?.webhookUrl);
}

/** Provisionsvereinbarung liegt vor und gilt heute. Nur dann Provisionshinweis und Provision. */
export function hasCommission(partner, day) {
  const c = partner?.commission;
  return Boolean(c?.agreed && c.value > 0 && inRange(day, c.from, c.to));
}

export function activeDiscount(partner, day) {
  const d = partner?.discount;
  if (!d || d.type === "none" || !(d.value > 0) || !inRange(day, d.validFrom, d.validTo)) return null;
  return { type: d.type, value: d.value, conditions: d.conditions, validTo: d.validTo };
}

/** Öffentliche Sicht für die App – ohne Provisionshöhe, Vertrag und Kontaktweg; `commission` sagt nur, ob ein Hinweis nötig ist. */
export function publicPartner(partner, day) {
  const website =
    partner.website && partner.tracking ? `${partner.website}${partner.website.includes("?") ? "&" : "?"}${partner.tracking}` : partner.website;
  return {
    id: partner.id,
    name: partner.name,
    country: partner.country,
    currency: partner.currency,
    address: partner.address,
    lat: partner.lat,
    lon: partner.lon,
    phone: partner.phone,
    website,
    logo: partner.logo,
    priority: partner.priority,
    demo: partner.demo,
    discount: activeDiscount(partner, day),
    services: partner.services.map(({ id, title, description, priceFrom }) => ({ id, title, description, priceFrom })),
    bookable: isPartnerBookable(partner, day),
    commission: hasCommission(partner, day),
  };
}

/** Provision einer Vermittlung nach dem bei der Anfrage gültigen Modell; `null`, solange nicht fällig. */
export function computeCommission({ status, orderValue, commissionModel }) {
  if (!["commissioned", "invoiced"].includes(status) || !commissionModel) return null;
  if (commissionModel.type === "fixed") return commissionModel.value;
  if (orderValue == null) return null;
  return Math.round(orderValue * commissionModel.value) / 100;
}

/** Zeitpunkt der Beauftragung (oder direkt „abgerechnet“, falls „beauftragt“ übersprungen wurde). */
export function commissionedAt(referral) {
  return (referral.history || []).find((h) => h.status === "commissioned" || h.status === "invoiced")?.at || null;
}

/** Monat (YYYY-MM) der Beauftragung – maßgeblich für die Provisionsabrechnung. */
export function commissionedMonth(referral) {
  return commissionedAt(referral)?.slice(0, 7) || null;
}
