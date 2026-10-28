import { StyleSheet, View } from "react-native";
import { ExternalLink, Info } from "lucide-react-native";
import Notice from "@/components/Notice";
import TranslationStatus from "@/components/TranslationStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { H2, H3, T } from "@/components/ui/Text";
import { translateCare } from "@/lib/ai";
import { careInfo } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { openExternal } from "@/lib/links";
import { colors } from "@/lib/theme";
import { useAiTranslation } from "@/lib/useAiTranslation";

/** Erklärtext eines Vorsorge-Themas für das gewählte Land (src/content/careInfo.json) inkl. offizieller Links. */
export default function CareInfo({ topic }) {
  const { t, lang, country } = useI18n();
  const source = careInfo(country.code, topic);
  const translation = useAiTranslation(source, lang, translateCare, source ? `${source.id}` : "none");
  const info = translation.data;

  if (!info) {
    return (
      <Notice tone={colors.calm} icon={Info}>
        {t("care.noContent")}
      </Notice>
    );
  }

  return (
    <View style={styles.gap}>
      {translation.needsTranslation && <TranslationStatus status={translation.status} showButtons={false} />}
      {info.sections.map((s) => (
        <Card key={s.heading} border={colors.calm.border} style={styles.small}>
          <H3 color={colors.calm.main}>{s.heading}</H3>
          <T>{s.text}</T>
        </Card>
      ))}
      {info.links?.length > 0 && (
        <View style={styles.small}>
          <H2 size="lg">{t("care.links")}</H2>
          {info.links.map((l) => (
            <Button
              key={l.url}
              variant="outline"
              icon={ExternalLink}
              align="start"
              label={l.label}
              accessibilityHint={t("common.externalLink")}
              onPress={() => openExternal(l.url)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  small: { gap: 8 },
});
