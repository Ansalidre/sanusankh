import { Link, useParams } from "react-router-dom";
import { Phone, X } from "lucide-react";
import { telHref } from "@/data/numbers";
import { useI18n } from "@/lib/i18n";
import { profiles } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import PageNotFound from "@/pages/PageNotFound";

function lines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function Block({ label, items, none }) {
  return (
    <section className="border-t-2 border-black/10 py-4">
      <h2 className="text-lg font-bold uppercase tracking-wide text-black/60">{label}</h2>
      {items.length ? (
        <ul className="mt-1 space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-2xl font-bold leading-snug text-black">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xl text-black/60">{none}</p>
      )}
    </section>
  );
}

/** Vollbild-Notfallpass für Rettungskräfte – ohne App-Navigation, maximale Lesbarkeit. */
export default function EmergencyPassView() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const p = profiles.get(id);

  if (!p) {
    return (
      <main className="mx-auto max-w-3xl px-4">
        <PageNotFound title="pass.notFound" text="pass.emptyText" back={{ to: "/pass", label: "pass.title" }} />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black">
      <div className="sticky top-0 flex items-center justify-between gap-3 bg-emergency px-4 py-3 text-white">
        <p className="text-lg font-bold">{t("pass.forRescuers")}</p>
        <Link
          to="/pass"
          aria-label={t("common.close")}
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
        >
          <X className="h-8 w-8" aria-hidden="true" />
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-12 pt-6">
        <h1 className="text-4xl font-extrabold leading-tight text-black sm:text-5xl">{p.name}</h1>
        {p.birthDate && <p className="mt-1 text-2xl font-semibold">{t("pass.born", { date: formatDate(p.birthDate, lang) })}</p>}

        <div className="my-5 inline-flex max-w-full flex-wrap items-baseline gap-x-3 rounded-2xl border-4 border-emergency px-5 py-3">
          <span className="text-lg font-bold uppercase text-black/60">{t("pass.blood")}</span>
          <span className="ltr-nums break-words text-3xl font-extrabold text-emergency sm:text-4xl">{p.bloodType || t("pass.bloodUnknown")}</span>
        </div>

        <Block label={t("pass.allergies")} items={lines(p.allergies)} none={t("pass.none")} />
        <Block label={t("pass.conditions")} items={lines(p.conditions)} none={t("pass.none")} />
        <Block label={t("pass.medications")} items={lines(p.medications)} none={t("pass.none")} />

        {(p.doctorName || p.doctorPhone) && (
          <section className="border-t-2 border-black/10 py-4">
            <h2 className="text-lg font-bold uppercase tracking-wide text-black/60">{t("pass.doctor")}</h2>
            {p.doctorName && <p className="mt-1 text-2xl font-bold">{p.doctorName}</p>}
            {p.doctorPhone && (
              <a href={telHref(p.doctorPhone)} className="mt-2 inline-flex min-h-[3.5rem] items-center gap-3 rounded-xl bg-black px-5 text-2xl font-bold text-white">
                <Phone className="h-6 w-6" aria-hidden="true" />
                <span className="ltr-nums">{p.doctorPhone}</span>
              </a>
            )}
          </section>
        )}

        <section className="border-t-2 border-black/10 py-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-black/60">{t("pass.contacts")}</h2>
          {p.contacts?.length ? (
            <ul className="mt-2 space-y-3">
              {p.contacts.map((c, i) => (
                <li key={i}>
                  <p className="text-2xl font-bold">
                    {c.name}
                    {c.relation && <span className="font-semibold text-black/60"> · {c.relation}</span>}
                  </p>
                  {c.phone && (
                    <a
                      href={telHref(c.phone)}
                      className="mt-1 inline-flex min-h-[3.5rem] items-center gap-3 rounded-xl bg-emergency px-5 text-2xl font-bold text-white"
                    >
                      <Phone className="h-6 w-6" aria-hidden="true" />
                      <span className="ltr-nums">{c.phone}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xl text-black/60">{t("pass.none")}</p>
          )}
        </section>
      </div>
    </main>
  );
}
