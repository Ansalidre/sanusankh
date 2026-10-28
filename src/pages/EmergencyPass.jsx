import { useState } from "react";
import { Link } from "react-router-dom";
import { IdCard, Maximize2, Pencil, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import LegalNote from "@/components/LegalNote";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { profiles } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

export default function EmergencyPass() {
  const { t, lang } = useI18n();
  const [list, setList] = useState(() => profiles.list());
  const [toDelete, setToDelete] = useState(null);

  const remove = () => {
    profiles.remove(toDelete.id);
    setList(profiles.list());
  };

  return (
    <div className="space-y-6">
      <SectionHeader as="h1" icon={IdCard} title={t("pass.title")} subtitle={t("pass.intro")} />

      {list.length === 0 ? (
        <section className="card-soft flex flex-col items-center p-8 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
            <IdCard className="h-8 w-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl">{t("pass.emptyTitle")}</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">{t("pass.emptyText")}</p>
          <Button asChild size="lg" className="mt-5 w-full max-w-xs">
            <Link to="/pass/new">
              <Plus aria-hidden="true" />
              {t("pass.new")}
            </Link>
          </Button>
        </section>
      ) : (
        <>
          <ul className="space-y-3">
            {list.map((p) => (
              <li key={p.id} className="card-soft p-4">
                <h2 className="text-xl">{p.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {[p.birthDate && t("pass.born", { date: formatDate(p.birthDate, lang) }), p.bloodType && `${t("pass.blood")}: ${p.bloodType}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <Button asChild variant="emergency">
                    <Link to={`/pass/${p.id}/show`}>
                      <Maximize2 aria-hidden="true" />
                      {t("pass.show")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/pass/${p.id}`}>
                      <Pencil aria-hidden="true" />
                      {t("common.edit")}
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={() => setToDelete(p)}>
                    <Trash2 aria-hidden="true" />
                    {t("common.delete")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link to="/pass/new">
              <Plus aria-hidden="true" />
              {t("pass.new")}
            </Link>
          </Button>
        </>
      )}

      <LegalNote>{t("pass.localOnly")}</LegalNote>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t("pass.deleteTitle")}
        description={toDelete ? t("pass.deleteText", { name: toDelete.name }) : ""}
        onConfirm={remove}
      />
    </div>
  );
}
