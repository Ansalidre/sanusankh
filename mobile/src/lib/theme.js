/* Design-Tokens – entsprechen den HSL-Variablen der Web-Version (src/index.css), umgerechnet in Hex. */

export const colors = {
  background: "#F9FAFB",
  foreground: "#171F26",
  card: "#FFFFFF",
  primary: "#0C495A",
  primaryForeground: "#FFFFFF",
  secondary: "#EFF4F5",
  secondaryForeground: "#0A3E4C",
  muted: "#F3F5F7",
  mutedForeground: "#55636D",
  accent: "#E6F3F5",
  border: "#DBE1E6",
  destructive: "#C52036",
  emergency: "#D7263D",
  emergencyDark: "#B01E33",
  emergencySoft: "#FDECEF",
  me: "#2563EB",
  /** Ruhiger Ton für den Bereich „Vorsorge“ (kein Notfallrot, kein Warnorange). */
  calm: { main: "#3F5566", soft: "#EEF2F5", border: "#D3DCE3" },
  ampel: {
    rot: { main: "#D7263D", soft: "#FDECEF" },
    orange: { main: "#B4550C", soft: "#FDF0E3" },
    gelb: { main: "#8A6A00", soft: "#FBF4DC" },
    gruen: { main: "#1B7A4B", soft: "#E9F5EF" },
  },
};

/** Mindestgröße für Bedienelemente (Vorgabe: 52 px). */
export const TAP = 52;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32 };

/** Schriftfamilien je Gewicht; Arabisch nutzt IBM Plex Sans Arabic. */
export const fonts = {
  latin: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    heading: "Figtree_700Bold",
    black: "Figtree_800ExtraBold",
  },
  arabic: {
    regular: "IBMPlexSansArabic_400Regular",
    medium: "IBMPlexSansArabic_500Medium",
    semibold: "IBMPlexSansArabic_600SemiBold",
    bold: "IBMPlexSansArabic_700Bold",
    heading: "IBMPlexSansArabic_700Bold",
    black: "IBMPlexSansArabic_700Bold",
  },
};

export const sizes = {
  xs: 13,
  sm: 15,
  base: 17,
  lg: 19,
  xl: 21,
  "2xl": 25,
  "3xl": 29,
  "4xl": 36,
};

export const shadow = {
  shadowColor: "#102A38",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};
