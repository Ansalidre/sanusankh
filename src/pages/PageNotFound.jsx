import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Compass, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

/** 404-Seite; setzt `prerender-status-code` für Prerender-Dienste. Titel/Text als Übersetzungsschlüssel. */
export default function PageNotFound({
  title = "common.notFoundTitle",
  text = "common.notFoundText",
  back = { to: "/", label: "common.toHome" },
}) {
  const { t } = useI18n();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <section className="animate-rise flex flex-col items-center py-10 text-center">
      <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent text-primary">
        <Compass className="h-10 w-10" aria-hidden="true" />
      </span>
      <p className="mt-4 font-heading text-5xl font-extrabold text-primary">404</p>
      <h1 className="mt-2 text-2xl">{t(title)}</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">{t(text)}</p>
      <div className="mt-6 grid w-full max-w-sm gap-3">
        <Button asChild size="lg">
          <Link to={back.to}>{t(back.label)}</Link>
        </Button>
        <Button asChild size="lg" variant="emergency">
          <a href="tel:112">
            <Phone aria-hidden="true" />
            {t("common.call112")}
          </a>
        </Button>
      </div>
    </section>
  );
}
