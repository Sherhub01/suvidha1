import { Navigate, useLocation } from "react-router-dom";
import { adminSession, session } from "../shared/session";

// ────────────────────────────────────────────────────────────
// Route guards
//
// The role always comes from the JWT via session.getRole(), so the router and
// the API agree on who is signed in. The earlier version fell back field by
// field between localStorage and sessionStorage, which is how a consumer token
// could be paired with a staff role and produce a 403 on every request.
//
// This is still only a convenience layer: every protected endpoint is also
// guarded server-side by protect + requireRole.
// ────────────────────────────────────────────────────────────

export const getToken = () => session.getToken();
export const getRole = () => session.getRole();
export const getUser = () => session.getUser() || {};
export const getAdminToken = () => adminSession.getToken();

/** Where a given role belongs when it lands somewhere it should not be. */
export const homeForRole = (role) => {
  if (role === "staff") return getUser().profileCompleted ? "/staff/dashboard" : "/staff/welcome";
  if (role === "consumer") return "/dashboard";
  return "/login";
};

function RequireRole({ allow, children }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ role: allow, from: location.pathname }} replace />;
  }

  const role = getRole();

  // A token whose payload carries no role predates the role claim. Treat it as
  // untrusted and make the user sign in again rather than guessing.
  if (!role) {
    session.clear();
    return <Navigate to="/login" state={{ role: allow, from: location.pathname }} replace />;
  }

  if (role !== allow) {
    return <Navigate to={homeForRole(role)} replace />;
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

/** Admin screens reserved for a super admin. */
export function RequireSuperAdmin({ children }) {
  if (!getAdminToken()) return <Navigate to="/admin/login" replace />;
  return adminSession.isSuperAdmin() ? children : <Navigate to="/admin/dashboard" replace />;
}

/** Landing redirect for a visitor who hits an unknown URL. */
export function homePathForSession() {
  if (getAdminToken()) return "/admin/dashboard";
  if (!getToken()) return "/login";
  return homeForRole(getRole());
}
