import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.location.href = "/admin/login";
    return Promise.reject(err);
  }
);

// ── Dashboard ──────────────────────────────────────────────
export const getDashboardStats   = ()     => api.get("/admin/dashboard");
export const getRecentBookings   = ()     => api.get("/admin/dashboard/recent-bookings");
export const getRecentStaff      = ()     => api.get("/admin/dashboard/recent-staff");
export const getRecentConsumers  = ()     => api.get("/admin/dashboard/recent-consumers");

// ── Staff Approval ─────────────────────────────────────────
export const getPendingStaff     = (p)    => api.get("/staff/admin/list", { params: p });
export const getStaffDetail      = (id)   => api.get(`/staff/admin/detail/${id}`);
export const approveStaff        = (id)   => api.patch(`/staff/admin/approve/${id}`);
export const rejectStaff         = (id, reason) => api.patch(`/staff/admin/reject/${id}`, { reason });

// ── Staff Management ───────────────────────────────────────
export const getAllStaff          = (p)   => api.get("/admin/staff", { params: p });
export const updateStaff          = (id, data) => api.put(`/admin/staff/${id}`, data);
export const deleteStaff          = (id)  => api.delete(`/admin/staff/${id}`);
export const suspendStaff         = (id)  => api.put(`/admin/staff/${id}/suspend`);
export const disableStaff         = (id)  => api.put(`/admin/staff/${id}/disable`);

// ── Consumer Management ────────────────────────────────────
export const getConsumers         = (p)   => api.get("/admin/consumers", { params: p });
export const getConsumerDetail    = (id)  => api.get(`/admin/consumers/${id}`);
export const updateConsumer       = (id, data) => api.put(`/admin/consumers/${id}`, data);
export const deactivateConsumer   = (id)  => api.put(`/admin/consumers/${id}/deactivate`);

// ── Booking Management ─────────────────────────────────────
export const getBookings          = (p)   => api.get("/admin/bookings", { params: p });
export const getBookingDetail     = (id)  => api.get(`/admin/bookings/${id}`);
export const assignStaffToBooking = (id, staffId) => api.put(`/admin/bookings/${id}/assign`, { staffId });
export const cancelBooking        = (id)  => api.put(`/admin/bookings/${id}/cancel`);
export const refundBooking        = (id)  => api.put(`/admin/bookings/${id}/refund`);
export const completeBooking      = (id)  => api.put(`/admin/bookings/${id}/complete`);

// ── Services ───────────────────────────────────────────────
export const getServices          = ()    => api.get("/admin/services");
export const createService        = (d)   => api.post("/admin/services", d);
export const updateService        = (id, d) => api.put(`/admin/services/${id}`, d);
export const deleteService        = (id)  => api.delete(`/admin/services/${id}`);
export const toggleService        = (id)  => api.put(`/admin/services/${id}/toggle`);

// ── Payments ───────────────────────────────────────────────
export const getPayments          = (p)   => api.get("/admin/payments", { params: p });
export const approveWithdrawal    = (id)  => api.put(`/admin/payments/withdrawals/${id}/approve`);

// ── Reports ────────────────────────────────────────────────
export const getReports           = (p)   => api.get("/admin/reports", { params: p });
export const exportReport         = (type, fmt) => api.get(`/admin/reports/export`, { params: { type, format: fmt }, responseType: "blob" });

// ── Analytics ─────────────────────────────────────────────
export const getAnalytics         = (p)   => api.get("/admin/analytics", { params: p });

// ── Notifications ─────────────────────────────────────────
export const sendNotification     = (d)   => api.post("/admin/notifications/send", d);
export const getNotifications     = ()    => api.get("/admin/notifications");

// ── Settings ──────────────────────────────────────────────
export const getSettings          = ()    => api.get("/admin/settings");
export const updateSettings       = (d)   => api.put("/admin/settings", d);
export const changePassword       = (d)   => api.put("/admin/settings/password", d);

// ── Profile ───────────────────────────────────────────────
export const getAdminProfile      = ()    => api.get("/admin/profile");
export const updateAdminProfile   = (d)   => api.put("/admin/profile", d);

export default api;
