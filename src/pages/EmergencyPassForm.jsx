import { useNavigate, useParams } from "react-router-dom";
import { IdCard } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import SectionHeader from "@/components/SectionHeader";
import { toast } from "@/components/ui/use-toast";
import { useI18n } from "@/lib/i18n";
import { profiles } from "@/lib/storage";
import PageNotFound from "@/pages/PageNotFound";

export default function EmergencyPassForm() {
  const { id } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const existing = id ? profiles.get(id) : null;

  if (id && !existing) {
    return <PageNotFound title="pass.notFound" text="pass.emptyText" back={{ to: "/pass", label: "pass.title" }} />;
  }

  const save = (profile) => {
    profiles.save({ ...existing, ...profile });
    toast({ title: t("pass.saved") });
    navigate("/pass");
  };

  return (
    <div className="space-y-6">
      <SectionHeader as="h1" icon={IdCard} title={existing ? t("pass.formEdit") : t("pass.formNew")} subtitle={t("pass.localOnly")} />
      <ProfileForm initial={existing} onSubmit={save} onCancel={() => navigate("/pass")} />
    </div>
  );
}
