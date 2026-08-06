// Central API configuration — reads from Vite env vars
// Set these in Vercel dashboard: VITE_BACKEND_URL = https://your-render-app.onrender.com

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://suvidha1.onrender.com";
export const API_URL     = `${BACKEND_URL}/api`;
export const API_AUTH    = `${API_URL}/auth`;
