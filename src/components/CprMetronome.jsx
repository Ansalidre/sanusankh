import { useCallback, useEffect, useRef, useState } from "react";
import { HeartPulse, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const BPM = 100;
const INTERVAL_MS = 60000 / BPM; // exakt 600 ms

/** Takt-Hilfe für die Herzdruckmassage: 100 Schläge/Minute mit Klickton (Web Audio) und Vibration. */
export default function CprMetronome() {
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [beat, setBeat] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const click = useCallback(() => {
    const ctx = audioRef.current;
    if (ctx) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
    if (navigator.vibrate) navigator.vibrate(40);
    setCount((c) => c + 1);
    setBeat(true);
    window.setTimeout(() => setBeat(false), 150);
  }, []);

  const start = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx && !audioRef.current) audioRef.current = new Ctx();
      audioRef.current?.resume?.();
    } catch {
      audioRef.current = null; // ohne Ton weiter (nur visuell/Vibration)
    }
    click();
    timerRef.current = window.setInterval(click, INTERVAL_MS);
    setRunning(true);
  };

  const stop = () => {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  };

  const reset = () => {
    stop();
    setCount(0);
  };

  useEffect(
    () => () => {
      window.clearInterval(timerRef.current);
      audioRef.current?.close?.();
    },
    [],
  );

  return (
    <section className="card-soft p-5" aria-labelledby="metronome-title">
      <h2 id="metronome-title" className="flex items-center gap-2 text-xl">
        <HeartPulse className="h-6 w-6 text-emergency" aria-hidden="true" />
        {t("guides.metroTitle")}
      </h2>
      <p className="mt-1 text-muted-foreground">{t("guides.metroHint")}</p>

      <div className="my-5 flex flex-col items-center gap-3">
        <div
          className={cn(
            "flex h-32 w-32 items-center justify-center rounded-full border-4 transition-transform duration-100",
            running ? "border-emergency bg-emergency-soft" : "border-border bg-muted",
            beat && "scale-110 bg-emergency text-white",
          )}
          aria-hidden="true"
        >
          <span className="ltr-nums font-heading text-4xl font-extrabold">{count}</span>
        </div>
        <p className="font-semibold" aria-live="polite">
          {t("guides.metroCount", { n: count })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {running ? (
          <Button size="lg" variant="emergency" onClick={stop}>
            <Square aria-hidden="true" />
            {t("guides.metroStop")}
          </Button>
        ) : (
          <Button size="lg" variant="emergency" onClick={start}>
            <Play aria-hidden="true" />
            {t("guides.metroStart")}
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          {t("guides.metroReset")}
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{t("guides.metroCycle")}</p>
    </section>
  );
}
