// Local dev: VITE_BACKEND_URL is empty → relative URLs → Vite proxy → localhost:5000
// Production (Vercel): VITE_BACKEND_URL=https://suvidha1.onrender.com set in Vercel dashboard
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
export const API_URL     = `${BACKEND_URL}/api`;
export const API_AUTH    = `${API_URL}/auth`;
