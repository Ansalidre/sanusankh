import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Flower2, Globe, Navigation, Phone, RefreshCw, Send, Tag, WifiOff } from "lucide-react-native";
import LegalNote from "@/components/LegalNote";
import MiniMap from "@/components/MiniMap";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import TranslationStatus from "@/components/TranslationStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H2, H3, Muted, T } from "@/components/ui/Text";
import { translatePartner } from "@/lib/ai";
import { routeUrl } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";
import { openExternal, useCall } from "@/lib/links";
import { discountLabel, formatMoney, usePartners } from "@/lib/partners";
import { colors } from "@/lib/theme";
import { useAiTranslation } from "@/lib/useAiTranslation";
import { formatDate } from "@/lib/utils";

const GREEN = colors.ampel.gruen;

function priceText(price, currency, t, lang) {
  if (price == null) return t("partner.priceOnRequest");
  if (price === 0) return t("partner.free");
  return t("partner.priceFrom", { price: formatMoney(price, currency, lang) });
}

/** Detailseite eines Kooperations-Bestatters: Rabatt, Leistungen mit Richtpreisen, Kontakt und Karte. */
export default function PartnerDetail() {
  const { id } = useLocalSearchParams();
  const { t, lang, country } = useI18n();
  const call = useCall();
  const { partners, live, loading, fetchedAt, reload } = usePartners(country.code);
  const source = partners.find((p) => p.id === id) || null;
  const translation = useAiTranslation(source, lang, translatePartner, source ? `${source.id}.${fetchedAt}` : "none");
  const partner = translation.data;

  if (!partner) {
    return (
      <Screen title={t("care.funeral")} emergencyBar={false}>
        {loading ? <Muted>{t("common.loading")}</Muted> : <Notice>{t("partner.notFound")}</Notice>}
      </Screen>
    );
  }

  const canRequest = live && partner.bookable;
  const discount = discountLabel(partner.discount, partner.currency, t, lang);
  const place = { id: partner.id, name: partner.name, lat: partner.lat, lon: partner.lon };

  return (
    <Screen title={partner.name} emergencyBar={false}>
      <SectionHeader level={1} icon={Flower2} title={partner.name} subtitle={partner.address} />
      <Badge label={t(source.commission === true ? "partner.partnerBadge" : "partner.requestBadge")} style={styles.badge} />
      {translation.needsTranslation && <TranslationStatus status={translation.status} showButtons={false} />}

      {discount ? (
        <Card tone={GREEN} border="#A9D8BF" style={styles.small}>
          <View style={styles.inline}>
            <Icon as={Tag} color={GREEN.main} />
            <H2 size="lg" color={GREEN.main} style={styles.flex}>
              {discount}
            </H2>
          </View>
          {partner.discount.conditions ? <T>{partner.discount.conditions}</T> : null}
          {partner.discount.validTo ? <Muted size="sm">{t("partner.validUntil", { date: formatDate(partner.discount.validTo, lang) })}</Muted> : null}
        </Card>
      ) : null}

      <Muted>{t("partner.howItWorks")}</Muted>

      {!live && !loading && (
        <View style={styles.small}>
          <Notice icon={WifiOff} weight="semibold">
            {t("partner.offline")}
            {fetchedAt ? ` ${t("partner.cached", { date: formatDate(fetchedAt.slice(0, 10), lang) })}` : ""}
          </Notice>
          <Button variant="outline" icon={RefreshCw} label={t("partner.reconnect")} onPress={reload} />
        </View>
      )}
      {live && !partner.bookable && <Notice>{t("partner.unavailable")}</Notice>}

      <View style={styles.small}>
        <H2>{t("partner.services")}</H2>
        {partner.services.map((s) => (
          <Card key={s.id} border={colors.calm.border} style={styles.small}>
            <H3 color={colors.calm.main}>{s.title}</H3>
            {s.description ? <T>{s.description}</T> : null}
            <T weight="semibold">{priceText(s.priceFrom, partner.currency, t, lang)}</T>
            <Button
              icon={Send}
              label={t("partner.request")}
              disabled={!canRequest}
              accessibilityHint={canRequest ? undefined : t("partner.offline")}
              onPress={() => router.push({ pathname: "/care/request", params: { partner: partner.id, service: s.id } })}
            />
          </Card>
        ))}
      </View>

      <View style={styles.small}>
        <H2>{t("partner.contact")}</H2>
        {partner.lat != null && <MiniMap center={place} places={[place]} height={200} />}
        <View style={styles.actions}>
          <Button icon={Navigation} variant="outline" label={t("common.route")} accessibilityHint={t("common.externalLink")} onPress={() => openExternal(routeUrl(place))} style={styles.flex} />
          {partner.phone ? <Button variant="outline" icon={Phone} label={t("common.call")} onPress={() => call(partner.phone)} style={styles.flex} /> : null}
        </View>
        {partner.website ? (
          <Button variant="outline" icon={Globe} label={t("funeral.website")} accessibilityHint={t("common.externalLink")} onPress={() => openExternal(partner.website)} />
        ) : null}
      </View>

      <LegalNote>{source.commission === true ? `${t("partner.note")} ${t("partner.commissionNote")}` : t("partner.note")}</LegalNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  small: { gap: 8 },
  inline: { flexDirection: "row", alignItems: "center", gap: 8 },
  actions: { flexDirection: "row", gap: 8 },
  flex: { flex: 1 },
  badge: { backgroundColor: colors.ampel.gelb.soft, borderWidth: 1.5, borderColor: colors.ampel.gelb.main },
});
