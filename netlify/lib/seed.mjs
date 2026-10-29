/*
 * Demo-Partner für den Testbetrieb. Wird nur angelegt, wenn noch kein Partner existiert und
 * lokal entwickelt wird (STORAGE_BACKEND=file) oder SEED_DEMO_PARTNERS=true gesetzt ist.
 * demo=true: Die App zeigt den Eintrag nur in Entwicklungs-Builds.
 */
import { partners } from "./storage/index.mjs";
import { storageBackend } from "./storage/kv.mjs";

const DEMO = [
  {
    id: "demo-bestatter-berlin",
    name: "Muster-Bestattungen (Demo)",
    country: "DE",
    currency: "EUR",
    address: "Musterstraße 1, 10115 Berlin",
    lat: 52.532,
    lon: 13.384,
    phone: "+49 30 0000000",
    website: "https://example.com/bestattungen",
    logo: "",
    tracking: "utm_source=sanusankh&utm_medium=app&utm_campaign=bestatter",
    priority: 1,
    active: true,
    demo: true,
    discount: {
      type: "percent",
      value: 10,
      conditions: "Auf das Bestatterhonorar, nicht auf Fremdleistungen wie Friedhofsgebühren. Nicht mit anderen Rabatten kombinierbar.",
      validFrom: "2026-01-01",
      validTo: "2027-12-31",
    },
    services: [
      { id: "vorsorgegespraech", title: "Kostenloses Vorsorgegespräch", description: "Persönliches Gespräch zu Ablauf, Wünschen und Kosten – bei Ihnen zu Hause oder bei uns.", priceFrom: null },
      { id: "vorsorgevertrag", title: "Bestattungsvorsorgevertrag", description: "Ihre Wünsche verbindlich festhalten und die Kosten absichern.", priceFrom: null },
      { id: "erdbestattung", title: "Erdbestattung", description: "Beratung, Überführung, Sarg, Formalitäten und Begleitung.", priceFrom: 2900 },
      { id: "feuerbestattung", title: "Feuerbestattung", description: "Beratung, Einäscherung, Urne, Formalitäten und Begleitung.", priceFrom: 1900 },
      { id: "seebestattung", title: "Seebestattung", description: "Urnenbeisetzung auf Nord- oder Ostsee.", priceFrom: 2400 },
      { id: "trauerfeier", title: "Trauerfeier", description: "Planung und Gestaltung der Trauerfeier.", priceFrom: 600 },
    ],
    contact: { email: "anfragen@example.com", webhookUrl: "", webhookSecret: "" },
    // Standard: keine Provisionsvereinbarung.
    commission: { agreed: false, type: "percent", value: null, from: "", to: "" },
    contract: {
      status: "active",
      from: "2026-01-01",
      to: "",
      contactName: "Max Muster (Demo)",
      contactEmail: "kontakt@example.com",
      contactPhone: "",
    },
  },
];

let seeded = false;

export async function ensureDemoPartners() {
  if (seeded) return;
  seeded = true;
  if (storageBackend !== "file" && process.env.SEED_DEMO_PARTNERS !== "true") return;
  if ((await partners.list()).length > 0) return;
  const now = new Date().toISOString();
  await Promise.all(DEMO.map((p) => partners.save({ ...p, updatedAt: now })));
}
