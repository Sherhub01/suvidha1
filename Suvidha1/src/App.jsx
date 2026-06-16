import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Auth/login";
import Signup from "./Auth/signup";
import Otp from "./Auth/otp";
import CreateUsername from "./Auth/createUsername";
import ForgotPassword from "./Auth/forgotPass";
import LoginEmail from "./Auth/withEmail";

import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./consumer/Dashboard";
import Services from "./consumer/Services";
import About from "./consumer/About";
import Settings from "./consumer/Settings";
import WorkerDetail from "./consumer/WorkerDetail";
import WorkerListing from "./consumer/WorkerListing";
import Bookings from "./consumer/Bookings";
import Notifications from "./consumer/Notifications";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"              element={<Login />} />
      <Route path="/login"         element={<Login />} />
      <Route path="/withEmail"     element={<LoginEmail />} />
      <Route path="/signup"        element={<Signup />} />
      <Route path="/otp"           element={<Otp />} />
      <Route path="/createUsername" element={<CreateUsername />} />
      <Route path="/forgotPass"    element={<ForgotPassword />} />

      <Route element={<DashboardLayout />}>
        <Route index                        element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"            element={<Dashboard />} />
        <Route path="/services"             element={<Services />} />
        <Route path="/services/:category"   element={<WorkerListing />} />
        <Route path="/workers/:id"          element={<WorkerDetail />} />
        <Route path="/bookings"             element={<Bookings />} />
        <Route path="/notifications"        element={<Notifications />} />
        <Route path="/about"                element={<About />} />
        <Route path="/settings"             element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
