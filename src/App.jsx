import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import EmergencyPass from "@/pages/EmergencyPass";
import EmergencyPassForm from "@/pages/EmergencyPassForm";
import EmergencyPassView from "@/pages/EmergencyPassView";
import GuideDetail from "@/pages/GuideDetail";
import Guides from "@/pages/Guides";
import History from "@/pages/History";
import Home from "@/pages/Home";
import Hospitals from "@/pages/Hospitals";
import Legal from "@/pages/Legal";
import Numbers from "@/pages/Numbers";
import PageNotFound from "@/pages/PageNotFound";
import Pharmacy from "@/pages/Pharmacy";
import Settings from "@/pages/Settings";
import Telemedicine from "@/pages/Telemedicine";
import Transport from "@/pages/Transport";
import Triage from "@/pages/Triage";

// Admin-Ansicht als eigener Chunk – wird nur beim Aufruf von /admin geladen.
const AdminApp = lazy(() => import("@/admin/AdminApp"));

export default function App() {
  return (
    <I18nProvider>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Vollbild für Rettungskräfte bewusst ohne App-Navigation */}
            <Route path="/pass/:id/show" element={<EmergencyPassView />} />
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<p className="p-6">Wird geladen …</p>}>
                  <AdminApp />
                </Suspense>
              }
            />

            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="triage" element={<Triage />} />
              <Route path="guides" element={<Guides />} />
              <Route path="guides/:slug" element={<GuideDetail />} />
              <Route path="numbers" element={<Numbers />} />
              <Route path="pharmacy" element={<Pharmacy />} />
              <Route path="telemedicine" element={<Telemedicine />} />
              <Route path="transport" element={<Transport />} />
              <Route path="hospitals" element={<Hospitals />} />
              <Route path="pass" element={<EmergencyPass />} />
              <Route path="pass/new" element={<EmergencyPassForm />} />
              <Route path="pass/:id" element={<EmergencyPassForm />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
              <Route path="impressum" element={<Legal />} />
              <Route path="datenschutz" element={<Legal />} />
              <Route path="haftungsausschluss" element={<Legal />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </I18nProvider>
  );
}
