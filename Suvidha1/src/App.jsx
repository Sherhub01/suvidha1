import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";
import { LoadingState } from "./components/ui";
import { NotificationsProvider } from "./context/NotificationsContext";
import { BookingsProvider } from "./context/BookingsContext";
import {
  RequireConsumer,
  RequireStaff,
  RequireApproved,
  RequireAdmin,
  homePathForSession,
} from "./routes/guards";

// ── Auth (eager: this is the entry screen) ─────────────────
import Login from "./Auth/login";

// Everything else is code-split, so a consumer no longer downloads the staff
// and admin bundles on first paint.
const Signup = lazy(() => import("./Auth/signup"));
const Otp = lazy(() => import("./Auth/otp"));
const CreateUsername = lazy(() => import("./Auth/createUsername"));
const ForgotPassword = lazy(() => import("./Auth/forgotPass"));
const LoginEmail = lazy(() => import("./Auth/withEmail"));
const WelcomePage = lazy(() => import("./Auth/WelcomePage"));
const CreateProfileAuth = lazy(() => import("./Auth/CreateProfile"));

// ── Consumer ───────────────────────────────────────────────
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout"));
const Dashboard = lazy(() => import("./consumer/Dashboard"));
const Services = lazy(() => import("./consumer/Services"));
const ServiceDetails = lazy(() => import("./consumer/ServiceDetails"));
const WorkerList = lazy(() => import("./consumer/WorkerList"));
const WorkerProfile = lazy(() => import("./consumer/WorkerProfile"));
const ConsumerAbout = lazy(() => import("./consumer/About"));
const ConsumerSettings = lazy(() => import("./consumer/Settings"));
const Notifications = lazy(() => import("./consumer/Notifications"));
const MapPage = lazy(() => import("./consumer/MapPage"));
const ConsumerBookings = lazy(() => import("./consumer/Bookings"));
const PrivacyPolicy = lazy(() => import("./consumer/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./consumer/TermsConditions"));
const ContactUs = lazy(() => import("./consumer/ContactUs"));

// ── Staff ──────────────────────────────────────────────────
const StaffLayout = lazy(() => import("./staff/Layout"));
const StaffWelcome = lazy(() => import("./staff/Welcome"));
const StaffCreateProfile = lazy(() => import("./staff/CreateProfile"));
const VerificationWizard = lazy(() => import("./staff/Verification"));
const StaffDashboard = lazy(() => import("./staff/Dashboard"));
const StaffBookings = lazy(() => import("./staff/Bookings"));
const StaffMap = lazy(() => import("./staff/Map"));
const Earnings = lazy(() => import("./staff/Earnings"));
const StaffSettings = lazy(() => import("./staff/Settings"));
const StaffProfilePage = lazy(() => import("./staff/Profile"));
const StaffNotifications = lazy(() => import("./staff/Notifications"));
const PendingApproval = lazy(() => import("./staff/PendingApproval"));

// ── Admin ──────────────────────────────────────────────────
const AdminLogin = lazy(() => import("./suvidha1-admin/admin/AdminLogin"));
const AdminForgotPassword = lazy(() => import("./suvidha1-admin/admin/AdminForgotPassword"));
const AdminLayout = lazy(() => import("./suvidha1-admin/admin/Home"));
const AdminDashboard = lazy(() => import("./suvidha1-admin/admin/Dashboard"));
const StaffApproval = lazy(() => import("./suvidha1-admin/admin/StaffApproval"));
const StaffManagement = lazy(() => import("./suvidha1-admin/admin/StaffManagement"));
const ConsumerManagement = lazy(() => import("./suvidha1-admin/admin/ConsumerManagement"));
const BookingManagement = lazy(() => import("./suvidha1-admin/admin/BookingManagement"));
const ServicesManagement = lazy(() => import("./suvidha1-admin/admin/ServicesManagement"));
const Reports = lazy(() => import("./suvidha1-admin/admin/Reports"));
const Payments = lazy(() => import("./suvidha1-admin/admin/Payments"));
const AdminNotifications = lazy(() => import("./suvidha1-admin/admin/Notifications"));
const Analytics = lazy(() => import("./suvidha1-admin/admin/Analytics"));
const AdminSettings = lazy(() => import("./suvidha1-admin/admin/Settings"));
const AdminProfile = lazy(() => import("./suvidha1-admin/admin/Profile"));
const CreateAdmin = lazy(() => import("./suvidha1-admin/admin/CreateAdmin"));

