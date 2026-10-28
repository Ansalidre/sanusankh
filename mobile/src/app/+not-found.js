import NotFound from "@/components/NotFound";
import Screen from "@/components/Screen";
import { useI18n } from "@/lib/i18n";

export default function NotFoundScreen() {
  const { t } = useI18n();
  return (
    <Screen title={t("common.notFoundTitle")}>
      <NotFound />
    </Screen>
  );
}
