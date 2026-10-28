import { Languages, LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

/** Hinweiszeile zum KI-Übersetzungsstatus inkl. Umschalten Original/Übersetzung. */
export default function TranslationStatus({ status, onTranslate, onShowOriginal, showButtons = true }) {
  const { t } = useI18n();

  if (status === "loading") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        {t("common.translating")}
      </p>
    );
  }
  if (status === "error") {
    return (
      <div className="space-y-2" role="status">
        <p className="flex items-start gap-2 rounded-xl bg-ampel-orange-soft p-3 text-sm text-ampel-orange">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t("common.translateError")}
        </p>
        {showButtons && (
          <Button variant="outline" size="sm" onClick={onTranslate}>
            <Languages aria-hidden="true" />
            {t("guides.translate")}
          </Button>
        )}
      </div>
    );
  }
  if (status === "translated") {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Languages className="h-4 w-4" aria-hidden="true" />
        <span>{t("common.machineTranslated")}</span>
        {showButtons && (
          <Button variant="link" size="sm" className="h-auto min-h-0 p-0" onClick={onShowOriginal}>
            {t("guides.showOriginal")}
          </Button>
        )}
      </div>
    );
  }
  if (status === "original" && showButtons) {
    return (
      <Button variant="outline" size="sm" onClick={onTranslate}>
        <Languages aria-hidden="true" />
        {t("guides.translate")}
      </Button>
    );
  }
  return null;
}
