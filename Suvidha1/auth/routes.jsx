import { lazy } from "react";
import { Route } from "react-router-dom";

// Login is eager — it is the entry screen for every visitor.
import Login from "./pages/login";

const Signup = lazy(() => import("./pages/signup"));
const Otp = lazy(() => import("./pages/otp"));
const CreateUsername = lazy(() => import("./pages/createUsername"));
const ForgotPassword = lazy(() => import("./pages/forgotPass"));
const LoginWithEmail = lazy(() => import("./pages/withEmail"));
const WelcomePage = lazy(() => import("./pages/WelcomePage"));

/** Public authentication routes, mounted by App.jsx. */
export default function authRoutes() {
  return (
    <>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/withEmail" element={<LoginWithEmail />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/createUsername" element={<CreateUsername />} />
      <Route path="/forgotPass" element={<ForgotPassword />} />
      <Route path="/welcome" element={<WelcomePage />} />
    </>
  );
}
