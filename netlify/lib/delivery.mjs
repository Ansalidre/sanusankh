/*
 * Zustellung von Anfragen: E-Mail über Brevo und optional Webhook an den Bestatter.
 *
 * Live-Betrieb nur, wenn BREVO_API_KEY und MAIL_FROM gesetzt sind. Sonst Testbetrieb:
 * Es wird nichts versendet, das Protokoll enthält nur Code, Bestatter, Leistung und Zeitstempel –
 * nie Name, Telefon, E-Mail oder Nachricht des Nutzers. Fehlerprotokolle ebenso.
 */
import crypto from "node:crypto";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const TIMEOUT_MS = 10000;

export function deliveryMode() {
  return process.env.BREVO_API_KEY && process.env.MAIL_FROM ? "live" : "test";
}

function logMeta(kind, meta, extra = {}) {
  return JSON.stringify({
    kind,
    code: meta.code,
    partner: meta.partnerId,
    service: meta.serviceId,
    at: new Date().toISOString(),
    ...extra,
  });
}

async function post(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sendet eine Text-E-Mail. `meta` ({ code, partnerId, serviceId }) ist das Einzige, was protokolliert wird.
 * Gibt true bei Erfolg (oder im Testbetrieb) zurück.
 */
export async function sendMail({ kind, to, replyTo, subject, text }, meta) {
  if (deliveryMode() === "test") {
    console.info("[mail:test]", logMeta(kind, meta));
    return true;
  }
  try {
    const res = await post(BREVO_URL, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json", "api-key": process.env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { email: process.env.MAIL_FROM, name: process.env.MAIL_FROM_NAME || "SanusAnkh" },
        to: [{ email: to }],
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
        subject,
        textContent: text,
      }),
    });
    if (!res.ok) {
      console.error("[mail:error]", logMeta(kind, meta, { status: res.status }));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[mail:error]", logMeta(kind, meta, { error: error?.name || "fetch_failed" }));
    return false;
  }
}

/**
 * Webhook an den Bestatter mit HMAC-Signatur:
 *   X-SanusAnkh-Timestamp: <Unix-Sekunden>
 *   X-SanusAnkh-Signature: sha256=<hex(HMAC_SHA256(secret, timestamp + "." + body))>
 */
export async function sendWebhook({ url, secret, kind, payload }, meta) {
  if (deliveryMode() === "test") {
    console.info("[webhook:test]", logMeta(kind, meta));
    return true;
  }
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", secret || "").update(`${timestamp}.${body}`).digest("hex");
  try {
    const res = await post(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sanusankh-event": kind,
        "x-sanusankh-timestamp": timestamp,
        "x-sanusankh-signature": `sha256=${signature}`,
      },
      body,
    });
    if (!res.ok) console.error("[webhook:error]", logMeta(kind, meta, { status: res.status }));
    return res.ok;
  } catch (error) {
    console.error("[webhook:error]", logMeta(kind, meta, { error: error?.name || "fetch_failed" }));
    return false;
  }
}
