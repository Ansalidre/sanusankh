/*
 * Telefonnummern für Deutschland. Vor Veröffentlichung bitte erneut gegen die offiziellen
 * Quellen prüfen (Giftinformationszentren: www.bvl.bund.de).
 */

export const EMERGENCY_NUMBER = {
  id: "112",
  number: "112",
  icon: "Siren",
  emergency: true,
  label: { de: "Notruf: Rettungsdienst & Feuerwehr", en: "Emergency: ambulance & fire brigade", tr: "Acil: ambulans ve itfaiye", ar: "الطوارئ: الإسعاف والإطفاء", ru: "Экстренный вызов: скорая и пожарные", uk: "Екстрений виклик: швидка і пожежники", pl: "Numer alarmowy: pogotowie i straż pożarna" },
  description: { de: "Bei Lebensgefahr – kostenlos, rund um die Uhr, auch ohne Guthaben.", en: "When life is in danger – free, around the clock, even without credit.", tr: "Hayati tehlikede – ücretsiz, 7/24, kontörsüz de.", ar: "عند الخطر على الحياة – مجاني وعلى مدار الساعة وحتى بدون رصيد.", ru: "При угрозе жизни – бесплатно, круглосуточно, даже без денег на счёте.", uk: "У разі загрози життю – безкоштовно, цілодобово, навіть без коштів на рахунку.", pl: "W zagrożeniu życia – bezpłatnie, całą dobę, także bez środków na koncie." },
};

export const NATIONAL_NUMBERS = [
  {
    id: "116117",
    number: "116117",
    icon: "Stethoscope",
    label: { de: "Ärztlicher Bereitschaftsdienst", en: "Out-of-hours doctor service", tr: "Nöbetçi doktor hizmeti", ar: "خدمة الطبيب المناوب", ru: "Дежурная врачебная служба", uk: "Чергова лікарська служба", pl: "Dyżurna pomoc lekarska" },
    description: { de: "Wenn es kein Notfall ist, aber nicht bis zum nächsten Praxistag warten kann.", en: "When it is not an emergency but cannot wait until the practice opens.", tr: "Acil değil ama muayenehanenin açılmasını bekleyemiyorsa.", ar: "عندما لا تكون حالة طارئة لكنها لا تحتمل الانتظار حتى يوم العيادة التالي.", ru: "Если это не экстренный случай, но нельзя ждать до приёма у врача.", uk: "Якщо це не екстрений випадок, але не можна чекати до прийому в лікаря.", pl: "Gdy to nie nagły wypadek, ale nie może czekać do otwarcia przychodni." },
  },
  {
    id: "110",
    number: "110",
    icon: "ShieldAlert",
    label: { de: "Polizei", en: "Police", tr: "Polis", ar: "الشرطة", ru: "Полиция", uk: "Поліція", pl: "Policja" },
    description: { de: "Bei Unfällen, Gewalt oder Gefahr durch andere.", en: "For accidents, violence or danger from others.", tr: "Kaza, şiddet veya başkalarından gelen tehlikede.", ar: "عند الحوادث أو العنف أو الخطر من الآخرين.", ru: "При авариях, насилии или угрозе со стороны других.", uk: "У разі аварій, насильства чи загрози від інших.", pl: "Przy wypadkach, przemocy lub zagrożeniu ze strony innych." },
  },
  {
    id: "gift",
    number: null, // kommt aus dem gewählten Bundesland
    icon: "FlaskConical",
    label: { de: "Giftnotruf-Zentrale", en: "Poison control centre", tr: "Zehir danışma merkezi", ar: "مركز السموم", ru: "Токсикологический центр", uk: "Токсикологічний центр", pl: "Ośrodek toksykologiczny" },
    description: { de: "Regional organisiert – wähle unten dein Bundesland.", en: "Organised regionally – choose your federal state below.", tr: "Bölgesel olarak düzenlenir – aşağıdan eyaletinizi seçin.", ar: "منظّم إقليميًا – اختر ولايتك أدناه.", ru: "Организован по регионам – выберите землю ниже.", uk: "Організовано за регіонами – виберіть землю нижче.", pl: "Działa regionalnie – wybierz poniżej swój kraj związkowy." },
  },
];

