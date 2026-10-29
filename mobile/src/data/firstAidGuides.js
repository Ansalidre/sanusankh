/*
 * Erste-Hilfe-Themen. Die App formuliert keine eigenen Anleitungen: Jedes Thema verweist auf die
 * Seiten anerkannter Hilfsorganisationen (DRK, Johanniter, Malteser). Titel liegen in allen
 * App-Sprachen vor; die verlinkten Seiten sind auf Deutsch. Links geprüft am 29.10.2026.
 */

/** Hilfsorganisationen und ihre allgemeinen Erste-Hilfe-Seiten. */
export const ORGANIZATIONS = {
  drk: { name: "Deutsches Rotes Kreuz (DRK)", short: "DRK", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/" },
  johanniter: { name: "Johanniter", short: "Johanniter", url: "https://acht.johanniter.de/erste-hilfe/" },
  malteser: { name: "Malteser", short: "Malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-massnahmen-das-kannst-du-tun.html" },
};

export const GUIDE_CATEGORIES = [
  { id: "wiederbelebung", icon: "HeartPulse", label: { de: "Wiederbelebung", en: "Resuscitation", tr: "Canlandırma", ar: "الإنعاش", ru: "Реанимация", uk: "Реанімація", pl: "Resuscytacja", it: "Rianimazione", fr: "Réanimation" } },
  { id: "atmung", icon: "Wind", label: { de: "Atmung & Bewusstsein", en: "Breathing & consciousness", tr: "Solunum ve bilinç", ar: "التنفس والوعي", ru: "Дыхание и сознание", uk: "Дихання та свідомість", pl: "Oddech i przytomność", it: "Respirazione e coscienza", fr: "Respiration et conscience" } },
  { id: "blutung", icon: "Droplet", label: { de: "Blutung & Wunden", en: "Bleeding & wounds", tr: "Kanama ve yaralar", ar: "النزيف والجروح", ru: "Кровотечения и раны", uk: "Кровотечі та рани", pl: "Krwawienia i rany", it: "Emorragie e ferite", fr: "Saignements et plaies" } },
  { id: "vergiftung", icon: "FlaskConical", label: { de: "Vergiftung & Allergie", en: "Poisoning & allergy", tr: "Zehirlenme ve alerji", ar: "التسمم والحساسية", ru: "Отравление и аллергия", uk: "Отруєння та алергія", pl: "Zatrucie i alergia", it: "Avvelenamento e allergia", fr: "Intoxication et allergie" } },
  { id: "kopf", icon: "Brain", label: { de: "Kopf & Nerven", en: "Head & nerves", tr: "Baş ve sinirler", ar: "الرأس والأعصاب", ru: "Голова и нервы", uk: "Голова та нерви", pl: "Głowa i nerwy", it: "Testa e nervi", fr: "Tête et nerfs" } },
  { id: "verletzungen", icon: "Bone", label: { de: "Verletzungen", en: "Injuries", tr: "Yaralanmalar", ar: "الإصابات", ru: "Травмы", uk: "Травми", pl: "Urazy", it: "Lesioni", fr: "Blessures" } },
  { id: "temperatur", icon: "Thermometer", label: { de: "Hitze & Kälte", en: "Heat & cold", tr: "Sıcak ve soğuk", ar: "الحرارة والبرد", ru: "Жара и холод", uk: "Спека та холод", pl: "Upał i zimno", it: "Caldo e freddo", fr: "Chaleur et froid" } },
];

export const FIRST_AID_GUIDES = [
  {
    slug: "hlw-erwachsene",
    category: "wiederbelebung",
    icon: "HeartPulse",
    title: { de: "Wiederbelebung bei Erwachsenen", en: "CPR for adults", tr: "Yetişkinlerde canlandırma", ar: "إنعاش البالغين", ru: "Реанимация взрослых", uk: "Реанімація дорослих", pl: "Resuscytacja dorosłych", it: "Rianimazione negli adulti", fr: "Réanimation de l’adulte" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/herz-lungen-wiederbelebung/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/erste-hilfe-tipps-reanimation/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/herzdruckmassage.html" }],
  },
  {
    slug: "hlw-kind",
    category: "wiederbelebung",
    icon: "Baby",
    title: { de: "Wiederbelebung bei Kindern", en: "CPR for children", tr: "Çocuklarda canlandırma", ar: "إنعاش الأطفال", ru: "Реанимация детей", uk: "Реанімація дітей", pl: "Resuscytacja dzieci", it: "Rianimazione nei bambini", fr: "Réanimation de l’enfant" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/wiederbelebung-bei-kindern-und-saeuglingen/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-fuer-babys-und-kinder-die-wichtigsten-tipps.html" }],
  },
  {
    slug: "hlw-saeugling",
    category: "wiederbelebung",
    icon: "Baby",
    title: { de: "Wiederbelebung bei Säuglingen", en: "CPR for babies", tr: "Bebeklerde canlandırma", ar: "إنعاش الرضّع", ru: "Реанимация младенцев", uk: "Реанімація немовлят", pl: "Resuscytacja niemowląt", it: "Rianimazione nei lattanti", fr: "Réanimation du nourrisson" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/wiederbelebung-bei-kindern-und-saeuglingen/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/schritt-fuer-schritt-reanimation-bei-saeuglingen/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-fuer-babys-und-kinder-die-wichtigsten-tipps.html" }],
  },
  {
    slug: "stabile-seitenlage",
    category: "atmung",
    icon: "BedSingle",
    title: { de: "Stabile Seitenlage", en: "Recovery position", tr: "Koma pozisyonu", ar: "وضعية الإفاقة الجانبية", ru: "Стабильное боковое положение", uk: "Стабільне бокове положення", pl: "Pozycja boczna ustalona", it: "Posizione laterale di sicurezza", fr: "Position latérale de sécurité" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/stabile-seitenlage/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/erste-hilfe-tipps-stabile-seitenlage/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/stabile-seitenlage-darauf-musst-du-achten.html" }],
  },
  {
    slug: "verschlucken",
    category: "atmung",
    icon: "Wind",
    title: { de: "Verschlucken & Ersticken", en: "Choking", tr: "Boğulma (yabancı cisim)", ar: "الاختناق", ru: "Попадание инородного тела, удушье", uk: "Вдавлення та задуха", pl: "Zadławienie", it: "Soffocamento da corpo estraneo", fr: "Étouffement" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/ersticken/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/erste-hilfe-tipps-heimlich-manoever/" }],
  },
  {
    slug: "herzinfarkt",
    category: "atmung",
    icon: "Heart",
    title: { de: "Herzinfarkt-Verdacht", en: "Suspected heart attack", tr: "Kalp krizi şüphesi", ar: "الاشتباه بنوبة قلبية", ru: "Подозрение на инфаркт", uk: "Підозра на інфаркт", pl: "Podejrzenie zawału serca", it: "Sospetto infarto", fr: "Suspicion d’infarctus" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/herzinfarkt/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/erste-hilfe-tipps-herzinfarkt/" }],
  },
  {
    slug: "starke-blutung",
    category: "blutung",
    icon: "Droplet",
    title: { de: "Starke Blutung", en: "Heavy bleeding", tr: "Şiddetli kanama", ar: "النزيف الشديد", ru: "Сильное кровотечение", uk: "Сильна кровотеча", pl: "Silne krwawienie", it: "Emorragia grave", fr: "Saignement abondant" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/blutungen-und-blutstillung/blutungen/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/erste-hilfe-tipps-wundversorgung-blutung-stoppen/" }],
  },
  {
    slug: "verbrennung",
    category: "blutung",
    icon: "Flame",
    title: { de: "Verbrennung & Verbrühung", en: "Burns & scalds", tr: "Yanık ve haşlanma", ar: "الحروق والسَّمط", ru: "Ожоги и ошпаривание", uk: "Опіки та ошпарення", pl: "Oparzenia", it: "Ustioni e scottature", fr: "Brûlures" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/verbrennungen/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/brandwunden-verbrennungen-erste-hilfe-massnahmen/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-bei-verbrennung-das-musst-du-beachten.html" }],
  },
  {
    slug: "nasenbluten",
    category: "blutung",
    icon: "Droplets",
    title: { de: "Nasenbluten", en: "Nosebleed", tr: "Burun kanaması", ar: "نزيف الأنف", ru: "Носовое кровотечение", uk: "Носова кровотеча", pl: "Krwawienie z nosa", it: "Sangue dal naso", fr: "Saignement de nez" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/blutungen-und-blutstillung/blutungen/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-fuer-babys-und-kinder-die-wichtigsten-tipps.html" }],
  },
  {
    slug: "allergischer-schock",
    category: "vergiftung",
    icon: "ShieldAlert",
    title: { de: "Allergischer Schock", en: "Severe allergic reaction (anaphylaxis)", tr: "Alerjik şok", ar: "الصدمة التحسسية", ru: "Анафилактический шок", uk: "Анафілактичний шок", pl: "Wstrząs anafilaktyczny", it: "Shock allergico (anafilassi)", fr: "Choc allergique (anaphylaxie)" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/schock/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-nach-wespen-oder-bienenstich-das-kannst-du-tun.html" }],
  },
  {
    slug: "vergiftung",
    category: "vergiftung",
    icon: "FlaskConical",
    title: { de: "Vergiftung", en: "Poisoning", tr: "Zehirlenme", ar: "التسمم", ru: "Отравление", uk: "Отруєння", pl: "Zatrucie", it: "Avvelenamento", fr: "Intoxication" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/vergiftungen-und-hilfe-bei-erbrechen/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-bei-vergiftungen-das-kannst-du-tun.html" }],
  },
  {
    slug: "insektenstich",
    category: "vergiftung",
    icon: "Bug",
    title: { de: "Insektenstich & Zecke", en: "Insect sting & tick", tr: "Böcek sokması ve kene", ar: "لدغة الحشرات والقُراد", ru: "Укус насекомого и клеща", uk: "Укус комахи та кліща", pl: "Użądlenie i kleszcz", it: "Puntura d’insetto e zecca", fr: "Piqûre d’insecte et tique" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/insektenstiche/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-nach-wespen-oder-bienenstich-das-kannst-du-tun.html" }],
  },
  {
    slug: "schlaganfall-fast",
    category: "kopf",
    icon: "Brain",
    title: { de: "Schlaganfall erkennen (FAST)", en: "Recognising a stroke (FAST)", tr: "İnmeyi tanıma (FAST)", ar: "التعرّف على السكتة الدماغية (FAST)", ru: "Как распознать инсульт (FAST)", uk: "Як розпізнати інсульт (FAST)", pl: "Rozpoznawanie udaru (FAST)", it: "Riconoscere l’ictus (FAST)", fr: "Reconnaître un AVC (FAST)" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/schlaganfall/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/erste-hilfe-tipps-schlaganfall/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/erste-hilfe-bei-verdacht-auf-schlaganfall-wenn-jede-sekunde-zaehlt.html" }],
  },
  {
    slug: "krampfanfall",
    category: "kopf",
    icon: "Zap",
    title: { de: "Krampfanfall", en: "Seizure", tr: "Nöbet (havale)", ar: "نوبة التشنّج", ru: "Судорожный приступ", uk: "Судомний напад", pl: "Napad drgawek", it: "Crisi convulsiva", fr: "Crise convulsive" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/hirnbedingte-krampfanfaelle/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/erste-hilfe-tipps-krampfanfaelle/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/wenn-es-im-gehirn-gewittert-erste-hilfe-bei-epileptischen-anfaellen.html" }],
  },
  {
    slug: "unterzuckerung",
    category: "kopf",
    icon: "Candy",
    title: { de: "Unterzuckerung", en: "Low blood sugar", tr: "Kan şekeri düşüklüğü", ar: "انخفاض سكر الدم", ru: "Гипогликемия (низкий сахар)", uk: "Гіпоглікемія (низький цукор)", pl: "Niedocukrzenie", it: "Ipoglicemia", fr: "Hypoglycémie" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/unterzuckerung/" }],
  },
  {
    slug: "knochenbruch",
    category: "verletzungen",
    icon: "Bone",
    title: { de: "Knochenbruch", en: "Broken bone", tr: "Kemik kırığı", ar: "كسر العظام", ru: "Перелом", uk: "Перелом кістки", pl: "Złamanie kości", it: "Frattura", fr: "Fracture" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/knochenbruch/knochenbrueche/" }],
  },
  {
    slug: "hitzschlag",
    category: "temperatur",
    icon: "Sun",
    title: { de: "Hitzschlag & Sonnenstich", en: "Heatstroke & sunstroke", tr: "Sıcak çarpması ve güneş çarpması", ar: "ضربة الحر وضربة الشمس", ru: "Тепловой и солнечный удар", uk: "Тепловий і сонячний удар", pl: "Udar cieplny i słoneczny", it: "Colpo di calore e colpo di sole", fr: "Coup de chaleur et insolation" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/hitzschlag/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/hitzschlag-ursache-symptome-behandlung/" }, { org: "malteser", url: "https://www.malteser.de/aware/hilfreich/richtig-reagieren-erste-hilfe-bei-sommerhitze.html" }],
  },
  {
    slug: "unterkuehlung",
    category: "temperatur",
    icon: "Snowflake",
    title: { de: "Unterkühlung", en: "Hypothermia", tr: "Hipotermi (aşırı üşüme)", ar: "انخفاض حرارة الجسم", ru: "Переохлаждение", uk: "Переохолодження", pl: "Wychłodzenie", it: "Ipotermia", fr: "Hypothermie" },
    links: [{ org: "drk", url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/erfrierungen-und-unterkuehlungen/" }, { org: "johanniter", url: "https://acht.johanniter.de/erste-hilfe/erste-hilfe-bei-unterkuehlung-so-handelst-du-richtig/" }],
  },
];

export function getGuide(slug) {
  return FIRST_AID_GUIDES.find((g) => g.slug === slug) ?? null;
}

export function getCategory(id) {
  return GUIDE_CATEGORIES.find((c) => c.id === id) ?? null;
}
