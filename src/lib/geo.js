/* Standort und Ortssuche über die OpenStreetMap-Overpass-API. */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export class GeoError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // "denied" | "unavailable" | "unsupported" | "network"
  }
}

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new GeoError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new GeoError(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable")),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 120000 },
    );
  });
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
};

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
      headers: { "content-type": "application/x-www-form-urlencoded" },
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

export function routeUrl(from, to) {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${from.lat}%2C${from.lon}%3B${to.lat}%2C${to.lon}`;
}

/* Kachel-Mathematik für die Mini-Karte (Web-Mercator). */
export function project(lat, lon, zoom) {
  const scale = 256 * 2 ** zoom;
  const x = ((lon + 180) / 360) * scale;
  const sin = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
  return { x, y };
}
