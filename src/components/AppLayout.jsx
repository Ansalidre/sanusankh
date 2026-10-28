import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Activity, BookOpen, Ellipsis, House, IdCard, Phone } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import DisclaimerGate from "@/components/DisclaimerGate";
import LanguagePicker from "@/components/LanguagePicker";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", key: "nav.home", icon: House, end: true },
  { to: "/triage", key: "nav.triage", icon: Activity },
  { to: "/guides", key: "nav.guides", icon: BookOpen },
  { to: "/pass", key: "nav.pass", icon: IdCard },
  { to: "/settings", key: "nav.more", icon: Ellipsis },
];

// Unterseiten, die unter „Mehr“ einsortiert sind
const MORE_PATHS = ["/settings", "/numbers", "/pharmacy", "/telemedicine", "/transport", "/hospitals", "/history", "/impressum", "/datenschutz", "/haftungsausschluss"];

function useIsActive() {
  const { pathname } = useLocation();
  return (item) => {
    if (item.end) return pathname === item.to;
    if (item.to === "/settings") return MORE_PATHS.some((p) => pathname.startsWith(p));
    return pathname.startsWith(item.to);
  };
}

export default function AppLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const isActive = useIsActive();
  const showEmergencyBar = !pathname.startsWith("/triage");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-[70] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:font-semibold focus:shadow"
      >
        {t("nav.skip")}
      </a>

      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-3 rounded-xl py-1" aria-label={t("brand.name")}>
              <BrandMark className="rounded-xl" />
              <span className="min-w-0">
                <span className="block font-heading text-xl font-bold leading-tight text-primary">{t("brand.name")}</span>
                <span className="hidden truncate text-sm text-muted-foreground sm:block">{t("brand.tagline")}</span>
              </span>
            </Link>
            <LanguagePicker />
          </div>

          {showEmergencyBar && (
            <a
              href="tel:112"
              className="pulse-emergency mt-2 flex min-h-[3.5rem] w-full items-center justify-center gap-3 rounded-2xl bg-emergency px-4 text-lg font-bold text-white hover:bg-emergency-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emergency focus-visible:ring-offset-2"
            >
              <Phone className="h-6 w-6" aria-hidden="true" />
              {t("common.call112")}
            </a>
          )}

          <nav aria-label={t("nav.main")} className="mt-2 hidden md:block">
            <ul className="flex gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={cn(
                      "tap gap-2 rounded-xl px-4 text-base font-semibold",
                      isActive(item) ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 md:pb-12">
        <Outlet />
      </main>

      <footer className="border-t bg-card pb-28 md:pb-0">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{t("footer.hint")}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link to="/impressum" className="underline-offset-4 hover:underline">
                {t("legal.impressum")}
              </Link>
            </li>
            <li>
              <Link to="/datenschutz" className="underline-offset-4 hover:underline">
                {t("legal.datenschutz")}
              </Link>
            </li>
            <li>
              <Link to="/haftungsausschluss" className="underline-offset-4 hover:underline">
                {t("legal.haftung")}
              </Link>
            </li>
          </ul>
          <p className="mt-3">{t("footer.rights", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      <nav
        aria-label={t("nav.main")}
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-safe backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-3xl grid-cols-5">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[4rem] flex-col items-center justify-center gap-1 px-0.5 text-[0.66rem] font-semibold leading-tight",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className={cn("inline-flex h-8 w-12 items-center justify-center rounded-full", active && "bg-accent")}>
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="line-clamp-2 max-w-full text-center">{t(item.key)}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <DisclaimerGate />
    </div>
  );
}
