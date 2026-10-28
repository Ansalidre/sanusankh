import { useCallback, useEffect, useState } from "react";
import { LockKeyhole, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, configureAdminApi } from "./api";
import Partners from "./Partners";
import Referrals from "./Referrals";
import Report from "./Report";

const IDLE_MS = 30 * 60 * 1000; // wie auf dem Server (lib/auth.mjs)

const LOGIN_ERRORS = {
  wrong_password: (d) => `Falsches Passwort. Noch ${d.attemptsLeft} Versuch(e), danach ist der Zugang 15 Minuten gesperrt.`,
  locked: (d) => `Zu viele Fehlversuche. Bitte in ${Math.ceil((d.retryAfter || 900) / 60)} Minuten erneut versuchen.`,
  not_configured: () => "Die Admin-Ansicht ist nicht eingerichtet (ADMIN_PASSWORD mit mindestens 12 Zeichen in Netlify setzen).",
};

function Login({ onLogin, notice }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await adminApi("/login", { method: "POST", body: { password } });
      setPassword("");
      onLogin(data);
    } catch (e) {
      setError((LOGIN_ERRORS[e.code] || (() => "Anmeldung fehlgeschlagen."))(e.data || {}));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockKeyhole aria-hidden /> SanusAnkh Admin
          </CardTitle>
          <CardDescription>Kooperations-Bestatter, Vermittlungen und Provisionen.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {notice && <p className="rounded-lg bg-ampel-orange-soft p-3 text-sm font-semibold text-ampel-orange">{notice}</p>}
            <div className="space-y-2">
              <Label htmlFor="admin-password">Passwort</Label>
              <Input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <p role="alert" className="text-sm font-semibold text-emergency">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy || !password}>
              Anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

/** Admin-Ansicht unter /admin (nur Web, nicht in der App). */
export default function AdminApp() {
  const [session, setSession] = useState({ state: "checking" });
  const [notice, setNotice] = useState("");
  const [partners, setPartners] = useState([]);

  const endSession = useCallback((message) => {
    setSession({ state: "out" });
    setNotice(message || "");
  }, []);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    document.title = "SanusAnkh Admin";
    configureAdminApi({
      onUnauthorized: () => endSession("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an."),
      onActivity: () => setSession((s) => (s.state === "in" ? { ...s, idleUntil: Date.now() + IDLE_MS } : s)),
    });
    adminApi("/session")
      .then((data) => setSession({ state: "in", delivery: data.delivery, idleUntil: Date.now() + IDLE_MS }))
      .catch(() => setSession({ state: "out" }));
    return () => meta.remove();
  }, [endSession]);

  // Sitzungs-Timeout auch ohne weiteren Serveraufruf anzeigen.
  useEffect(() => {
    if (session.state !== "in") return undefined;
    const timer = setInterval(() => {
      if (Date.now() > session.idleUntil) {
        adminApi("/logout", { method: "POST" }).catch(() => {});
        endSession("Du wurdest nach 30 Minuten ohne Aktivität abgemeldet.");
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [session, endSession]);

  const loadPartners = useCallback(() => adminApi("/partners").then((d) => setPartners(d.partners)), []);
  useEffect(() => {
    if (session.state === "in") loadPartners().catch(() => {});
  }, [session.state, loadPartners]);

  if (session.state === "checking") return <p className="p-6 text-muted-foreground">Wird geladen …</p>;
  if (session.state === "out") {
    return (
      <Login
        notice={notice}
        onLogin={(data) => {
          setNotice("");
          setSession({ state: "in", delivery: data.delivery, idleUntil: Date.now() + IDLE_MS });
        }}
      />
    );
  }

  const logout = async () => {
    await adminApi("/logout", { method: "POST" }).catch(() => {});
    endSession("Du hast dich abgemeldet.");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">SanusAnkh Admin</h1>
          <p className="text-sm text-muted-foreground">Kooperations-Bestatter, Vermittlungen und Provisionen – nur für das SanusAnkh-Team.</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut aria-hidden /> Abmelden
        </Button>
      </header>
      {session.delivery === "test" && (
        <p className="rounded-lg bg-ampel-orange-soft p-3 text-sm font-semibold text-ampel-orange">
          Testbetrieb: E-Mails und Webhooks werden nicht versendet, sondern nur protokolliert (BREVO_API_KEY und MAIL_FROM fehlen).
        </p>
      )}
      <Tabs defaultValue="referrals">
        <TabsList className="flex-wrap">
          <TabsTrigger value="referrals">Vermittlungen</TabsTrigger>
          <TabsTrigger value="report">Abrechnung</TabsTrigger>
          <TabsTrigger value="partners">Bestatter</TabsTrigger>
        </TabsList>
        <TabsContent value="referrals">
          <Referrals partners={partners} />
        </TabsContent>
        <TabsContent value="report">
          <Report partners={partners} />
        </TabsContent>
        <TabsContent value="partners">
          <Partners partners={partners} reload={loadPartners} />
        </TabsContent>
      </Tabs>
      {/* TODO: Mehrere Admin-Konten; eigener Partner-Zugang zum Einlösen von Codes und Melden von Auftragswerten. */}
    </div>
  );
}
