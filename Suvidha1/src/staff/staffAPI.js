import axios from "axios";
import { session, adminSession } from "../session";

const staffAPI = axios.create({ baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api") + "/staff" });
staffAPI.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminStaffAPI = axios.create({ baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api") + "/staff" });
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
