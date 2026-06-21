import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login             from "./Auth/login";
import Signup            from "./Auth/signup";
import Otp               from "./Auth/otp";
import CreateUsername    from "./Auth/createUsername";
import ForgotPassword    from "./Auth/forgotPass";
import LoginEmail        from "./Auth/withEmail";
import WelcomePage       from "./Auth/WelcomePage";
import CreateProfileAuth from "./Auth/CreateProfile";

import DashboardLayout  from "./components/layout/DashboardLayout";
import Dashboard        from "./consumer/Dashboard";
import Services         from "./consumer/Services";
import ServiceDetails   from "./consumer/ServiceDetails";
import WorkerList       from "./consumer/WorkerList";
import WorkerProfile    from "./consumer/WorkerProfile";
import ConsumerAbout    from "./consumer/About";
import ConsumerSettings from "./consumer/Settings";
import Notifications    from "./consumer/Notifications";
import MapPage          from "./consumer/MapPage";
import ConsumerBookings from "./consumer/Bookings";
import PrivacyPolicy    from "./consumer/PrivacyPolicy";
import TermsConditions  from "./consumer/TermsConditions";

import StaffLayout        from "./staff/Layout";
import StaffWelcome       from "./staff/Welcome";
import StaffCreateProfile from "./staff/CreateProfile";
import VerificationWizard from "./staff/Verification";
import StaffDashboard     from "./staff/Dashboard";
import StaffBookings      from "./staff/Bookings";
import StaffMap           from "./staff/Map";
import Earnings           from "./staff/Earnings";
import StaffSettings      from "./staff/Settings";
import StaffProfile       from "./staff/Profile";
import StaffNotifications from "./staff/Notifications";
import PendingApproval    from "./staff/PendingApproval";

import { AdminLogin, AdminSignup, AdminForgotPassword } from "./suvidha1-admin/admin/index.jsx";
import AdminLayout       from "./suvidha1-admin/admin/Home";
import Dashboard2        from "./suvidha1-admin/admin/Dashboard";
import StaffApproval     from "./suvidha1-admin/admin/StaffApproval";
import StaffManagement   from "./suvidha1-admin/admin/StaffManagement";
import ConsumerManagement from "./suvidha1-admin/admin/ConsumerManagement";
import BookingManagement from "./suvidha1-admin/admin/BookingManagement";
import ServicesManagement from "./suvidha1-admin/admin/ServicesManagement";
import Reports           from "./suvidha1-admin/admin/Reports";
import Payments          from "./suvidha1-admin/admin/Payments";
import AdminNotifications from "./suvidha1-admin/admin/Notifications";
import Analytics         from "./suvidha1-admin/admin/Analytics";
import AdminSettings     from "./suvidha1-admin/admin/Settings";
import AdminProfile      from "./suvidha1-admin/admin/Profile";

import { NotificationsProvider } from "./context/NotificationsContext";

const getToken = () => localStorage.getItem("token");
const getRole  = () => localStorage.getItem("userRole");
const getAdmin = () => localStorage.getItem("admin_token");

function RequireConsumer({ children }) {
  const location = useLocation();
  const token = getToken();
  const role  = getRole();
  if (!token) return <Navigate to="/login" state={{ role: "consumer", from: location.pathname }} replace />;
  if (role !== "consumer") return <Navigate to={role === "staff" ? "/staff/dashboard" : "/login"} replace />;
  return children;
}

function RequireStaff({ children }) {
  const location = useLocation();
  const token = getToken();
  const role  = getRole();
  if (!token) return <Navigate to="/login" state={{ role: "staff", from: location.pathname }} replace />;
  if (role !== "staff") return <Navigate to={role === "consumer" ? "/dashboard" : "/login"} replace />;
  return children;
}

function RequireApproved({ children }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  if (!user.profileCompleted) return <Navigate to="/staff/pending" replace />;
  return children;
}

function RequireAdmin({ children }) {
  return getAdmin() ? children : <Navigate to="/admin/login" replace />;
}

