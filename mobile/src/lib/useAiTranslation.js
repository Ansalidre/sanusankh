import { useCallback, useEffect, useState } from "react";

/**
 * Zeigt sofort den deutschen Inhalt und tauscht ihn gegen die KI-Übersetzung, sobald sie da ist.
 * status: "original" | "loading" | "translated" | "error"
 * `translator(source, lang)` muss ein Promise auf das übersetzte Objekt liefern (siehe lib/ai.js).
 * Der Status wird aus dem letzten Ergebnis abgeleitet; nur die Antwort des Servers setzt State.
 */
export function useAiTranslation(source, lang, translator, cacheId) {
  const [attempt, setAttempt] = useState(0);
  const [originalKey, setOriginalKey] = useState(null);
  const [result, setResult] = useState(null);
  const needsTranslation = Boolean(source) && lang !== "de";
  const key = `${cacheId}|${lang}|${attempt}`;
  const wantsOriginal = originalKey === key;

  useEffect(() => {
    if (!needsTranslation || wantsOriginal) return undefined;
    let active = true;
    translator(source, lang).then(
      (data) => active && setResult({ key, data, status: "translated" }),
      () => active && setResult({ key, data: source, status: "error" }),
    );
    return () => {
      active = false; // veraltete Antwort verwerfen
    };
    // key enthält cacheId und lang; source gehört zu cacheId, translator ist eine stabile Modulfunktion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, needsTranslation, wantsOriginal]);

  let state;
  if (!needsTranslation || wantsOriginal) state = { data: source, status: "original" };
  else if (result?.key === key) state = result;
  else state = { data: source, status: "loading" };

  const retranslate = useCallback(() => setAttempt((a) => a + 1), []);
  const showOriginal = useCallback(() => setOriginalKey(key), [key]);

  return { data: state.data, status: state.status, retranslate, showOriginal, needsTranslation };
}