/** Redirects an unknown URL: signed-in users go home, everyone else sees 404. */
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
                {/* ── Public auth ── */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/withEmail" element={<LoginEmail />} />
                <Route path="/otp" element={<Otp />} />
                <Route path="/createUsername" element={<CreateUsername />} />
                <Route path="/forgotPass" element={<ForgotPassword />} />
                <Route path="/welcome" element={<WelcomePage />} />

                {/* ── Consumer ── */}
                <Route
                  path="/create-profile"
                  element={
                    <RequireConsumer>
                      <CreateProfileAuth />
                    </RequireConsumer>
                  }
                />
                <Route
                  element={
                    <RequireConsumer>
                      <DashboardLayout />
                    </RequireConsumer>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:categoryId" element={<ServiceDetails />} />
                  <Route path="/services/:categoryId/workers" element={<WorkerList />} />
                  <Route path="/workers/:workerId" element={<WorkerProfile />} />
                  <Route path="/bookings" element={<ConsumerBookings />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/about" element={<ConsumerAbout />} />
                  <Route path="/settings" element={<ConsumerSettings />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsConditions />} />
                  <Route path="/contact" element={<ContactUs />} />
                </Route>

                {/* ── Staff ── */}
                <Route
                  path="/staff/pending"
                  element={
                    <RequireStaff>
                      <PendingApproval />
                    </RequireStaff>
                  }
                />
                <Route
                  path="/staff"
                  element={
                    <RequireStaff>
                      <StaffLayout />
                    </RequireStaff>
                  }
                >
                  <Route path="welcome" element={<StaffWelcome />} />
                  <Route path="create-profile" element={<StaffCreateProfile />} />
                  <Route path="verification" element={<VerificationWizard />} />
                  <Route path="settings" element={<StaffSettings />} />
                  <Route
                    path="dashboard"
                    element={
                      <RequireApproved>
                        <StaffDashboard />
                      </RequireApproved>
                    }
                  />
                  <Route
                    path="bookings"
                    element={
                      <RequireApproved>
                        <StaffBookings />
                      </RequireApproved>
                    }
                  />
                  <Route
                    path="map"
                    element={
                      <RequireApproved>
                        <StaffMap />
                      </RequireApproved>
                    }
                  />
                  <Route
                    path="earnings"
                    element={
                      <RequireApproved>
                        <Earnings />
                      </RequireApproved>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <RequireApproved>
                        <StaffProfilePage />
                      </RequireApproved>
                    }
                  />
                  <Route
                    path="notifications"
                    element={
                      <RequireApproved>
                        <StaffNotifications />
                      </RequireApproved>
                    }
                  />
                </Route>

                {/* ── Admin auth (public) ── */}
                {/* There is no admin signup route: accounts are created by a
                    super admin at /admin/accounts. */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

                {/* ── Admin ── */}
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminLayout />
                    </RequireAdmin>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="staff-approval" element={<StaffApproval />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="consumers" element={<ConsumerManagement />} />
                  <Route path="bookings" element={<BookingManagement />} />
                  <Route path="services" element={<ServicesManagement />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="accounts" element={<CreateAdmin />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>

                <Route path="*" element={<CatchAll />} />
              </Routes>
            </Suspense>
          </BookingsProvider>
        </NotificationsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
