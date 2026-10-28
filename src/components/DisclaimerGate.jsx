import { createPortal } from "react-dom";
import { Check, Phone, ShieldCheck } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import LanguagePicker from "@/components/LanguagePicker";
import { Button } from "@/components/ui/button";
import { useDisclaimerAccepted, useI18n } from "@/lib/i18n";

/** Hinweis beim ersten Besuch. Enthält selbst einen 112-Button, damit nichts den Notruf blockiert. */
export default function DisclaimerGate() {
  const { t } = useI18n();
  const [accepted, accept] = useDisclaimerAccepted();
  if (accepted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-foreground/50 p-3 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
        className="animate-rise card-soft w-full max-w-md p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <BrandMark />
          <LanguagePicker />
        </div>
        <h2 id="disclaimer-title" className="text-2xl">
          {t("disclaimer.title")}
        </h2>
        <p className="mt-2 text-lg font-semibold">{t("disclaimer.text")}</p>
        <ul className="mt-4 space-y-2">
          {["disclaimer.point1", "disclaimer.point2", "disclaimer.point3"].map((key) => (
            <li key={key} className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3">
          <Button size="lg" onClick={accept} autoFocus>
            <Check aria-hidden="true" />
            {t("disclaimer.accept")}
          </Button>
          <Button asChild size="lg" variant="emergency">
            <a href="tel:112">
              <Phone aria-hidden="true" />
              {t("common.call112")}
            </a>
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
