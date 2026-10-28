/*
 * Texte der E-Mails rund um eine Anfrage. Bewusst nur serverseitige Vorlagen:
 * Die App kann keinen eigenen Text in E-Mails an Dritte einschleusen.
 * TODO: Nutzer-E-Mail in der Sprache der App (derzeit Deutsch mit kurzem englischem Hinweis).
 */

const TIMES = { any: "egal", morning: "vormittags", afternoon: "nachmittags", evening: "abends" };

export function money(value, currency) {
  if (value == null) return "";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: currency || "EUR" }).format(value);
}

export function discountText(discount, currency) {
  if (!discount) return "";
  const value = discount.type === "percent" ? `${String(discount.value).replace(".", ",")} %` : money(discount.value, currency);
  return `${value} Rabatt${discount.conditions ? ` – ${discount.conditions}` : ""}`;
}

function germanDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

const line = (label, value) => (value ? `${label}: ${value}\n` : "");

export function partnerRequestMail({ partner, service, referral, form, discount }) {
  const preferred = [germanDate(form.preferredDate), form.preferredTime && form.preferredTime !== "any" ? TIMES[form.preferredTime] : ""]
    .filter(Boolean)
    .join(", ");
  return {
    kind: "request.partner",
    to: partner.contact.email,
    replyTo: form.email,
    subject: `Neue Anfrage über SanusAnkh – ${referral.code}`,
    text:
      `Guten Tag,\n\nüber die App SanusAnkh ist eine Anfrage für ${partner.name} eingegangen.\n\n` +
      line("Rabattcode", referral.code) +
      line("Leistung", service.title) +
      line("Rabatt laut Kooperationsvertrag", discountText(discount, partner.currency)) +
      "\n" +
      line("Name", form.name) +
      line("Telefon", form.phone) +
      line("E-Mail", form.email) +
      line("Wunschtermin für Rückruf/Gespräch", preferred) +
      (form.message ? `\nNachricht:\n${form.message}\n` : "") +
      (form.wishes ? `\nVom Nutzer angehängte Bestattungswünsche:\n${form.wishes}\n` : "") +
      `\nDie Person hat am ${germanDate(referral.createdAt)} ausdrücklich in die Übermittlung dieser Angaben an ${partner.name} eingewilligt. ` +
      "Bitte verwenden Sie die Daten nur zur Bearbeitung dieser Anfrage.\n\n" +
      "Bitte melden Sie eingelöste Codes und Auftragswerte wie im Kooperationsvertrag vereinbart.\n\n" +
      "Antworten auf diese E-Mail gehen direkt an die anfragende Person.\n\nSanusAnkh",
  };
}

export function userConfirmationMail({ partner, service, referral, form, discount }) {
  return {
    kind: "request.user",
    to: form.email,
    subject: `Deine Anfrage bei ${partner.name} – Code ${referral.code}`,
    text:
      `Hallo ${form.name},\n\ndeine Anfrage wurde an ${partner.name} weitergeleitet. Der Bestatter meldet sich bei dir.\n\n` +
      line("Dein Code", referral.code) +
      line("Leistung", service.title) +
      line("Rabatt", discountText(discount, partner.currency)) +
      line("Bestatter", [partner.name, partner.address, partner.phone].filter(Boolean).join(", ")) +
      "\nBitte gib den Code beim Bestatter an, damit der Rabatt berücksichtigt wird. " +
      "Vertrag und Bezahlung vereinbarst du direkt mit dem Bestatter; über SanusAnkh wird nichts bezahlt.\n\n" +
      "SanusAnkh erhält bei einer Beauftragung eine Vermittlungsprovision vom Bestatter. Für dich entstehen dadurch keine Mehrkosten.\n\n" +
      "Du kannst die Anfrage in der App unter „Vorsorge → Meine Anfragen“ zurückziehen.\n\n" +
      `Your request has been forwarded to ${partner.name}. Please quote code ${referral.code} to receive the discount.\n\n` +
      "SanusAnkh",
  };
}

export function partnerWithdrawMail({ partner, referral }) {
  return {
    kind: "withdraw.partner",
    to: partner.contact.email,
    subject: `Anfrage zurückgezogen – ${referral.code}`,
    text:
      `Guten Tag,\n\ndie Anfrage mit dem Code ${referral.code} (${referral.serviceTitle}) vom ${germanDate(referral.createdAt)} ` +
      "wurde von der anfragenden Person über die App SanusAnkh zurückgezogen.\n\n" +
      "Bitte nehmen Sie keinen weiteren Kontakt auf und löschen Sie die übermittelten Angaben, sofern keine Aufbewahrungspflicht besteht.\n\nSanusAnkh",
  };
}
