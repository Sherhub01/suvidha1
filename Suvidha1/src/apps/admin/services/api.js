import { adminRoot as api } from "../../../shared/services/http";

// ────────────────────────────────────────────────────────────
// Admin endpoint map
//
// The axios instance, auth header and 401 handling now live in
// src/services/http.js — this module only names the routes.
// ────────────────────────────────────────────────────────────

// ── Dashboard ──────────────────────────────────────────────
export const getDashboardStats   = ()     => api.get("/admin/stats");
export const getRecentBookings   = (p)    => api.get("/admin/bookings", { params: { limit: 5, ...p } });
export const getRecentStaff      = (p)    => api.get("/staff/admin/list", { params: { status: "pending", limit: 5, ...p } });
export const getRecentConsumers  = (p)    => api.get("/admin/consumers", { params: { limit: 5, ...p } });

// ── Staff Approval ─────────────────────────────────────────
export const getPendingStaff     = (p)    => api.get("/staff/admin/list", { params: p });
export const getStaffDetail      = (id)   => api.get(`/staff/admin/detail/${id}`);
export const approveStaff        = (id)   => api.patch(`/staff/admin/approve/${id}`);
export const rejectStaff         = (id, reason) => api.patch(`/staff/admin/reject/${id}`, { reason });

// ── Staff Management ───────────────────────────────────────
export const getAllStaff          = (p)   => api.get("/admin/staff", { params: p });
export const updateStaff          = (id, data) => api.put(`/admin/staff/${id}`, data);
export const deleteStaff          = (id)  => api.delete(`/admin/staff/${id}`);
export const suspendStaff         = (id)  => api.patch(`/staff/admin/reject/${id}`, { reason: "Suspended by admin" });
export const disableStaff         = (id)  => api.delete(`/admin/staff/${id}`);

// ── Consumer Management ────────────────────────────────────
export const getConsumers         = (p)   => api.get("/admin/consumers", { params: p });
export const getConsumerDetail    = (id)  => api.get(`/admin/consumers/${id}`);
export const updateConsumer       = (id, data) => api.put(`/admin/consumers/${id}`, data);
export const deactivateConsumer   = (id)  => api.delete(`/admin/consumers/${id}`);

// ── Booking Management ─────────────────────────────────────
export const getBookings          = (p)   => api.get("/admin/bookings", { params: p });
export const getBookingDetail     = (id)  => api.get(`/admin/bookings/${id}`);
export const assignStaffToBooking = (id, staffId) => api.put(`/admin/bookings/${id}/assign`, { staffId });
export const cancelBooking        = (id)  => api.patch(`/bookings/${id}/cancel`);
export const refundBooking        = (id)  => api.patch(`/bookings/${id}/cancel`);
export const completeBooking      = (id)  => api.patch(`/bookings/${id}/done`);

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
export const changePassword       = (d)   => api.patch("/admin/change-password", d);

// ── Profile ───────────────────────────────────────────────
export const getAdminProfile      = ()    => api.get("/admin/profile");
export const updateAdminProfile   = (d)   => api.patch("/admin/profile", d);

export default api;
