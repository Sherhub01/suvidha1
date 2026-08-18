import { lazy } from "react";
import { Route } from "react-router-dom";
import { RequireStaff, RequireApproved } from "../app/guards";

const StaffLayout = lazy(() => import("./layout/StaffLayout"));
const Welcome = lazy(() => import("./pages/Welcome"));
const CreateProfile = lazy(() => import("./pages/CreateProfile"));
const Verification = lazy(() => import("./pages/Verification"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Bookings = lazy(() => import("./pages/Bookings"));
const StaffMap = lazy(() => import("./pages/Map"));
const Earnings = lazy(() => import("./pages/Earnings"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const PendingApproval = lazy(() => import("./pages/PendingApproval"));

/** Wraps a screen that requires an approved profile. */
const approved = (element) => <RequireApproved>{element}</RequireApproved>;

/** Staff route subtree, mounted by App.jsx. */
export default function staffRoutes() {
  return (
    <>
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
        {/* Onboarding — reachable before approval. */}
        <Route path="welcome" element={<Welcome />} />
        <Route path="create-profile" element={<CreateProfile />} />
        <Route path="verification" element={<Verification />} />
        <Route path="settings" element={<Settings />} />

        {/* Everything else needs an approved profile. */}
        <Route path="dashboard" element={approved(<Dashboard />)} />
        <Route path="bookings" element={approved(<Bookings />)} />
        <Route path="map" element={approved(<StaffMap />)} />
        <Route path="earnings" element={approved(<Earnings />)} />
        <Route path="profile" element={approved(<Profile />)} />
        <Route path="notifications" element={approved(<Notifications />)} />
      </Route>
    </>
  );
}
