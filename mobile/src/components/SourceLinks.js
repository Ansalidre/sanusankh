import { StyleSheet, View } from "react-native";
import { ExternalLink } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Muted } from "@/components/ui/Text";
import { ORGANIZATIONS } from "@/data/firstAidGuides";
import { useI18n } from "@/lib/i18n";
import { openExternal } from "@/lib/links";

/** Links zu Seiten anerkannter Hilfsorganisationen (`links`: [{ org, url }]); ohne `links` die Übersichtsseiten. */
export default function SourceLinks({ links }) {
  const { t, lang } = useI18n();
  const items = links ?? Object.entries(ORGANIZATIONS).map(([org, o]) => ({ org, url: o.url }));
  return (
    <View style={styles.gap}>
      {items.map((l) => (
        <Button
          key={l.url}
          variant="outline"
          icon={ExternalLink}
          label={ORGANIZATIONS[l.org]?.name ?? l.org}
          accessibilityHint={t("common.externalLink")}
          onPress={() => openExternal(l.url)}
        />
      ))}
      {lang !== "de" && <Muted size="sm">{t("guides.germanOnly")}</Muted>}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 10 },
});
