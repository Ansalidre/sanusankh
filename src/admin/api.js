/*
 * Aufrufe der Admin-Schnittstelle (netlify/functions/admin.mjs). Das Sitzungs-Cookie ist HttpOnly;
 * der Header X-Requested-With schützt vor Anfragen fremder Seiten.
 */

export class AdminError extends Error {
  constructor(code, status, data) {
    super(code);
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

let onUnauthorized = () => {};
let onActivity = () => {};

/** Rückrufe für abgelaufene Sitzung und erfolgreiche Aufrufe (verlängern die Inaktivitätsfrist). */
export function configureAdminApi(handlers) {
  onUnauthorized = handlers.onUnauthorized;
  onActivity = handlers.onActivity;
}

export async function adminApi(path, { method = "GET", body, raw = false } = {}) {
  const res = await fetch(`/api/admin${path}`, {
    method,
    credentials: "same-origin",
    headers: { "x-requested-with": "sanusankh-admin", ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && !path.startsWith("/login")) {
    onUnauthorized();
    throw new AdminError("unauthorized", 401);
  }
  if (raw && res.ok) {
    onActivity();
    return res;
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // leere Antwort
  }
  if (!res.ok) throw new AdminError(data?.error || `http_${res.status}`, res.status, data);
  onActivity();
  return data;
}
