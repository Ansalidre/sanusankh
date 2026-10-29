/*
 * Kooperations-Bestatter vom Server (GET /api/partners) mit Zwischenspeicher für den Offline-Fall
 * und Anfragen (POST /api/requests). Der Server liefert nur öffentliche Daten – keine Provisionshöhe;
 * `commission: true` heißt nur: Provisionsvereinbarung, der Provisionshinweis muss erscheinen.
 */
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { partnerCache, requestStore } from "@/lib/storage";

/**
 * Lädt die Partner eines Landes. Ergebnis:
 *   { partners, fetchedAt, live }  – live=false: aus dem Zwischenspeicher (keine Verbindung o. Ä.), Anfragen gesperrt
 */
export async function loadPartners(country) {
  try {
    const data = await api(`/partners?country=${encodeURIComponent(country)}`);
    // Demo-Einträge nur in Entwicklungs-Builds
    const list = (Array.isArray(data.partners) ? data.partners : []).filter((p) => !p.demo || __DEV__);
    const entry = partnerCache.set(country, list);
    return { partners: list, fetchedAt: entry.fetchedAt, live: true };
  } catch (error) {
    const cached = partnerCache.get(country);
    return { partners: cached?.partners || [], fetchedAt: cached?.fetchedAt || null, live: false, error: error.code };
  }
}

/** Partner eines Landes; zeigt sofort den Zwischenspeicher und aktualisiert im Hintergrund. */
export function usePartners(country) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const key = `${country}|${attempt}`;

  useEffect(() => {
    let active = true;
    loadPartners(country).then((data) => active && setResult({ key, ...data }));
    return () => {
      active = false; // veraltete Antwort verwerfen
    };
  }, [key, country]);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);
  if (result?.key === key) return { ...result, loading: false, reload };
  // Während des Ladens: letzter Stand bzw. Zwischenspeicher, Anfragen gesperrt.
  const cached = (result?.key.startsWith(`${country}|`) && result) || partnerCache.get(country);
  return { partners: cached?.partners || [], fetchedAt: cached?.fetchedAt || null, live: false, loading: true, reload };
}

/** Rabatt als kurzer Text, z. B. „10 % Rabatt“ oder „200 € Rabatt“. */
export function discountLabel(discount, currency, t, lang) {
  if (!discount) return "";
  if (discount.type === "percent") return t("partner.discountPercent", { value: discount.value.toLocaleString(lang) });
  return t("partner.discountAmount", { value: formatMoney(discount.value, currency, lang) });
}

export function formatMoney(value, currency, lang) {
  try {
    return new Intl.NumberFormat(lang, { style: "currency", currency: currency || "EUR", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${value} ${currency || "EUR"}`;
  }
}

/** Sendet eine Anfrage und legt sie unter „Meine Anfragen“ ab. */
export async function sendRequest({ partner, service, form }) {
  const result = await api("/requests", {
    method: "POST",
    body: { partnerId: partner.id, serviceId: service.id, ...form, consent: true },
  });
  const entry = {
    code: result.code,
    withdrawToken: result.withdrawToken,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerPhone: partner.phone || "",
    serviceTitle: service.title,
    createdAt: result.createdAt,
    status: "requested",
  };
  requestStore.add(entry);
  return { ...entry, delivery: result.delivery, userMail: result.userMail };
}

/** Zieht eine eigene Anfrage zurück (sendet nur Code und das geräteeigene Token). */
export async function withdrawRequest(code) {
  const entry = requestStore.get(code);
  if (!entry) throw new Error("not_found");
  await api("/requests/withdraw", { method: "POST", body: { code, withdrawToken: entry.withdrawToken } });
  requestStore.update(code, { status: "cancelled", cancelledAt: new Date().toISOString() });
}
