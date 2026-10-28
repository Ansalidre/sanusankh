import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Languages, X } from "lucide-react";
import { LANGUAGES } from "@/data/languages";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Sprachwahl. Das Modal wird per Portal an document.body gehängt: Der Header nutzt
 * backdrop-blur und wäre sonst Containing Block für `position: fixed`.
 */
export default function LanguagePicker({ className }) {
  const { lang, language, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  const choose = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${t("common.chooseLanguage")}: ${language.label}`}
        className={cn(
          "tap gap-2 rounded-full border-2 border-border bg-card px-3 text-base font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
          className,
        )}
      >
        <span className="text-xl leading-none" aria-hidden="true">
          {language.flag}
        </span>
        <span className="max-w-[7rem] truncate">{language.label}</span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="language-picker-title"
              dir={language.dir}
              onClick={(e) => e.stopPropagation()}
              className="animate-rise flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-xl sm:rounded-3xl"
            >
              <div className="sticky top-0 flex items-center justify-between gap-3 border-b bg-card px-5 py-3">
                <h2 id="language-picker-title" className="flex items-center gap-2 text-lg">
                  <Languages className="h-5 w-5 text-primary" aria-hidden="true" />
                  {t("common.chooseLanguage")}
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("common.close")}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <ul className="overflow-y-auto p-3 pb-safe" role="listbox" aria-label={t("common.language")}>
                {LANGUAGES.map((l) => {
                  const active = l.code === lang;
                  return (
                    <li key={l.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        lang={l.code}
                        dir={l.dir}
                        onClick={() => choose(l.code)}
                        className={cn(
                          "tap w-full justify-start gap-4 rounded-xl px-4 text-start text-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                          active ? "bg-accent font-semibold text-primary" : "hover:bg-muted",
                        )}
                      >
                        <span className="text-2xl leading-none" aria-hidden="true">
                          {l.flag}
                        </span>
                        <span className="flex-1">{l.label}</span>
                        {active && <Check className="h-5 w-5" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
