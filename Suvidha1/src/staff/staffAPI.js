import axios from "axios";
import { session, adminSession } from "../session";

const BASE = import.meta.env.VITE_BACKEND_URL || "";

const staffAPI = axios.create({ baseURL: `${BASE}/api/staff` });
staffAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || session.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminStaffAPI = axios.create({ baseURL: `${BASE}/api/staff` });
adminStaffAPI.interceptors.request.use((config) => {
  const token = adminSession.getToken() || localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
adminStaffAPI.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) window.location.href = "/admin/login";
    return Promise.reject(err);
  }
);

export default staffAPI;
