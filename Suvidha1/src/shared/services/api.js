import { http, adminApi, adminRoot } from "./http";

// ────────────────────────────────────────────────────────────
// Endpoint map
//
// One named function per backend route, so screens never hand-build URLs and a
// route change is a one-line edit here.
//
// Money crosses the wire in rupees; the backend keeps paise internally.
// ────────────────────────────────────────────────────────────

const unwrap = (promise) => promise.then((r) => r.data);

// ── Services catalogue ─────────────────────────────────────
export const servicesApi = {
  list: (config) => unwrap(http.get("/services", config)),
  get: (slug, config) => unwrap(http.get(`/services/${slug}`, config)),
};

// ── Bookings ───────────────────────────────────────────────
export const bookingsApi = {
  /** Price a booking before placing it. */
  quote: (payload) => unwrap(http.post("/bookings/quote", payload)),

  /** Free hourly slots for a professional on a date (YYYY-MM-DD). */
  availability: (staffId, date, config) =>
    unwrap(http.get(`/bookings/availability/${staffId}`, { params: { date }, ...config })),

  create: (payload) => unwrap(http.post("/bookings", payload)),

  // Consumer
  mine: (params, config) => unwrap(http.get("/bookings/consumer", { params, ...config })),
  cancel: (id, reason = "") => unwrap(http.patch(`/bookings/${id}/cancel`, { reason })),

  // Staff
  assigned: (params, config) => unwrap(http.get("/bookings/staff", { params, ...config })),
  accept: (id) => unwrap(http.patch(`/bookings/${id}/accept`)),
  start: (id) => unwrap(http.patch(`/bookings/${id}/start`)),
  reject: (id, reason) => unwrap(http.patch(`/bookings/${id}/reject`, { reason })),
  complete: (id) => unwrap(http.patch(`/bookings/${id}/done`)),

  approvedStaff: (params, config) =>
    unwrap(http.get("/bookings/approved-staff", { params, ...config })),

  // Alerts
  staffAlerts: (config) => unwrap(http.get("/bookings/alerts", config)),
  staffUnreadCount: (config) => unwrap(http.get("/bookings/alerts/unread-count", config)),
  readStaffAlert: (id) => unwrap(http.patch(`/bookings/alerts/${id}/read`)),
  readAllStaffAlerts: () => unwrap(http.patch("/bookings/alerts/read-all")),

  consumerAlerts: (config) => unwrap(http.get("/bookings/consumer-alerts", config)),
  readConsumerAlert: (id) => unwrap(http.patch(`/bookings/consumer-alerts/${id}/read`)),
  readAllConsumerAlerts: () => unwrap(http.patch("/bookings/consumer-alerts/read-all")),
};

// ── Payments ───────────────────────────────────────────────
export const paymentsApi = {
  /** Which methods the backend can offer right now. */
  config: (config) => unwrap(http.get("/payments/config", config)),
  createOrder: (bookingId) => unwrap(http.post("/payments/order", { bookingId })),
  /** Hands Razorpay's callback fields back for server-side signature checking. */
  verify: (payload) => unwrap(http.post("/payments/verify", payload)),
  mine: (config) => unwrap(http.get("/payments/mine", config)),
};

// ── Reviews ────────────────────────────────────────────────
export const reviewsApi = {
  forProfile: (profileId, params, config) =>
    unwrap(http.get(`/reviews/profile/${profileId}`, { params, ...config })),
  create: (payload) => unwrap(http.post("/reviews", payload)),
  mine: (config) => unwrap(http.get("/reviews/mine", config)),
  reply: (id, reply) => unwrap(http.patch(`/reviews/${id}/reply`, { reply })),
};

// ── Earnings & payouts (staff) ─────────────────────────────
export const earningsApi = {
  summary: (config) => unwrap(http.get("/earnings/summary", config)),
  history: (params, config) => unwrap(http.get("/earnings/history", { params, ...config })),
  payouts: (config) => unwrap(http.get("/earnings/payouts", config)),
  requestPayout: (payload) => unwrap(http.post("/earnings/payouts", payload)),
};

// ── Admin ──────────────────────────────────────────────────
export const adminServicesApi = {
  list: (config) => unwrap(adminRoot.get("/services/admin/all", config)),
  create: (payload) => unwrap(adminRoot.post("/services/admin", payload)),
  update: (id, payload) => unwrap(adminRoot.patch(`/services/admin/${id}`, payload)),
  toggle: (id) => unwrap(adminRoot.patch(`/services/admin/${id}/toggle`)),
  remove: (id) => unwrap(adminRoot.delete(`/services/admin/${id}`)),
};

export const adminPaymentsApi = {
  list: (params, config) => unwrap(adminRoot.get("/payments/admin/list", { params, ...config })),
  refund: (bookingId, reason) =>
    unwrap(adminRoot.post(`/payments/admin/refund/${bookingId}`, { reason })),
};

export const adminPayoutsApi = {
  list: (params, config) => unwrap(adminRoot.get("/earnings/admin/payouts", { params, ...config })),
  process: (id, payload) => unwrap(adminRoot.patch(`/earnings/admin/payouts/${id}`, payload)),
};

export const adminReviewsApi = {
  list: (params, config) => unwrap(adminRoot.get("/reviews/admin/list", { params, ...config })),
  setVisibility: (id, isHidden, reason) =>
    unwrap(adminRoot.patch(`/reviews/admin/${id}/visibility`, { isHidden, reason })),
};

export { adminApi };
