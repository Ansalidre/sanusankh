import { StyleSheet, View } from "react-native";
import { Clock, Globe, MapPin, Navigation, Phone } from "lucide-react-native";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { H3, Muted, T } from "@/components/ui/Text";
import { routeUrl } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";
import { openExternal, useCall } from "@/lib/links";
import { colors } from "@/lib/theme";

export default function PlaceList({ places, emergencyLabel }) {
  const { t, lang } = useI18n();
  const call = useCall();
  const km = (d) => d.toLocaleString(lang, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

  return (
    <View style={styles.list}>
      {places.map((place, i) => (
        <Card key={place.id} style={styles.gap}>
          <View style={styles.row}>
            <View style={[styles.num, { backgroundColor: place.emergency ? colors.emergency : place.badge ? colors.ampel.gelb.main : colors.primary }]}>
              <T size="sm" weight="bold" color="#fff" align="center">
                {i + 1}
              </T>
            </View>
            <View style={styles.info}>
              <H3>{place.name || t("common.unnamed")}</H3>
              <View style={styles.inline}>
                <Icon as={MapPin} size={16} color={colors.primary} />
                <T size="sm" weight="semibold" color={colors.primary}>
                  {place.distanceKm != null ? t("common.distanceKm", { km: km(place.distanceKm) }) : ""}
                </T>
              </View>
              {place.emergency && emergencyLabel && <Badge variant="emergency" label={emergencyLabel} />}
              {place.badge ? <Badge label={place.badge} style={styles.adBadge} /> : null}
              {place.address ? <Muted size="sm">{place.address}</Muted> : null}
              {place.openingHours ? (
                <View style={styles.inline} accessible accessibilityLabel={`${t("common.hours")}: ${place.openingHours}`}>
                  <Icon as={Clock} size={16} color={colors.mutedForeground} />
                  <Muted size="sm" ltr style={styles.flex}>
                    {place.openingHours}
                  </Muted>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.actions}>
            <Button
              icon={Navigation}
              label={t("common.route")}
              accessibilityHint={t("common.externalLink")}
              onPress={() => openExternal(routeUrl(place))}
              style={styles.flex}
            />
            {place.phone ? (
              <Button variant="outline" icon={Phone} label={t("common.call")} onPress={() => call(place.phone.split(";")[0].trim())} style={styles.flex} />
            ) : (
              <View style={styles.flex} />
            )}
          </View>
          {place.website ? (
            <Button
              variant="outline"
              icon={Globe}
              label={t("funeral.website")}
              accessibilityHint={t("common.externalLink")}
              onPress={() => openExternal(place.website)}
            />
          ) : null}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  gap: { gap: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  num: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: 4 },
  inline: { flexDirection: "row", alignItems: "center", gap: 4 },
  actions: { flexDirection: "row", gap: 8 },
  flex: { flex: 1 },
  adBadge: { backgroundColor: colors.ampel.gelb.soft, borderWidth: 1.5, borderColor: colors.ampel.gelb.main },
});
