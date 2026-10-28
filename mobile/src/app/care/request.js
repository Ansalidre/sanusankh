import { useState } from "react";
import { StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { HandCoins, Paperclip, Send, WifiOff, X } from "lucide-react-native";
import { DateField } from "@/components/DateField";
import Notice from "@/components/Notice";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckRow } from "@/components/ui/CheckRow";
import { SelectField } from "@/components/ui/SelectField";
import { Muted, T } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { translatePartner } from "@/lib/ai";
import { useI18n } from "@/lib/i18n";
import { sendRequest, usePartners } from "@/lib/partners";
import { profiles } from "@/lib/storage";
import { colors } from "@/lib/theme";
import { useAiTranslation } from "@/lib/useAiTranslation";
import { toIsoDate } from "@/lib/utils";

const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/;
const PHONE = /^[0-9+()/\s.-]{5,40}$/;
const TIMES = ["any", "morning", "afternoon", "evening"];
const TIME_KEYS = { any: "request.timeAny", morning: "request.timeMorning", afternoon: "request.timeAfternoon", evening: "request.timeEvening" };
const SERVER_ERRORS = { offline: "partner.offline", rate_limited: "request.errRate", partner_unavailable: "request.errUnavailable", service_unavailable: "request.errUnavailable" };

/**
 * Anfrage bei einem Kooperations-Bestatter. Abgefragt wird nur das Nötigste; gesendet werden nur
 * die Angaben in diesem Formular. Bestattungswünsche aus dem Notfallpass nur per eigenem Klick.
 */
export default function Request() {
  const { partner: partnerId, service: serviceId } = useLocalSearchParams();
  const { t, lang, country } = useI18n();
  const { partners, live, loading, fetchedAt } = usePartners(country.code);
  const source = partners.find((p) => p.id === partnerId) || null;
  const partner = useAiTranslation(source, lang, translatePartner, source ? `${source.id}.${fetchedAt}` : "none").data;
  const service = partner?.services.find((s) => s.id === serviceId);
  // Original (deutsch) für die E-Mail an den Bestatter; die Anzeige darf übersetzt sein.
  const sourceService = source?.services.find((s) => s.id === serviceId);

  const [form, setForm] = useState({ name: "", phone: "", email: "", preferredDate: "", preferredTime: "any", message: "" });
  const [wishes, setWishes] = useState(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");

  const wishProfiles = profiles.list().filter((p) => p.funeralWishes?.trim());
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  if (!partner || !service) {
    return (
      <Screen title={t("request.title")} emergencyBar={false}>
        {loading ? <Muted>{t("common.loading")}</Muted> : <Notice>{t("request.errUnavailable")}</Notice>}
      </Screen>
    );
  }

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = t("request.errName");
    if (!EMAIL.test(form.email.trim())) next.email = t("request.errEmail");
    if (form.phone.trim() && !PHONE.test(form.phone.trim())) next.phone = t("request.errPhone");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setServerError("");
    if (!validate()) return;
    setSending(true);
    try {
      const result = await sendRequest({
        partner: source,
        service: sourceService,
        form: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          preferredDate: form.preferredDate && form.preferredDate >= toIsoDate(new Date()) ? form.preferredDate : "",
          preferredTime: form.preferredTime,
          message: form.message.trim(),
          wishes: wishes?.text || "",
        },
      });
      router.replace({ pathname: "/care/sent", params: { code: result.code, delivery: result.delivery, mailed: result.userMail ? "1" : "0" } });
    } catch (error) {
      const fields = error.data?.fields || [];
      if (fields.length) {
        setErrors({
          name: fields.includes("name") ? t("request.errName") : undefined,
          email: fields.includes("email") ? t("request.errEmail") : undefined,
          phone: fields.includes("phone") ? t("request.errPhone") : undefined,
        });
      }
      setServerError(t(SERVER_ERRORS[error.code] || "request.errFailed"));
      setSending(false);
    }
  };

  const attach = (profile) => setWishes({ name: profile.name, text: profile.funeralWishes.trim() });

  return (
    <Screen title={t("request.title")} emergencyBar={false} keyboard>
      <SectionHeader level={1} icon={Send} title={service.title} subtitle={partner.name} />

      <Card border={colors.calm.border} style={styles.gap}>
        <TextField label={t("request.name")} value={form.name} onChangeText={set("name")} autoComplete="name" textContentType="name" error={errors.name} />
        <TextField
          label={t("request.email")}
          hint={t("request.emailHint")}
          value={form.email}
          onChangeText={set("email")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          ltr
          error={errors.email}
        />
        <TextField label={t("request.phone")} value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" ltr error={errors.phone} />
        <DateField label={t("request.date")} value={form.preferredDate} onChange={set("preferredDate")} future notPast />
        <SelectField
          label={t("request.time")}
          value={form.preferredTime}
          options={TIMES.map((v) => ({ value: v, label: t(TIME_KEYS[v]) }))}
          onChange={set("preferredTime")}
        />
        <TextField label={t("request.message")} value={form.message} onChangeText={set("message")} multiline maxLength={1000} />
      </Card>

      {wishProfiles.length > 0 && (
        <Card tone={colors.calm} border={colors.calm.border} style={styles.small}>
          {wishes ? (
            <>
              <T weight="semibold">{t("request.wishesFrom", { name: wishes.name })}</T>
              <T>{wishes.text}</T>
              <Button variant="outline" icon={X} label={t("request.wishesRemove")} onPress={() => setWishes(null)} />
            </>
          ) : (
            <>
              <Muted size="sm">{t("request.wishesHint")}</Muted>
              {wishProfiles.length === 1 ? (
                <Button variant="outline" icon={Paperclip} label={t("request.wishesAttach")} onPress={() => attach(wishProfiles[0])} />
              ) : (
                <SelectField
                  label={t("request.wishesAttach")}
                  value={null}
                  placeholder={t("pass.title")}
                  options={wishProfiles.map((p) => ({ value: p.id, label: p.name }))}
                  onChange={(id) => attach(wishProfiles.find((p) => p.id === id))}
                />
              )}
            </>
          )}
        </Card>
      )}

      <Notice tone={colors.calm} icon={HandCoins} weight="semibold">
        {t("request.commission")}
      </Notice>

      <CheckRow checked={consent} onChange={setConsent} label={t("request.consent", { partner: partner.name })} hint={t("request.consentHint")} />

      {!live && !loading && (
        <Notice icon={WifiOff} weight="semibold">
          {t("partner.offline")}
        </Notice>
      )}
      {serverError ? <Notice weight="semibold">{serverError}</Notice> : null}

      <Button size="lg" icon={Send} label={t("request.send")} loading={sending} disabled={!consent || !live} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  small: { gap: 8 },
});