function CatchAll() {
  const token = getToken();
  const role  = getRole();
  const admin = getAdmin();
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  if (token) {
    if (role === "staff") {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return <Navigate to={user.profileCompleted ? "/staff/dashboard" : "/staff/welcome"} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
}

function AdminGuard({ children }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}

export default function App() {
  return (
    <NotificationsProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public auth ── */}
          <Route path="/"               element={<Login />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/withEmail"      element={<LoginEmail />} />
          <Route path="/otp"            element={<Otp />} />
          <Route path="/createUsername" element={<CreateUsername />} />
          <Route path="/forgotPass"     element={<ForgotPassword />} />
          <Route path="/welcome"        element={<WelcomePage />} />

          {/* ── Consumer protected ── */}
          <Route path="/create-profile" element={<RequireConsumer><CreateProfileAuth /></RequireConsumer>} />
          <Route element={<RequireConsumer><DashboardLayout /></RequireConsumer>}>
            <Route path="/dashboard"                    element={<Dashboard />} />
            <Route path="/services"                     element={<Services />} />
            <Route path="/services/:categoryId"         element={<ServiceDetails />} />
            <Route path="/services/:categoryId/workers" element={<WorkerList />} />
            <Route path="/workers/:workerId"            element={<WorkerProfile />} />
            <Route path="/bookings"                     element={<ConsumerBookings />} />
            <Route path="/map"                          element={<MapPage />} />
            <Route path="/notifications"                element={<Notifications />} />
            <Route path="/about"                        element={<ConsumerAbout />} />
            <Route path="/settings"                     element={<ConsumerSettings />} />
            <Route path="/privacy"                      element={<PrivacyPolicy />} />
            <Route path="/terms"                        element={<TermsConditions />} />
          </Route>

          {/* ── Staff protected ── */}
          <Route path="/staff/pending" element={<RequireStaff><PendingApproval /></RequireStaff>} />
          <Route path="/staff" element={<RequireStaff><StaffLayout /></RequireStaff>}>
            <Route path="welcome"        element={<StaffWelcome />} />
            <Route path="create-profile" element={<StaffCreateProfile />} />
            <Route path="verification"   element={<VerificationWizard />} />
            <Route path="dashboard"      element={<RequireApproved><StaffDashboard /></RequireApproved>} />
            <Route path="bookings"       element={<RequireApproved><StaffBookings /></RequireApproved>} />
            <Route path="map"            element={<RequireApproved><StaffMap /></RequireApproved>} />
            <Route path="earnings"       element={<RequireApproved><Earnings /></RequireApproved>} />
            <Route path="profile"        element={<RequireApproved><StaffProfile /></RequireApproved>} />
            <Route path="settings"       element={<StaffSettings />} />
            <Route path="notifications"   element={<RequireApproved><StaffNotifications /></RequireApproved>} />
          </Route>

          {/* ── Admin auth (public) ── */}
          <Route path="/admin/login"           element={<AdminLogin />} />
          <Route path="/admin/signup"          element={<AdminSignup />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

          {/* ── Admin protected — explicit flat routes inside AdminLayout ── */}
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index                 element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard2 />} />
            <Route path="staff-approval" element={<StaffApproval />} />
            <Route path="staff"          element={<StaffManagement />} />
            <Route path="consumers"      element={<ConsumerManagement />} />
            <Route path="bookings"       element={<BookingManagement />} />
            <Route path="services"       element={<ServicesManagement />} />
            <Route path="payments"       element={<Payments />} />
            <Route path="reports"        element={<Reports />} />
            <Route path="analytics"      element={<Analytics />} />
            <Route path="notifications"  element={<AdminNotifications />} />
            <Route path="settings"       element={<AdminSettings />} />
            <Route path="profile"        element={<AdminProfile />} />
          </Route>

          <Route path="*" element={<CatchAll />} />
        </Routes>
      </BrowserRouter>
    </NotificationsProvider>
  );
}
