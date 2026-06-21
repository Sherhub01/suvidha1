import axios from "axios";

const staffAPI = axios.create({ baseURL: "http://localhost:5000/api/staff" });

staffAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminStaffAPI = axios.create({ baseURL: "http://localhost:5000/api/staff" });
adminStaffAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
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
