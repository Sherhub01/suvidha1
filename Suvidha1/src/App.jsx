import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ErrorBoundary from "./shared/components/ErrorBoundary";
import NotFound from "./shared/components/NotFound";
import { LoadingState } from "./shared/ui";
import { NotificationsProvider } from "./shared/context/NotificationsContext";
import { BookingsProvider } from "./apps/consumer/context/BookingsContext";
import { homePathForSession } from "./app/guards";

import authRoutes from "./apps/auth/routes";
import consumerRoutes from "./apps/consumer/routes";
import staffRoutes from "./apps/staff/routes";
import adminRoutes from "./apps/admin/routes";

// ────────────────────────────────────────────────────────────
// Each role owns its own folder under src/apps/ and declares its own routes.
// This file only composes them, so nothing about the consumer app can reach
// into the staff or admin app by accident.
// ────────────────────────────────────────────────────────────

/** Unknown URL: signed-in users go to their own home, everyone else sees 404. */
function CatchAll() {
  const home = homePathForSession();
  return home === "/login" ? <NotFound homePath="/login" /> : <Navigate to={home} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationsProvider>
          <BookingsProvider>
            <Suspense fallback={<LoadingState className="min-h-screen" label="Loading…" />}>
              <Routes>
                {authRoutes()}
                {consumerRoutes()}
                {staffRoutes()}
                {adminRoutes()}
                <Route path="*" element={<CatchAll />} />
              </Routes>
            </Suspense>
          </BookingsProvider>
        </NotificationsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