export const CRISIS_NUMBERS = [
  {
    id: "116123",
    number: "116123",
    icon: "HeartHandshake",
    label: { de: "Telefonseelsorge", en: "Crisis helpline (Telefonseelsorge)", tr: "Telefonseelsorge (kriz hattı)", ar: "خط الدعم النفسي (Telefonseelsorge)", ru: "Телефон доверия (Telefonseelsorge)", uk: "Телефон довіри (Telefonseelsorge)", pl: "Telefon zaufania (Telefonseelsorge)" },
    description: { de: "Anonym und kostenlos, rund um die Uhr.", en: "Anonymous and free, around the clock.", tr: "Anonim ve ücretsiz, 7/24.", ar: "مجهول الهوية ومجاني، على مدار الساعة.", ru: "Анонимно и бесплатно, круглосуточно.", uk: "Анонімно і безкоштовно, цілодобово.", pl: "Anonimowo i bezpłatnie, całą dobę." },
  },
  {
    id: "0800-1110111",
    number: "0800 111 0 111",
    icon: "Phone",
    label: { de: "Telefonseelsorge (Festnetz)", en: "Crisis helpline (landline)", tr: "Kriz hattı (sabit hat)", ar: "خط الدعم النفسي (الهاتف الأرضي)", ru: "Телефон доверия (стационарный)", uk: "Телефон довіри (стаціонарний)", pl: "Telefon zaufania (stacjonarny)" },
    description: { de: "Alternative Nummer, ebenfalls kostenlos.", en: "Alternative number, also free.", tr: "Alternatif numara, yine ücretsiz.", ar: "رقم بديل، مجاني أيضًا.", ru: "Альтернативный номер, тоже бесплатно.", uk: "Альтернативний номер, також безкоштовно.", pl: "Numer alternatywny, również bezpłatny." },
  },
];

export const POISON_BY_STATE = [
  { state: "Baden-Württemberg", city: "Freiburg", phone: "0761 19240" },
  { state: "Bayern", city: "München", phone: "089 19240" },
  { state: "Berlin", city: "Berlin", phone: "030 19240" },
  { state: "Brandenburg", city: "Berlin", phone: "030 19240" },
  { state: "Bremen", city: "Göttingen", phone: "0551 19240" },
  { state: "Hamburg", city: "Göttingen", phone: "0551 19240" },
  { state: "Hessen", city: "Mainz", phone: "06131 19240" },
  { state: "Mecklenburg-Vorpommern", city: "Erfurt", phone: "0361 730730" },
  { state: "Niedersachsen", city: "Göttingen", phone: "0551 19240" },
  { state: "Nordrhein-Westfalen", city: "Bonn", phone: "0228 19240" },
  { state: "Rheinland-Pfalz", city: "Mainz", phone: "06131 19240" },
  { state: "Saarland", city: "Homburg", phone: "06841 19240" },
  { state: "Sachsen", city: "Erfurt", phone: "0361 730730" },
  { state: "Sachsen-Anhalt", city: "Erfurt", phone: "0361 730730" },
  { state: "Schleswig-Holstein", city: "Göttingen", phone: "0551 19240" },
  { state: "Thüringen", city: "Erfurt", phone: "0361 730730" },
];

/** Bundesweite Taxi-Kurzwahl (Mobilfunk). Eigene Nummer: Einstellungen → prefs.taxiPhone. */
export const TAXI_FALLBACK = { number: "22456" };

export const PHARMACY_DUTY = {
  url: "https://www.aponet.de/apotheke/notdienstsuche",
  phone: "0800 00 22 8 33",
};

/** Macht aus einer Anzeige-Nummer einen tel:-Link. */
export function telHref(number) {
  return `tel:${String(number).replace(/[^\d+]/g, "")}`;
}
