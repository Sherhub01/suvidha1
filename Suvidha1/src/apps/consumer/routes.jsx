import { lazy } from "react";
import { Route } from "react-router-dom";
import { RequireConsumer } from "../../app/guards";

// Every consumer screen is code-split, so a staff or admin visitor never
// downloads this app's bundle.
const ConsumerLayout = lazy(() => import("./layout/ConsumerLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetails = lazy(() => import("./pages/ServiceDetails"));
const WorkerList = lazy(() => import("./pages/WorkerList"));
const WorkerProfile = lazy(() => import("./pages/WorkerProfile"));
const Bookings = lazy(() => import("./pages/Bookings"));
const MapPage = lazy(() => import("./pages/MapPage"));
const Notifications = lazy(() => import("./pages/Notifications"));
const About = lazy(() => import("./pages/About"));
const Settings = lazy(() => import("./pages/Settings"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const CreateProfile = lazy(() => import("../auth/pages/CreateProfile"));

/** Consumer route subtree, mounted by App.jsx. */
export default function consumerRoutes() {
  return (
    <>
      <Route
        path="/create-profile"
        element={
          <RequireConsumer>
            <CreateProfile />
          </RequireConsumer>
        }
      />

      <Route
        element={
          <RequireConsumer>
            <ConsumerLayout />
          </RequireConsumer>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:categoryId" element={<ServiceDetails />} />
        <Route path="/services/:categoryId/workers" element={<WorkerList />} />
        <Route path="/workers/:workerId" element={<WorkerProfile />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/contact" element={<ContactUs />} />
      </Route>
    </>
  );
}
