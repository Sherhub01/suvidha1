import { Navigate, useLocation } from "react-router-dom";
import { session, adminSession } from "../session";

// ────────────────────────────────────────────────────────────
// Route guards
//
// These are a convenience layer only. Every protected endpoint is also guarded
// server-side by protect + requireRole, so a tampered localStorage value cannot
// grant access to data — it only changes which screen renders.
// ────────────────────────────────────────────────────────────

export const getToken = () => session.getToken() || localStorage.getItem("token");
export const getRole = () => session.getRole() || localStorage.getItem("userRole");
export const getAdminToken = () => adminSession.getToken() || localStorage.getItem("admin_token");

export const getUser = () => {
  try {
    return session.getUser() || JSON.parse(localStorage.getItem("user") || "null") || {};
  } catch {
    return {};
  }
};

/** Sends anyone without a matching role back to the right place. */
function RequireRole({ allow, children }) {
  const location = useLocation();
  const token = getToken();
  const currentRole = getRole();

  if (!token) {
    return <Navigate to="/login" state={{ role: allow, from: location.pathname }} replace />;
  }

  if (currentRole !== allow) {
    const home = currentRole === "staff" ? "/staff/dashboard" : currentRole === "consumer" ? "/dashboard" : "/login";
    return <Navigate to={home} replace />;
  }

  return children;
}

export function RequireConsumer({ children }) {
  return <RequireRole allow="consumer">{children}</RequireRole>;
}

export function RequireStaff({ children }) {
  return <RequireRole allow="staff">{children}</RequireRole>;
}

/** Staff screens that only make sense once the profile has been approved. */
export function RequireApproved({ children }) {
  return getUser().profileCompleted ? children : <Navigate to="/staff/pending" replace />;
}

export function RequireAdmin({ children }) {
  return getAdminToken() ? children : <Navigate to="/admin/login" replace />;
}

/** Landing redirect for a signed-in visitor who hits an unknown URL. */
export function homePathForSession() {
  if (getAdminToken()) return "/admin/dashboard";

  const role = getRole();
  if (!getToken() || !role) return "/login";
  if (role === "staff") return getUser().profileCompleted ? "/staff/dashboard" : "/staff/welcome";
  return "/dashboard";
}
