/*
 * Geführte Symptom-Checks als Zustandsautomat.
 * Knoten haben entweder { question, options:[{label,next}] } oder { result:{…} }.
 * Ergebnis-Stufen: rot (112) · orange (heute ärztlich) · gelb (zeitnah ärztlich) · gruen (Selbstversorgung).
 * Deutsch ist die Quelle; nur die Titel liegen in allen Sprachen vor, der Rest wird per KI übersetzt.
 * Keine Diagnosen, keine Medikamente.
 */

const POISON_ACTION = { label: "Giftnotruf anrufen", to: "/numbers#giftnotruf" };

export const SYMPTOM_FLOWS = [
  {
    slug: "fieber",
    icon: "Thermometer",
    title: { de: "Fieber", en: "Fever", tr: "Ateş", ar: "الحمّى", ru: "Температура", uk: "Температура", pl: "Gorączka" },
    summary: "Erhöhte Temperatur bei Kindern oder Erwachsenen.",
    entry: "start",
    nodes: {
      start: {
        question: "Wie alt ist die betroffene Person?",
        options: [
          { label: "Jünger als 3 Monate", next: "baby" },
          { label: "3 Monate oder älter", next: "warnzeichen" },
        ],
      },
      warnzeichen: {
        question: "Gibt es eines dieser Zeichen: Atemnot, Verwirrtheit, kaum weckbar, steifer Nacken oder kleine rote Flecken, die beim Drücken mit einem Glas nicht verschwinden?",
        options: [
          { label: "Ja", next: "rot" },
          { label: "Nein", next: "verlauf" },
        ],
      },
      verlauf: {
        question: "Was trifft am ehesten zu?",
        options: [
          { label: "Sehr hohes Fieber (über 40 °C) oder die Person trinkt kaum", next: "orange" },
          { label: "Fieber seit mehr als 3 Tagen", next: "gelb" },
          { label: "Fieber seit weniger als 3 Tagen, die Person trinkt und ist ansprechbar", next: "gruen" },
        ],
      },
      baby: {
        result: {
          level: "orange",
          title: "Fieber beim Säugling – noch heute ärztlich abklären",
          reason: "Bei Babys unter 3 Monaten kann Fieber ein Zeichen einer ernsten Infektion sein, auch wenn das Kind sonst wenig auffällig wirkt.",
          advice: [
            "Ruf die Kinderarztpraxis an oder außerhalb der Sprechzeiten den Bereitschaftsdienst 116117.",
            "Wirkt das Baby sehr schlapp, trinkt nicht oder atmet schwer: sofort 112.",
            "Zieh das Baby nicht zu warm an und biete regelmäßig zu trinken an.",
          ],
        },
      },
      rot: {
        result: {
          level: "rot",
          title: "Warnzeichen bei Fieber – sofort 112",
          reason: "Fieber zusammen mit Atemnot, Verwirrtheit, steifem Nacken oder nicht wegdrückbaren Flecken kann auf eine lebensbedrohliche Erkrankung hinweisen.",
          advice: [
            "Ruf jetzt 112 an.",
            "Bleib bei der Person und beobachte Atmung und Bewusstsein.",
            "Bei Bewusstlosigkeit mit normaler Atmung: stabile Seitenlage.",
          ],
          guide: "stabile-seitenlage",
        },
      },
      orange: {
        result: {
          level: "orange",
          title: "Noch heute ärztlich abklären",
          reason: "Sehr hohes Fieber oder zu wenig Flüssigkeit kann den Körper stark belasten.",
          advice: [
            "Ruf deine Hausarztpraxis oder außerhalb der Sprechzeiten 116117 an.",
            "Biete regelmäßig in kleinen Schlucken zu trinken an.",
            "Wird die Person verwirrt, sehr schläfrig oder bekommt schlecht Luft: 112.",
          ],
        },
      },
      gelb: {
        result: {
          level: "gelb",
          title: "Zeitnah ärztlich abklären",
          reason: "Fieber, das länger als 3 Tage anhält, sollte ärztlich untersucht werden.",
          advice: [
            "Vereinbare in den nächsten Tagen einen Termin in der Hausarztpraxis oder nutze Telemedizin.",
            "Trink ausreichend und ruh dich aus.",
            "Bei Verschlechterung früher Hilfe holen.",
          ],
        },
      },
      gruen: {
        result: {
          level: "gruen",
          title: "Selbstversorgung möglich",
          reason: "Kurzes Fieber ohne Warnzeichen ist oft eine normale Abwehrreaktion des Körpers.",
          advice: [
            "Viel trinken und ausruhen.",
            "Leichte Kleidung, nicht zu warm zudecken.",
            "Temperatur regelmäßig messen und notieren.",
            "Hält das Fieber länger als 3 Tage an oder kommen neue Beschwerden dazu: ärztlich abklären lassen.",
          ],
        },
      },
    },
  },
  {
    slug: "bauchschmerzen",
    icon: "CircleDot",
    title: { de: "Bauchschmerzen", en: "Abdominal pain", tr: "Karın ağrısı", ar: "ألم البطن", ru: "Боль в животе", uk: "Біль у животі", pl: "Ból brzucha" },
    summary: "Schmerzen oder Krämpfe im Bauch.",
    entry: "start",
    nodes: {
      start: {
        question: "Gibt es eines dieser Zeichen: Erbrechen von Blut, schwarzer Stuhl, bretthart gespannter Bauch, Ohnmacht oder Kreislaufprobleme?",
        options: [
          { label: "Ja", next: "rot" },
          { label: "Nein", next: "staerke" },
        ],
      },
      staerke: {
        question: "Was trifft am ehesten zu?",
        options: [
          { label: "Sehr starke oder immer stärker werdende Schmerzen", next: "orange" },
          { label: "Schmerzen mit Fieber oder in der Schwangerschaft", next: "orange" },
          { label: "Leichte bis mäßige Schmerzen", next: "dauer" },
        ],
      },
      dauer: {
        question: "Wie lange bestehen die Beschwerden schon?",
        options: [
          { label: "Länger als 2 Tage oder sie kommen immer wieder", next: "gelb" },
          { label: "Erst seit Kurzem", next: "gruen" },
        ],
      },
      rot: {
        result: {
          level: "rot",
          title: "Warnzeichen – sofort 112",
          reason: "Blut im Erbrochenen, schwarzer Stuhl, ein harter Bauch oder Kreislaufprobleme können auf eine innere Blutung oder einen akuten Notfall hinweisen.",
          advice: [
            "Ruf jetzt 112 an.",
            "Nichts essen und nichts trinken.",
            "Hinlegen lassen, zudecken, nicht allein lassen.",
          ],
        },
      },
      orange: {
        result: {
          level: "orange",
          title: "Noch heute ärztlich abklären",
          reason: "Starke, zunehmende Schmerzen oder Schmerzen mit Fieber oder in der Schwangerschaft sollten zeitnah untersucht werden.",
          advice: [
            "Ruf deine Hausarztpraxis oder außerhalb der Sprechzeiten 116117 an.",
            "Bei sehr starken Schmerzen direkt in die Notaufnahme – lass dich fahren, fahr nicht selbst.",
            "Bis zur Abklärung nichts Schweres essen.",
          ],
        },
      },
      gelb: {
        result: {
          level: "gelb",
          title: "Zeitnah ärztlich abklären",
          reason: "Anhaltende oder wiederkehrende Bauchschmerzen sollten ärztlich untersucht werden.",
          advice: [
            "Vereinbare in den nächsten Tagen einen Termin oder nutze Telemedizin.",
            "Notiere, wann die Schmerzen auftreten und was sie verändert.",
            "Bei Verschlechterung früher Hilfe holen.",
          ],
        },
      },
      gruen: {
        result: {
          level: "gruen",
          title: "Selbstversorgung möglich",
          reason: "Leichte, kurz bestehende Bauchschmerzen ohne Warnzeichen bessern sich oft von allein.",
          advice: [
            "Ruhe, Wärme auf dem Bauch kann guttun.",
            "Leichte Kost und ausreichend trinken.",
            "Werden die Schmerzen stärker oder kommt Fieber dazu: ärztlich abklären lassen.",
          ],
        },
      },
    },
  },
  {
    slug: "verletzung",
    icon: "Bandage",
    title: { de: "Verletzung & Sturz", en: "Injury & fall", tr: "Yaralanma ve düşme", ar: "إصابة وسقوط", ru: "Травма и падение", uk: "Травма та падіння", pl: "Uraz i upadek" },
    summary: "Wunden, Prellungen und mögliche Brüche.",
    entry: "start",
    nodes: {
      start: {
        question: "Ist die Person bewusstlos, verwirrt oder blutet sie stark?",
        options: [
          { label: "Ja", next: "rot" },
          { label: "Nein", next: "hergang" },
        ],
      },
      hergang: {
        question: "Gab es einen Sturz aus großer Höhe, einen Unfall mit hoher Geschwindigkeit oder Schmerzen in Nacken oder Rücken?",
        options: [
          { label: "Ja", next: "rotWirbel" },
          { label: "Nein", next: "art" },
        ],
      },
      art: {
        question: "Wie sieht die Verletzung aus?",
        options: [
          { label: "Fehlstellung, sichtbarer Knochen oder kann nicht belastet werden", next: "bruch" },
          { label: "Klaffende Wunde, die vielleicht genäht werden muss", next: "wunde" },
          { label: "Schwellung oder Prellung, aber belastbar", next: "gruen" },
          { label: "Kleine Schürfwunde", next: "gruen" },
        ],
      },
      rot: {
        result: {
          level: "rot",
          title: "Notfall – sofort 112",
          reason: "Bewusstlosigkeit, Verwirrtheit nach einer Verletzung oder starke Blutungen sind lebensbedrohlich.",
          advice: [
            "Ruf jetzt 112 an.",
            "Starke Blutung: fest direkt auf die Wunde drücken.",
            "Bewusstlos mit normaler Atmung: stabile Seitenlage.",
          ],
          guide: "starke-blutung",
        },
      },
      rotWirbel: {
        result: {
          level: "rot",
          title: "Möglicher schwerer Unfall – 112",
          reason: "Nach Stürzen aus großer Höhe, schnellen Unfällen oder bei Nacken- und Rückenschmerzen kann die Wirbelsäule verletzt sein.",
          advice: [
            "Ruf 112 an.",
            "Bewege die Person nicht, außer es droht unmittelbare Gefahr.",
            "Halte den Kopf ruhig und sprich beruhigend mit der Person.",
          ],
        },
      },
      bruch: {
        result: {
          level: "orange",
          title: "Möglicher Knochenbruch – heute abklären",
          reason: "Fehlstellungen oder fehlende Belastbarkeit sprechen für einen Bruch, der untersucht werden muss.",
          advice: [
            "Ruhigstellen, nicht einrenken.",
            "Lass dich in die Notaufnahme fahren. Bei Oberschenkel, Becken, offenem Bruch oder starken Schmerzen: 112.",
            "Vorsichtig kühlen, nie Eis direkt auf die Haut.",
          ],
          guide: "knochenbruch",
        },
      },
      wunde: {
        result: {
          level: "orange",
          title: "Wunde heute versorgen lassen",
          reason: "Klaffende Wunden sollten möglichst innerhalb weniger Stunden ärztlich versorgt werden.",
          advice: [
            "Wunde mit einer sauberen Kompresse bedecken und leicht drücken.",
            "Hausarztpraxis, Bereitschaftspraxis (116117) oder Notaufnahme aufsuchen.",
            "Prüfe, ob der Tetanus-Impfschutz aktuell ist.",
          ],
          guide: "starke-blutung",
        },
      },
      gruen: {
        result: {
          level: "gruen",
          title: "Selbstversorgung möglich",
          reason: "Kleine Wunden und Prellungen ohne Warnzeichen kannst du meist selbst versorgen.",
          advice: [
            "Schürfwunden mit sauberem Wasser ausspülen und abdecken.",
            "Prellungen kühlen, hochlagern und schonen.",
            "Prüfe, ob der Tetanus-Impfschutz aktuell ist.",
            "Werden Schwellung oder Schmerzen stärker: ärztlich abklären lassen.",
          ],
        },
      },
    },
  },
  {
    slug: "verbrennung",
    icon: "Flame",
    title: { de: "Verbrennung", en: "Burn", tr: "Yanık", ar: "حرق", ru: "Ожог", uk: "Опік", pl: "Oparzenie" },
    summary: "Verbrennungen und Verbrühungen der Haut.",
    entry: "start",
    nodes: {
      start: {
        question: "Was trifft zu?",
        options: [
          { label: "Größer als 5 Handflächen der Person, oder im Gesicht oder an den Atemwegen", next: "rot" },
          { label: "Durch Strom oder Chemikalien", next: "rotStrom" },
          { label: "Kleiner, keine dieser Besonderheiten", next: "haut" },
        ],
      },
      haut: {
        question: "Wie sieht die Haut aus?",
        options: [
          { label: "Weiß, lederartig oder schmerzlos", next: "orange" },
          { label: "Blasen größer als eine Handfläche, oder an Händen, Füßen, Gelenken, Genitalien oder bei einem Kleinkind", next: "orange" },
          { label: "Blasen kleiner als eine Handfläche", next: "gelb" },
          { label: "Nur gerötet, keine Blasen", next: "gruen" },
        ],
      },
      rot: {
        result: {
          level: "rot",
          title: "Schwere Verbrennung – sofort 112",
          reason: "Große Verbrennungen oder Verbrennungen im Gesicht und an den Atemwegen sind lebensbedrohlich.",
          advice: [
            "Ruf jetzt 112 an.",
            "Große Flächen nicht kühlen, sondern zudecken – es droht Unterkühlung.",
            "Keine Hausmittel auf die Wunde.",
          ],
          guide: "verbrennung",
        },
      },
      rotStrom: {
        result: {
          level: "rot",
          title: "Strom- oder Chemieunfall – 112",
          reason: "Strom kann das Herz stören, Chemikalien können tief in die Haut eindringen – auch wenn man außen wenig sieht.",
          advice: [
            "Schütz dich selbst: Strom abschalten, Chemikalien nicht berühren.",
            "Ruf 112 an.",
            "Chemikalien mit viel fließendem Wasser abspülen, wenn das gefahrlos geht.",
          ],
          guide: "verbrennung",
        },
      },
      orange: {
        result: {
          level: "orange",
          title: "Heute ärztlich versorgen lassen",
          reason: "Tiefe oder größere Verbrennungen und Verbrennungen an empfindlichen Stellen müssen ärztlich behandelt werden.",
          advice: [
            "Kleine Flächen 10 bis 20 Minuten handwarm kühlen.",
            "Keimfrei und locker abdecken, Blasen nicht öffnen.",
            "Notaufnahme oder Bereitschaftsdienst 116117.",
          ],
          guide: "verbrennung",
        },
      },
      gelb: {
        result: {
          level: "gelb",
          title: "Zeitnah ärztlich anschauen lassen",
          reason: "Kleine Brandblasen heilen meist gut, sollten aber auf Entzündungszeichen beobachtet werden.",
          advice: [
            "10 bis 20 Minuten handwarm kühlen.",
            "Blasen nicht öffnen, locker und sauber abdecken.",
            "Hausarztpraxis oder Telemedizin in den nächsten Tagen, früher bei Rötung, Eiter oder Fieber.",
          ],
          guide: "verbrennung",
        },
      },
      gruen: {
        result: {
          level: "gruen",
          title: "Selbstversorgung möglich",
          reason: "Eine leichte Rötung ohne Blasen heilt meist von allein.",
          advice: [
            "10 bis 20 Minuten mit handwarmem Wasser kühlen.",
            "Keine Hausmittel wie Mehl, Öl oder Zahnpasta.",
            "Bei Blasenbildung oder starken Schmerzen ärztlich abklären lassen.",
          ],
          guide: "verbrennung",
        },
      },
    },
  },
  {
    slug: "allergie",
    icon: "ShieldAlert",
    title: { de: "Allergische Reaktion", en: "Allergic reaction", tr: "Alerjik reaksiyon", ar: "رد فعل تحسسي", ru: "Аллергическая реакция", uk: "Алергічна реакція", pl: "Reakcja alergiczna" },
    summary: "Ausschlag, Schwellung oder Juckreiz nach Kontakt, Essen oder Stich.",
    entry: "start",
    nodes: {
      start: {
        question: "Gibt es Atemnot, eine Schwellung von Zunge oder Rachen, Schwindel oder Ohnmacht?",
        options: [
          { label: "Ja", next: "rot" },
          { label: "Nein", next: "art" },
        ],
      },
      art: {
        question: "Wie zeigt sich die Reaktion?",
        options: [
          { label: "Stich im Mund oder Rachen", next: "rot" },
          { label: "Ausschlag am ganzen Körper oder Schwellung im Gesicht", next: "orange" },
          { label: "Rötung oder Schwellung an einer Stelle, z. B. nach einem Stich", next: "lokal" },
        ],
      },
      lokal: {
        question: "Ist die Schwellung größer als 10 cm oder wird sie immer größer?",
        options: [
          { label: "Ja", next: "gelb" },
          { label: "Nein", next: "gruen" },
        ],
      },
      rot: {
        result: {
          level: "rot",
          title: "Möglicher allergischer Schock – sofort 112",
          reason: "Atemnot, Schwellungen im Mund- und Rachenraum oder Kreislaufprobleme können schnell lebensbedrohlich werden.",
          advice: [
            "Ruf jetzt 112 an.",
            "Hat die Person ein eigenes Notfallset, hilf ihr, es nach Anleitung zu benutzen.",
            "Bei Atemnot sitzen lassen, bei Schwindel hinlegen und Beine hoch.",
          ],
          guide: "allergischer-schock",
        },
      },
      orange: {
        result: {
          level: "orange",
          title: "Noch heute ärztlich abklären",
          reason: "Eine Reaktion am ganzen Körper oder im Gesicht kann sich verstärken.",
          advice: [
            "Ruf deine Hausarztpraxis oder 116117 an.",
            "Beobachte Atmung und Schwellung genau – bei Atemnot sofort 112.",
            "Vermeide weiteren Kontakt mit dem möglichen Auslöser.",
          ],
          guide: "allergischer-schock",
        },
      },
      gelb: {
        result: {
          level: "gelb",
          title: "Zeitnah ärztlich anschauen lassen",
          reason: "Große oder wachsende Schwellungen sollten ärztlich beurteilt werden.",
          advice: [
            "Kühlen und den Körperteil hochlagern.",
            "Hausarztpraxis oder Telemedizin in den nächsten Tagen.",
            "Bei Atemnot oder Schwindel sofort 112.",
          ],
          guide: "insektenstich",
        },
      },
      gruen: {
        result: {
          level: "gruen",
          title: "Selbstversorgung möglich",
          reason: "Eine kleine örtliche Reaktion ohne Warnzeichen klingt meist von allein ab.",
          advice: [
            "Stachel entfernen, wenn vorhanden.",
            "Mit einem kalten, feuchten Tuch kühlen.",
            "Nicht kratzen.",
            "Bei Atemnot, Schwellung im Gesicht oder Ausschlag am ganzen Körper: 112.",
          ],
          guide: "insektenstich",
        },
      },
    },
  },
  {
    slug: "vergiftung",
    icon: "FlaskConical",
    title: { de: "Vergiftung", en: "Poisoning", tr: "Zehirlenme", ar: "التسمم", ru: "Отравление", uk: "Отруєння", pl: "Zatrucie" },
    summary: "Verschluckte Medikamente, Reinigungsmittel, Pflanzen oder Unbekanntes.",
    entry: "start",
    nodes: {
      start: {
        question: "Ist die Person bewusstlos, sehr schläfrig, hat sie Krämpfe oder Atemnot?",
        options: [
          { label: "Ja", next: "rot" },
          { label: "Nein", next: "beschwerden" },
        ],
      },
      beschwerden: {
        question: "Hat die Person Beschwerden wie Erbrechen, Bauchschmerzen oder Schmerzen im Mund?",
        options: [
          { label: "Ja", next: "orangeBeschwerden" },
          { label: "Nein, noch keine", next: "orangeOhne" },
        ],
      },
      rot: {
        result: {
          level: "rot",
          title: "Schwere Vergiftung möglich – sofort 112",
          reason: "Bewusstseinsstörungen, Krämpfe oder Atemnot nach einer Vergiftung sind lebensbedrohlich.",
          advice: [
            "Ruf jetzt 112 an.",
            "Nichts einflößen, kein Erbrechen auslösen.",
            "Verpackung oder Reste für den Rettungsdienst aufbewahren.",
            "Bewusstlos mit normaler Atmung: stabile Seitenlage.",
          ],
          guide: "vergiftung",
        },
      },
      orangeBeschwerden: {
        result: {
          level: "orange",
          title: "Sofort den Giftnotruf anrufen",
          reason: "Beschwerden nach einer möglichen Vergiftung müssen fachlich beurteilt werden.",
          advice: [
            "Ruf den Giftnotruf deines Bundeslandes an und folge den Anweisungen.",
            "Nichts zu trinken geben, kein Erbrechen auslösen.",
            "Verpackung oder Reste bereithalten.",
            "Verschlechtert sich der Zustand: 112.",
          ],
          action: POISON_ACTION,
          guide: "vergiftung",
        },
      },
      orangeOhne: {
        result: {
          level: "orange",
          title: "Giftnotruf anrufen – auch ohne Beschwerden",
          reason: "Manche Gifte wirken erst nach Stunden. Der Giftnotruf sagt dir, ob Behandlung nötig ist.",
          advice: [
            "Ruf den Giftnotruf an. Halte bereit: Was, wie viel, wann, Alter und Gewicht.",
            "Nichts zu trinken geben, kein Erbrechen auslösen.",
            "Lass die Person in den nächsten Stunden nicht allein.",
          ],
          action: POISON_ACTION,
          guide: "vergiftung",
        },
      },
    },
  },
  {
    slug: "atembeschwerden",
    icon: "Wind",
    title: { de: "Atembeschwerden", en: "Breathing problems", tr: "Nefes darlığı", ar: "صعوبة التنفس", ru: "Затруднённое дыхание", uk: "Утруднене дихання", pl: "Problemy z oddychaniem" },
    summary: "Atemnot, Kurzatmigkeit oder pfeifende Atmung.",
    entry: "start",
    nodes: {
      start: {
        question: "Kann die Person kaum sprechen, sind die Lippen bläulich oder ist sie sehr erschöpft?",
        options: [
          { label: "Ja", next: "rot" },
          { label: "Nein", next: "zusatz" },
        ],
      },
      zusatz: {
        question: "Gibt es zusätzlich Brustschmerzen, eine allergische Reaktion oder wurde etwas verschluckt?",
        options: [
          { label: "Ja", next: "rotZusatz" },
          { label: "Nein", next: "art" },
        ],
      },
      art: {
        question: "Was trifft am ehesten zu?",
        options: [
          { label: "Neu aufgetreten oder deutlich schlimmer als sonst", next: "orange" },
          { label: "Bekannte Erkrankung (z. B. Asthma) mit eigenem ärztlichem Notfallplan", next: "gelb" },
          { label: "Leichte Beschwerden bei Erkältung, z. B. verstopfte Nase", next: "gruen" },
        ],
      },
      rot: {
        result: {
          level: "rot",
          title: "Schwere Atemnot – sofort 112",
          reason: "Wer kaum sprechen kann oder blaue Lippen hat, bekommt zu wenig Sauerstoff.",
          advice: [
            "Ruf jetzt 112 an.",
            "Aufrecht sitzen lassen, enge Kleidung öffnen, frische Luft.",
            "Hat die Person ein eigenes Notfallspray, hilf ihr, es nach ihrem Plan zu benutzen.",
          ],
        },
      },
      rotZusatz: {
        result: {
          level: "rot",
          title: "Atemnot mit Warnzeichen – sofort 112",
          reason: "Atemnot mit Brustschmerz, allergischer Reaktion oder nach Verschlucken kann lebensbedrohlich sein.",
          advice: [
            "Ruf jetzt 112 an.",
            "Verschluckt: kräftig husten lassen, dann Schläge zwischen die Schulterblätter.",
            "Nicht allein lassen.",
          ],
          guide: "verschlucken",
        },
      },
      orange: {
        result: {
          level: "orange",
          title: "Noch heute ärztlich abklären",
          reason: "Neue oder deutlich stärkere Atembeschwerden müssen zeitnah untersucht werden.",
          advice: [
            "Ruf deine Hausarztpraxis oder 116117 an.",
            "Aufrecht sitzen, ruhig atmen, nicht anstrengen.",
            "Wird es schlimmer oder kann die Person kaum sprechen: 112.",
          ],
        },
      },
      gelb: {
        result: {
          level: "gelb",
          title: "Nach Plan handeln und zeitnah abklären",
          reason: "Bei bekannten Erkrankungen gibt es meist einen ärztlichen Notfallplan.",
          advice: [
            "Folge deinem ärztlichen Notfallplan.",
            "Bessert es sich nicht deutlich: 116117 oder Hausarztpraxis.",
            "Bei schwerer Atemnot sofort 112.",
          ],
        },
      },
      gruen: {
        result: {
          level: "gruen",
          title: "Selbstversorgung möglich",
          reason: "Leichte Beschwerden bei einer Erkältung sind häufig harmlos.",
          advice: [
            "Viel trinken, ausruhen, Räume lüften.",
            "Kopf beim Schlafen etwas höher lagern.",
            "Kommen Fieber, Brustschmerz oder Atemnot dazu: ärztlich abklären lassen.",
          ],
        },
      },
    },
  },
  {
    slug: "kopfschmerzen",
    icon: "Brain",
    title: { de: "Kopfschmerzen", en: "Headache", tr: "Baş ağrısı", ar: "الصداع", ru: "Головная боль", uk: "Головний біль", pl: "Ból głowy" },
    summary: "Neue, starke oder ungewöhnliche Kopfschmerzen.",
    entry: "start",
    nodes: {
      start: {
        question: "Ist der Kopfschmerz plötzlich und extrem stark aufgetreten, oder gibt es Lähmungen, Sprach- oder Sehstörungen?",
        options: [
          { label: "Ja", next: "rot" },
          { label: "Nein", next: "zusatz" },
        ],
      },
      zusatz: {
        question: "Trifft eines davon zu?",
        options: [
          { label: "Fieber und steifer Nacken", next: "rotFieber" },
          { label: "Nach einem Sturz oder Schlag auf den Kopf", next: "orange" },
          { label: "Nichts davon", next: "art" },
        ],
      },
      art: {
        question: "Wie ist der Kopfschmerz?",
        options: [
          { label: "Neu, ungewöhnlich oder er wird über Tage stärker", next: "gelb" },
          { label: "Bekannt, so wie sonst auch", next: "gruen" },
        ],
      },
      rot: {
        result: {
          level: "rot",
          title: "Warnzeichen – sofort 112",
          reason: "Plötzlicher extremer Kopfschmerz oder Lähmungen, Sprach- und Sehstörungen können auf einen Schlaganfall oder eine Hirnblutung hinweisen.",
          advice: [
            "Ruf jetzt 112 an.",
            "Merk dir die Uhrzeit, wann es begonnen hat.",
            "Nichts essen oder trinken lassen.",
          ],
          guide: "schlaganfall-fast",
        },
      },
      rotFieber: {
        result: {
          level: "rot",
          title: "Fieber mit steifem Nacken – sofort 112",
          reason: "Diese Kombination kann auf eine Hirnhautentzündung hinweisen, die sofort behandelt werden muss.",
          advice: [
            "Ruf jetzt 112 an.",
            "Bleib bei der Person und beobachte das Bewusstsein.",
          ],
        },
      },
      orange: {
        result: {
          level: "orange",
          title: "Nach Kopfverletzung heute abklären",
          reason: "Kopfschmerzen nach einem Sturz oder Schlag können auf eine Gehirnerschütterung oder Blutung hinweisen.",
          advice: [
            "Lass dich in einer Notaufnahme oder Bereitschaftspraxis untersuchen.",
            "Die nächsten 24 Stunden nicht allein bleiben.",
            "Bei Erbrechen, Verwirrtheit oder Schläfrigkeit: 112.",
          ],
        },
      },
      gelb: {
        result: {
          level: "gelb",
          title: "Zeitnah ärztlich abklären",
          reason: "Neue oder zunehmende Kopfschmerzen sollten ärztlich untersucht werden.",
          advice: [
            "Termin in der Hausarztpraxis oder Telemedizin.",
            "Führe ein kurzes Kopfschmerz-Tagebuch.",
            "Bei Lähmungen oder Sprachstörungen sofort 112.",
          ],
        },
      },
      gruen: {
        result: {
          level: "gruen",
          title: "Selbstversorgung möglich",
          reason: "Bekannte Kopfschmerzen ohne Warnzeichen kannst du oft selbst lindern.",
          advice: [
            "Ruhe in einem abgedunkelten Raum.",
            "Ausreichend trinken, frische Luft.",
            "Ändern sich die Kopfschmerzen deutlich: ärztlich abklären lassen.",
          ],
        },
      },
    },
  },
  {
    slug: "sturz-alter",
    icon: "PersonStanding",
    title: { de: "Sturz im Alter", en: "Fall in older people", tr: "Yaşlılarda düşme", ar: "سقوط كبار السن", ru: "Падение пожилого человека", uk: "Падіння літньої людини", pl: "Upadek osoby starszej" },
    summary: "Ältere Person ist gestürzt.",
    entry: "start",
    nodes: {
      start: {
        question: "Ist die Person bewusstlos oder verwirrt, oder hat sie sich den Kopf gestoßen und nimmt blutverdünnende Medikamente?",
        options: [
          { label: "Ja", next: "rot" },
          { label: "Nein", next: "aufstehen" },
        ],
      },
      aufstehen: {
        question: "Kann die Person ohne starke Schmerzen aufstehen und das Bein belasten?",
        options: [
          { label: "Nein, starke Schmerzen in Hüfte oder Bein", next: "rotHuefte" },
          { label: "Ja", next: "zustand" },
        ],
      },
      zustand: {
        question: "Was trifft am ehesten zu?",
        options: [
          { label: "Lag länger als eine Stunde am Boden", next: "orange" },
          { label: "Schwindel, Schmerzen oder unsicher beim Gehen", next: "orange" },
          { label: "Es geht gut, höchstens eine leichte Prellung", next: "gelb" },
        ],
      },
      rot: {
        result: {
          level: "rot",
          title: "Notfall – sofort 112",
          reason: "Bewusstseinsstörung oder ein Kopfanprall unter blutverdünnenden Medikamenten kann auf eine Hirnblutung hinweisen.",
          advice: [
            "Ruf jetzt 112 an.",
            "Person nicht aufsetzen oder bewegen, zudecken.",
            "Bewusstlos mit normaler Atmung: stabile Seitenlage.",
          ],
        },
      },
      rotHuefte: {
        result: {
          level: "rot",
          title: "Verdacht auf Bruch – 112",
          reason: "Starke Schmerzen in Hüfte oder Bein nach einem Sturz sprechen für einen Bruch. Der Transport sollte liegend durch den Rettungsdienst erfolgen.",
          advice: [
            "Ruf 112 an.",
            "Nicht aufrichten, das Bein nicht bewegen.",
            "Polstern, zudecken, beruhigen.",
          ],
          guide: "knochenbruch",
        },
      },
      orange: {
        result: {
          level: "orange",
          title: "Noch heute ärztlich abklären",
          reason: "Langes Liegen, Schwindel oder Gangunsicherheit nach einem Sturz sollten untersucht werden – auch um die Ursache zu finden.",
          advice: [
            "Hausarztpraxis oder 116117 anrufen.",
            "Ausreichend trinken lassen, wenn die Person wach ist und schlucken kann.",
            "Nicht allein lassen.",
          ],
        },
      },
      gelb: {
        result: {
          level: "gelb",
          title: "Zeitnah in der Hausarztpraxis vorstellen",
          reason: "Stürze im Alter haben oft eine Ursache, die man behandeln kann – zum Beispiel Kreislauf oder Sehen.",
          advice: [
            "Termin in der Hausarztpraxis vereinbaren.",
            "Prellungen kühlen und schonen.",
            "Stolperfallen in der Wohnung entfernen, gutes Licht nutzen.",
          ],
        },
      },
    },
  },
];

export function getFlow(slug) {
  return SYMPTOM_FLOWS.find((f) => f.slug === slug) || null;
}
