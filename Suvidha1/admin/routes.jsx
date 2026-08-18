import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { RequireAdmin, RequireSuperAdmin } from "../app/guards";

const AdminLayout = lazy(() => import("./layout/AdminLayout"));
const Login = lazy(() => import("./pages/AdminLogin"));
const ForgotPassword = lazy(() => import("./pages/AdminForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StaffApproval = lazy(() => import("./pages/StaffApproval"));
const StaffManagement = lazy(() => import("./pages/StaffManagement"));
const ConsumerManagement = lazy(() => import("./pages/ConsumerManagement"));
const BookingManagement = lazy(() => import("./pages/BookingManagement"));
const ServicesManagement = lazy(() => import("./pages/ServicesManagement"));
const Payments = lazy(() => import("./pages/Payments"));
const Reports = lazy(() => import("./pages/Reports"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Notifications = lazy(() => import("./pages/Notifications"));
const CreateAdmin = lazy(() => import("./pages/CreateAdmin"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

/**
 * Admin route subtree, mounted by App.jsx.
 *
 * There is deliberately no signup route — admin accounts are created by a
 * super admin at /admin/accounts, and the backend enforces that too.
 */
export default function adminRoutes() {
  return (
    <>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="staff-approval" element={<StaffApproval />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="consumers" element={<ConsumerManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="services" element={<ServicesManagement />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />

        {/* Super admin only. */}
        <Route
          path="accounts"
          element={
            <RequireSuperAdmin>
              <CreateAdmin />
            </RequireSuperAdmin>
          }
        />
      </Route>
    </>
  );
}
