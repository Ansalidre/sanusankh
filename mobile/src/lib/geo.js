/* Standort (expo-location) und Ortssuche über die OpenStreetMap-Overpass-API. */
import { Platform } from "react-native";
import * as Location from "expo-location";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/** OSM-Dienste verlangen eine erkennbare Kennung der App (Nutzungsrichtlinien der OSMF). */
export const OSM_HEADERS = { "User-Agent": "SanusAnkh/1.0 (Erste-Hilfe-App; de.sanusankh.app)" };

export class GeoError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // "denied" | "servicesOff" | "unavailable" | "network" | "notFound"
  }
}

export async function getPosition() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") throw new GeoError("denied");
  if (!(await Location.hasServicesEnabledAsync())) throw new GeoError("servicesOff");
  try {
    const pos =
      (await Location.getLastKnownPositionAsync({ maxAge: 120000, requiredAccuracy: 500 })) ||
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch {
    throw new GeoError("unavailable");
  }
}

export function distanceKm(a, b) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const QUERIES = {
  pharmacy: { filter: '["amenity"="pharmacy"]', radius: 5000 },
  hospital: { filter: '["amenity"="hospital"]', radius: 20000 },
  funeral: { filter: '["shop"="funeral_directors"]', radius: 20000 },
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Ort oder Postleitzahl → Koordinaten über OpenStreetMap-Nominatim (nur der eingegebene Text und das
 * Land werden übertragen). Wirft GeoError("notFound") bzw. ("network").
 */
export async function geocodePlace(query, countryCode) {
  const params = `format=json&limit=1&countrycodes=${countryCode.toLowerCase()}&q=${encodeURIComponent(query.trim())}`;
  let data;
  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, { headers: OSM_HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch {
    throw new GeoError("network");
  }
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit) throw new GeoError("notFound");
  return { lat: Number(hit.lat), lon: Number(hit.lon) };
}

function formatAddress(tags) {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const city = [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ");
  return [street, city].filter(Boolean).join(", ");
}

export async function findNearby(kind, origin, { limit = 25 } = {}) {
  const { filter, radius } = QUERIES[kind];
  const around = `(around:${radius},${origin.lat},${origin.lon})`;
  const query = `[out:json][timeout:25];(node${filter}${around};way${filter}${around};relation${filter}${around};);out center tags;`;

  let data;
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { ...OSM_HEADERS, "content-type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch {
    throw new GeoError("network");
  }

  const places = (data.elements || [])
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null) return null;
      const tags = el.tags || {};
      return {
        id: `${el.type}/${el.id}`,
        name: tags.name || "",
        lat,
        lon,
        address: formatAddress(tags),
        phone: tags.phone || tags["contact:phone"] || "",
        website: tags.website || tags["contact:website"] || "",
        openingHours: tags.opening_hours || "",
        emergency: tags.emergency === "yes",
        distanceKm: distanceKm(origin, { lat, lon }),
      };
    })
    .filter(Boolean);

  // Kliniken ohne Notaufnahme-Kennzeichnung nach hinten, sonst nach Entfernung.
  places.sort((a, b) => {
    if (kind === "hospital" && a.emergency !== b.emergency) return a.emergency ? -1 : 1;
    return a.distanceKm - b.distanceKm;
  });
  return places.slice(0, limit);
}

/** Öffnet die Navigation in der Karten-App des Geräts (Apple Karten bzw. Auswahl unter Android). */
export function routeUrl(to) {
  const label = encodeURIComponent(to.name || "Ziel");
  if (Platform.OS === "ios") return `https://maps.apple.com/?daddr=${to.lat},${to.lon}&q=${label}`;
  return `geo:${to.lat},${to.lon}?q=${to.lat},${to.lon}(${label})`;
}

/* Kachel-Mathematik für die Mini-Karte (Web-Mercator). */
export function project(lat, lon, zoom) {
  const scale = 256 * 2 ** zoom;
  const x = ((lon + 180) / 360) * scale;
  const sin = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
  return { x, y };
}
