// ────────────────────────────────────────────────────────────
// Pricing engine
//
// The only place a booking total is calculated. The client previously sent a
// price string like "₹199/hr", which meant a customer could book anything for
// zero by editing the request.
//
// Everything is in paise (integers) to avoid floating-point drift, and to match
// what Razorpay expects.
// ────────────────────────────────────────────────────────────

export const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);
export const toRupees = (paise) => Math.round(Number(paise || 0)) / 100;

/** "₹1,234.50" */
export const formatPaise = (paise) =>
  `₹${toRupees(paise).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Computes a full booking breakdown.
 *
 * The unit price comes from the professional's profile when they have set one,
 * otherwise the service's base price. It is then clamped to the service's
 * min/max band so a professional cannot list an absurd figure.
 *
 * @param {object} service       Service document (rates in rupees)
 * @param {object} staffProfile  StaffProfile document (price in rupees)
 * @param {number} quantity      Hours for hourly services; 1 for fixed
 * @returns {object} breakdown in paise
 */
export function calculateBookingPrice({ service, staffProfile, quantity = 1 }) {
  if (!service) throw new Error("A service is required to price a booking.");

  const priceType = staffProfile?.priceType || service.priceType || "fixed";

  // Hourly jobs bill per hour; fixed-price jobs ignore quantity.
  const units = priceType === "hourly" ? Math.max(1, Math.min(24, Math.floor(Number(quantity) || 1))) : 1;

  const profileRate = Number(staffProfile?.price) > 0 ? Number(staffProfile.price) : null;
  const rawRate = profileRate ?? Number(service.basePrice) ?? 0;

  // Keep the professional's rate inside the service's allowed band.
  const minRate = Number(service.minPrice) || 0;
  const maxRate = Number(service.maxPrice) || Number.MAX_SAFE_INTEGER;
  const rate = Math.min(Math.max(rawRate, minRate), maxRate);

  const servicePrice = toPaise(rate) * units;
  const visitFee = toPaise(service.visitFee || 0);
  const subtotal = servicePrice + visitFee;

  const taxPercent = Number(service.taxPercent) || 0;
  const tax = Math.round((subtotal * taxPercent) / 100);
  const total = subtotal + tax;

  // Commission is taken on the service work only — not on tax, and not on the
  // visit fee, which covers the professional's travel.
  const commissionPercent = Number(service.commissionPercent) || 0;
  const platformCommission = Math.round((servicePrice * commissionPercent) / 100);
  const staffEarning = servicePrice + visitFee - platformCommission;

  return {
    servicePrice,
    visitFee,
    subtotal,
    taxPercent,
    tax,
    total,
    commissionPercent,
    platformCommission,
    staffEarning,
    priceType,
    quantity: units,
  };
}

/**
 * Cancellation refund policy.
 *
 * Free cancellation up to 12 hours before the slot. Inside that window the
 * visit fee is retained to compensate the professional's blocked time. Once the
 * job has started nothing is refunded.
 */
export const FREE_CANCELLATION_HOURS = 12;

export function calculateRefund({ booking, now = new Date() }) {
  const paid = booking?.pricing?.total || 0;
  if (paid <= 0) return { refundable: 0, retained: 0, reason: "Nothing was charged." };

  if (booking.startedAt || booking.completedAt) {
    return { refundable: 0, retained: paid, reason: "Work has already started." };
  }

  const scheduled = booking.scheduledAt ? new Date(booking.scheduledAt) : null;
  const hoursUntil = scheduled ? (scheduled.getTime() - now.getTime()) / 3600000 : Infinity;

  if (hoursUntil >= FREE_CANCELLATION_HOURS) {
    return { refundable: paid, retained: 0, reason: "Cancelled outside the notice window." };
  }

  const retained = Math.min(paid, booking?.pricing?.visitFee || 0);
  return {
    refundable: paid - retained,
    retained,
    reason: `Cancelled within ${FREE_CANCELLATION_HOURS} hours; the visit fee is retained.`,
  };
}

/** Shape sent to the browser — rupees for display, paise for arithmetic. */
export const publicBreakdown = (pricing = {}) => ({
  servicePrice: toRupees(pricing.servicePrice),
  visitFee: toRupees(pricing.visitFee),
  subtotal: toRupees(pricing.subtotal),
  taxPercent: pricing.taxPercent || 0,
  tax: toRupees(pricing.tax),
  total: toRupees(pricing.total),
  priceType: pricing.priceType || "fixed",
  quantity: pricing.quantity || 1,
  totalPaise: pricing.total || 0,
  formattedTotal: formatPaise(pricing.total),
});
