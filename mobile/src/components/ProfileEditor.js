import { router } from "expo-router";
import { IdCard } from "lucide-react-native";
import NotFound from "@/components/NotFound";
import ProfileForm from "@/components/ProfileForm";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n";
import { profiles } from "@/lib/storage";

/** Anlegen (`id` leer) oder Bearbeiten eines Notfallpasses. */
export default function ProfileEditor({ id }) {
  const { t } = useI18n();
  const toast = useToast();
  const existing = id ? profiles.get(id) : null;
  const title = existing ? t("pass.formEdit") : t("pass.formNew");

  if (id && !existing) {
    return (
      <Screen title={t("pass.notFound")}>
        <NotFound title="pass.notFound" text="pass.emptyText" back={{ to: "/pass", label: "pass.title" }} />
      </Screen>
    );
  }

  // Ohne Verlauf (z. B. direkt per Link geöffnet) zur Notfallpass-Liste statt ins Leere zurück.
  const leave = () => (router.canGoBack() ? router.back() : router.replace("/pass"));

  const save = (profile) => {
    profiles.save({ ...existing, ...profile });
    toast(t("pass.saved"));
    leave();
  };

  return (
    <Screen title={title} keyboard>
      <SectionHeader level={1} icon={IdCard} title={title} subtitle={t("pass.localOnly")} />
      <ProfileForm initial={existing} onSubmit={save} onCancel={leave} />
    </Screen>
  );
}
