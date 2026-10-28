import { project } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";

const TILE = 256;
const ZOOM = 13;

/**
 * Kleine statische Karte aus 3×3 OpenStreetMap-Kacheln rund um den eigenen Standort.
 * Orte außerhalb des sichtbaren Ausschnitts werden ausgeblendet.
 */
export default function MiniMap({ center, places = [], height = 240 }) {
  const { t } = useI18n();
  const c = project(center.lat, center.lon, ZOOM);
  const tileX = Math.floor(c.x / TILE);
  const tileY = Math.floor(c.y / TILE);
  const originX = (tileX - 1) * TILE; // linke obere Ecke des 3×3-Rasters in Weltpixeln
  const originY = (tileY - 1) * TILE;

  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({ x: tileX + dx, y: tileY + dy, left: (dx + 1) * TILE, top: (dy + 1) * TILE });
    }
  }

  const toLocal = (lat, lon) => {
    const p = project(lat, lon, ZOOM);
    return { left: p.x - originX, top: p.y - originY };
  };
  const me = toLocal(center.lat, center.lon);
  const markers = places
    .map((p, i) => ({ ...toLocal(p.lat, p.lon), index: i + 1, emergency: p.emergency, id: p.id }))
    .filter((m) => m.left >= 0 && m.top >= 0 && m.left <= TILE * 3 && m.top <= TILE * 3);

  return (
    <figure className="overflow-hidden rounded-2xl border" dir="ltr">
      <div className="relative w-full overflow-hidden bg-muted" style={{ height }} role="img" aria-label={t("common.mapLabel")}>
        <div
          className="absolute"
          style={{
            width: TILE * 3,
            height: TILE * 3,
            left: `calc(50% - ${me.left}px)`,
            top: `calc(50% - ${me.top}px)`,
          }}
        >
          {tiles.map((tile) => (
            <img
              key={`${tile.x}-${tile.y}`}
              src={`https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png`}
              alt=""
              width={TILE}
              height={TILE}
              loading="lazy"
              draggable="false"
              className="absolute max-w-none select-none"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
          {markers.map((m) => (
            <span
              key={m.id}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow ${
                m.emergency ? "bg-emergency" : "bg-primary"
              }`}
              style={{ left: m.left, top: m.top }}
            >
              {m.index}
            </span>
          ))}
          <span
            className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,0.25)]"
            style={{ left: me.left, top: me.top }}
            title={t("common.youAreHere")}
          />
        </div>
      </div>
      <figcaption className="bg-card px-3 py-1.5 text-end text-xs text-muted-foreground">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
          {t("common.mapAttribution")}
        </a>
      </figcaption>
    </figure>
  );
}
