import axios from "axios";
import { adminSession, session } from "../session";
import { API_URL } from "../config";

// ────────────────────────────────────────────────────────────
// HTTP clients
//
// One user client and one admin client for the whole app. Every screen used to
// build its own axios instance and repeat the same auth interceptor, which is
// how several pages ended up pinned to http://localhost:5000 in production.
// Base URLs now always come from src/config.js.
// ────────────────────────────────────────────────────────────

const TIMEOUT_MS = 30000;

/** Drops the signed-in session and returns to the right login page. */
function endSession({ admin }) {
  // clear() removes the current key and any leftover legacy keys.
  if (admin) adminSession.clear();
  else session.clear();

  const target = admin ? "/admin/login" : "/login";
  if (window.location.pathname !== target) {
    window.location.replace(target);
  }
}

function createClient({ path = "", admin = false } = {}) {
  const client = axios.create({
    baseURL: `${API_URL}${path}`,
    timeout: TIMEOUT_MS,
  });

  client.interceptors.request.use((config) => {
    const token = admin
      ? adminSession.getToken()
      : session.getToken();

    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Let the browser set the multipart boundary itself.
    if (config.data instanceof FormData) delete config.headers["Content-Type"];

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      // An expired or revoked token should drop the session rather than leave
      // the user staring at a screen that silently fails to load.
      if (status === 401) endSession({ admin });

      // Surface one predictable message shape to every caller.
      error.uiMessage =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "The request timed out. Please check your connection."
          : status === 403
            ? "You do not have permission to do that."
            : status === 429
              ? "Too many requests. Please wait a moment and try again."
              : "Something went wrong. Please try again.");

      return Promise.reject(error);
    }
  );

  return client;
}

/** `/api` — generic user-authenticated client. */
export const http = createClient();

/** `/api/auth` */
export const authApi = createClient({ path: "/auth" });

/** `/api/bookings` */
export const bookingsApi = createClient({ path: "/bookings" });

/** `/api/staff` — signed in as the professional. */
export const staffApi = createClient({ path: "/staff" });

/** `/api/gallery` */
export const galleryApi = createClient({ path: "/gallery" });

/** `/api/ai` */
export const aiApi = createClient({ path: "/ai" });

/** `/api/admin` — uses the admin token. */
export const adminApi = createClient({ path: "/admin", admin: true });

/** `/api/staff` — admin-authenticated staff moderation endpoints. */
export const adminStaffApi = createClient({ path: "/staff", admin: true });

/** `/api` with the admin token — for callers that spell out the full route. */
export const adminRoot = createClient({ admin: true });

/** Reads the friendly message attached by the response interceptor. */
export const errorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.uiMessage || error?.response?.data?.message || fallback;

export default http;
