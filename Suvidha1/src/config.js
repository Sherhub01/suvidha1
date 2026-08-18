// Local dev stays relative so Vite's proxy forwards to localhost:5000.
// Production builds resolve against VITE_BACKEND_URL.
const configuredBackend = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
const isDev = import.meta.env.DEV;

if (!isDev && !configuredBackend) {
  // A production bundle with no backend URL silently calls its own origin,
  // which is very hard to debug from the network tab alone.
  console.error("VITE_BACKEND_URL is not set — API requests will target the current origin.");
}

export const BACKEND_URL = isDev ? "" : configuredBackend;
export const API_URL = `${BACKEND_URL}/api`;
export const API_AUTH = `${API_URL}/auth`;

/**
 * Builds a URL for a file served by the backend (avatars, gallery images).
 *
 * Accepts absolute URLs (Cloudinary) unchanged, and prefixes backend-relative
 * paths such as "/uploads/avatars/abc.jpg".
 */
export const assetUrl = (path) => {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
