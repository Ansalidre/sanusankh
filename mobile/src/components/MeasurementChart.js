import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { Muted, T } from "@/components/ui/Text";
import { buildChart } from "@/lib/measurements";
import { colors, fonts } from "@/lib/theme";

const HEIGHT = 220;
const INK = colors.primary;

/**
 * Einfache Kurve der Messwerte. Alle Punkte in derselben Farbe – unabhängig von der Höhe des Werts;
 * Achse nur aus den eingetragenen Werten, keine Referenzlinien, keine Bereiche, keine Trendangaben.
 * Die Zeitachse läuft auch in RTL von links nach rechts.
 */
export default function MeasurementChart({ series, from, to, minSpan, formatY, formatX, legend, accessibilityLabel }) {
  const [width, setWidth] = useState(0);
  const chart = width ? buildChart({ series, from, to, width, height: HEIGHT, minSpan, formatY, formatX }) : null;
  const font = fonts.latin.medium;

  return (
    <View style={styles.wrap}>
      <View
        style={styles.canvas}
        onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      >
        {chart && (
          <Svg width={chart.width} height={chart.height}>
            {chart.yTicks.map((tick) => (
              <Line key={`g${tick.y}`} x1={chart.plot.left} x2={chart.plot.right} y1={tick.y} y2={tick.y} stroke={colors.border} strokeWidth={1} />
            ))}
            {chart.yTicks.map((tick) => (
              <SvgText key={`l${tick.y}`} x={chart.plot.left - 8} y={tick.y + 4} fontSize={12} fontFamily={font} fill={colors.mutedForeground} textAnchor="end">
                {tick.label}
              </SvgText>
            ))}
            {chart.xLabels.map((l) => (
              <SvgText key={`x${l.anchor}`} x={l.x} y={chart.height - 8} fontSize={12} fontFamily={font} fill={colors.mutedForeground} textAnchor={l.anchor}>
                {l.label}
              </SvgText>
            ))}
            {chart.lines.map((line) => (
              <Path key={line.key} d={line.d} stroke={INK} strokeWidth={2} fill="none" strokeDasharray={line.dashed ? "6 5" : undefined} />
            ))}
            {chart.lines.flatMap((line) =>
              line.points.map((p, i) =>
                line.marker === "square" ? (
                  <Rect key={`${line.key}${i}`} x={p.x - 4} y={p.y - 4} width={8} height={8} fill={colors.card} stroke={INK} strokeWidth={2} />
                ) : (
                  <Circle key={`${line.key}${i}`} cx={p.x} cy={p.y} r={4.5} fill={p.converted ? colors.card : INK} stroke={INK} strokeWidth={2} />
                ),
              ),
            )}
          </Svg>
        )}
      </View>
      {legend?.length ? (
        <View style={styles.legend}>
          {legend.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <Svg width={28} height={12}>
                <Line x1={2} x2={26} y1={6} y2={6} stroke={INK} strokeWidth={2} strokeDasharray={item.dashed ? "6 5" : undefined} />
                {item.marker === "square" ? (
                  <Rect x={10} y={2} width={8} height={8} fill={colors.card} stroke={INK} strokeWidth={2} />
                ) : (
                  <Circle cx={14} cy={6} r={4} fill={item.hollow ? colors.card : INK} stroke={INK} strokeWidth={2} />
                )}
              </Svg>
              <Muted size="sm">{item.label}</Muted>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Platzhalter, wenn im Zeitraum nichts eingetragen ist. */
export function EmptyChart({ text }) {
  return (
    <View style={[styles.canvas, styles.empty]}>
      <T align="center" color={colors.mutedForeground}>
        {text}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  canvas: { height: HEIGHT, direction: "ltr" },
  empty: { alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 12, backgroundColor: colors.muted },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
});
