import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Zeigt sofort den deutschen Inhalt und tauscht ihn gegen die KI-Übersetzung, sobald sie da ist.
 * status: "original" | "loading" | "translated" | "error"
 * `translator(source, lang)` muss ein Promise auf das übersetzte Objekt liefern (siehe lib/ai.js).
 */
export function useAiTranslation(source, lang, translator, cacheId) {
  const [state, setState] = useState({ data: source, status: "original" });
  const requestRef = useRef(0);

  const run = useCallback(async () => {
    if (!source || lang === "de") {
      setState({ data: source, status: "original" });
      return;
    }
    const request = ++requestRef.current;
    setState({ data: source, status: "loading" });
    try {
      const data = await translator(source, lang);
      if (request === requestRef.current) setState({ data, status: "translated" });
    } catch {
      if (request === requestRef.current) setState({ data: source, status: "error" });
    }
    // cacheId bestimmt, wann neu übersetzt werden muss; translator ist stabil (Modulfunktion)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheId, lang]);

  useEffect(() => {
    run();
    const ref = requestRef;
    return () => {
      ref.current++; // laufende Anfrage verwerfen
    };
  }, [run]);

  const showOriginal = useCallback(() => {
    requestRef.current++;
    setState({ data: source, status: "original" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheId]);

  return { ...state, retranslate: run, showOriginal, needsTranslation: Boolean(source) && lang !== "de" };
}
