// Local dev should stay relative so Vite's proxy can send requests to localhost:5000.
// Production builds should resolve against the configured VITE_BACKEND_URL.
const configuredBackend = import.meta.env.VITE_BACKEND_URL || "";
const isDev = import.meta.env.DEV;

export const BACKEND_URL = isDev ? "" : configuredBackend;
export const API_URL      = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";
export const API_AUTH     = `${API_URL}/auth`;
