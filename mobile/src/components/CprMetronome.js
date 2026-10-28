import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { HeartPulse, Play, RotateCcw, Square } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, Muted, T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { useAnimatedValue } from "@/lib/useAnimatedValue";

const BPM = 100;
const INTERVAL_MS = 60000 / BPM; // exakt 600 ms
const KEEP_AWAKE_TAG = "cpr-metronome";
const CLICK = require("../../assets/sounds/click.wav");

/**
 * Takt-Hilfe für die Herzdruckmassage: 100 Schläge/Minute mit Klickton, Vibration und Lichtpuls.
 * Der Takt korrigiert sich selbst gegen die Uhr, damit er über Minuten nicht wegdriftet.
 * Solange er läuft, bleibt der Bildschirm an; der Ton spielt auch im Stummmodus.
 */
export default function CprMetronome() {
  const { t } = useI18n();
  const player = useAudioPlayer(CLICK);
  const pulse = useAnimatedValue(0);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});

    const click = () => {
      try {
        player.seekTo(0);
        player.play();
      } catch {
        // ohne Ton weiter (Vibration und Lichtpuls bleiben)
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setCount((c) => c + 1);
      pulse.setValue(1);
      Animated.timing(pulse, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    };

    let next = Date.now();
    let timer = null;
    const tick = () => {
      click();
      next += INTERVAL_MS;
      timer = setTimeout(tick, Math.max(0, next - Date.now()));
    };
    tick();

    return () => {
      clearTimeout(timer);
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [running, player, pulse]);

  const start = () => {
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers" }).catch(() => {});
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setCount(0);
  };

  return (
    <Card style={styles.gap}>
      <View style={styles.titleRow}>
        <Icon as={HeartPulse} color={colors.emergency} />
        <H2 style={styles.flex}>{t("guides.metroTitle")}</H2>
      </View>
      <Muted>{t("guides.metroHint")}</Muted>

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.circle,
            running ? styles.circleRunning : null,
            { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] },
          ]}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <Animated.View style={[StyleSheet.absoluteFill, styles.flash, { opacity: pulse }]} />
          <T ltr weight="black" size={40} align="center">
            {count}
          </T>
        </Animated.View>
        <T weight="semibold" align="center" accessibilityLiveRegion="polite">
          {t("guides.metroCount", { n: count })}
        </T>
      </View>

      <View style={styles.buttons}>
        {running ? (
          <Button size="lg" variant="emergency" icon={Square} label={t("guides.metroStop")} onPress={() => setRunning(false)} style={styles.flex} />
        ) : (
          <Button size="lg" variant="emergency" icon={Play} label={t("guides.metroStart")} onPress={start} style={styles.flex} />
        )}
        <Button size="lg" variant="outline" icon={RotateCcw} label={t("guides.metroReset")} onPress={reset} style={styles.flex} />
      </View>
      <Muted size="sm">{t("guides.metroCycle")}</Muted>
    </Card>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  center: { alignItems: "center", gap: 10, marginVertical: 6 },
  circle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  circleRunning: { borderColor: colors.emergency, backgroundColor: colors.emergencySoft },
  flash: { backgroundColor: "rgba(215,38,61,0.35)" },
  buttons: { flexDirection: "row", gap: 12 },
});
