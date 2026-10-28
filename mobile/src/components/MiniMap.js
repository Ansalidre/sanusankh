import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Muted, T } from "@/components/ui/Text";
import { OSM_HEADERS, project } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";
import { openExternal } from "@/lib/links";
import { colors, radius } from "@/lib/theme";

const TILE = 256;
const ZOOM = 13;

/**
 * Kleine statische Karte aus 3×3 OpenStreetMap-Kacheln rund um den eigenen Standort.
 * Orte außerhalb des sichtbaren Ausschnitts werden ausgeblendet.
 */
export default function MiniMap({ center, places = [], height = 240 }) {
  const { t } = useI18n();
  const [width, setWidth] = useState(0);
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
    <View style={styles.figure}>
      <View
        style={[styles.map, { height }]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t("common.mapLabel")}
      >
        {width > 0 && (
          <View style={[styles.layer, { left: width / 2 - me.left, top: height / 2 - me.top }]}>
            {tiles.map((tile) => (
              <Image
                key={`${tile.x}-${tile.y}`}
                source={{ uri: `https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png`, headers: OSM_HEADERS }}
                style={[styles.tile, { left: tile.left, top: tile.top }]}
              />
            ))}
            {markers.map((m) => (
              <View key={m.id} style={[styles.marker, { left: m.left - 14, top: m.top - 14, backgroundColor: m.emergency ? colors.emergency : colors.primary }]}>
                <T size="xs" weight="bold" color="#fff" align="center" ltr>
                  {m.index}
                </T>
              </View>
            ))}
            <View style={[styles.me, { left: me.left - 13, top: me.top - 13 }]}>
              <View style={styles.meDot} />
            </View>
          </View>
        )}
      </View>
      <Pressable onPress={() => openExternal("https://www.openstreetmap.org/copyright")} accessibilityRole="link" style={styles.caption}>
        <Muted size="xs" align="right" style={styles.underline}>
          {t("common.mapAttribution")}
        </Muted>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden", backgroundColor: colors.card },
  map: { overflow: "hidden", backgroundColor: colors.muted, direction: "ltr" },
  layer: { position: "absolute", width: TILE * 3, height: TILE * 3 },
  tile: { position: "absolute", width: TILE, height: TILE },
  marker: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  me: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(37,99,235,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  meDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: "#fff", backgroundColor: colors.me },
  caption: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32, justifyContent: "center" },
  underline: { textDecorationLine: "underline" },
});
