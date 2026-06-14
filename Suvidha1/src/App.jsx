import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./Auth/login";
import Signup from "./Auth/signup";
import Otp from "./Auth/otp";
import CreateUsername from "./Auth/createUsername";
import ForgotPassword from "./Auth/forgotPass";
import LoginEmail from "./Auth/withEmail";
import WelcomePage from "./Auth/WelcomePage";
import CreateProfile from "./Auth/CreateProfile";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Consumer Pages
import Dashboard from "./consumer/Dashboard";
import Services from "./consumer/Services";
import About from "./consumer/About";
import Settings from "./consumer/Settings";
import WorkerDetail from "./consumer/WorkerDetail";
import WorkerListing from "./consumer/WorkerListing";
import Notifications from "./consumer/Notifications";

// Guard: requires token
const PrivateRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/withEmail" element={<LoginEmail />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/createUsername" element={<CreateUsername />} />
        <Route path="/forgotPass" element={<ForgotPassword />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/create-profile" element={<PrivateRoute><CreateProfile /></PrivateRoute>} />

        {/* Consumer - flat routes under DashboardLayout */}
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:category" element={<WorkerListing />} />
          <Route path="/workers/:id" element={<WorkerDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
