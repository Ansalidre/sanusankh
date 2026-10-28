import { Text as RNText } from "react-native";
import { useI18n } from "@/lib/i18n";
import { colors, fonts, sizes } from "@/lib/theme";

const ARABIC = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const LATIN = /[A-Za-zÄÖÜäöüß]/;

/** Rein lateinischer Text (z. B. deutscher Originaltext ohne KI-Übersetzung) wird auch in RTL links-nach-rechts gesetzt. */
function isLatinOnly(children) {
  return typeof children === "string" && LATIN.test(children) && !ARABIC.test(children);
}

/**
 * Text mit Schriftfamilie je Gewicht und Sprache. Die Ausrichtung folgt der Leserichtung,
 * weil RTL über `direction` statt über I18nManager läuft (iOS richtet „auto“ sonst links aus).
 * `ltr` erzwingt links-nach-rechts – für Telefonnummern und Uhrzeiten in arabischer Oberfläche.
 */
export function T({ weight = "regular", size = "base", color = colors.foreground, align, ltr = false, style, children, ...props }) {
  const { rtl } = useI18n();
  const fontSize = typeof size === "number" ? size : sizes[size];
  const heading = weight === "heading" || weight === "black";
  const direction = ltr || (rtl && isLatinOnly(children)) ? "ltr" : rtl ? "rtl" : "ltr";
  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      android_hyphenationFrequency="normal"
      {...props}
      style={[
        {
          fontFamily: fonts[rtl ? "arabic" : "latin"][weight],
          fontSize,
          lineHeight: Math.round(fontSize * (heading ? 1.25 : 1.45)),
          color,
          textAlign: align ?? (direction === "rtl" ? "right" : "left"),
          writingDirection: direction,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

export function H1({ style, ...props }) {
  return <T weight="heading" size="3xl" accessibilityRole="header" style={style} {...props} />;
}

export function H2({ style, ...props }) {
  return <T weight="heading" size="xl" accessibilityRole="header" style={style} {...props} />;
}

export function H3({ style, ...props }) {
  return <T weight="heading" size="lg" accessibilityRole="header" style={style} {...props} />;
}

export function Muted(props) {
  return <T color={colors.mutedForeground} {...props} />;
}
