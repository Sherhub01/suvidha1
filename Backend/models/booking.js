import mongoose from "mongoose";

// ────────────────────────────────────────────────────────────
// Booking
//
// Changes from the previous version:
//  - `scheduledAt` is a real Date, so sorting, reminders and "today's jobs"
//    finally work. The original `date`/`time` strings are kept alongside it
//    for display and for rows written before this migration.
//  - Pricing is a server-computed breakdown in paise. The client no longer
//    sends a price string.
//  - `status` transitions are validated against an explicit state machine.
// ────────────────────────────────────────────────────────────

export const BOOKING_STATUS = {
  PENDING: "Pending",       // awaiting payment (online) — not yet visible to staff
  SCHEDULED: "Scheduled",   // placed, awaiting professional's confirmation
  CONFIRMED: "Confirmed",   // professional accepted
  IN_PROGRESS: "InProgress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",     // professional declined
};

/** Allowed next states. Anything not listed is refused. */
export const STATUS_TRANSITIONS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.SCHEDULED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.SCHEDULED]: [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.REJECTED,
    BOOKING_STATUS.CANCELLED,
  ],
  [BOOKING_STATUS.CONFIRMED]: [
    BOOKING_STATUS.IN_PROGRESS,
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.CANCELLED,
  ],
  [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
  [BOOKING_STATUS.REJECTED]: [],
};

export const canTransition = (from, to) => (STATUS_TRANSITIONS[from] || []).includes(to);

/** Statuses that still occupy the professional's calendar slot. */
export const ACTIVE_STATUSES = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.SCHEDULED,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.IN_PROGRESS,
];

const bookingSchema = new mongoose.Schema(
  {
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    staffProfile: { type: mongoose.Schema.Types.ObjectId, ref: "StaffProfile", default: null },
    serviceRef: { type: mongoose.Schema.Types.ObjectId, ref: "Service", default: null },

    service: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "", maxlength: 2000 },

    // ── Scheduling ─────────────────────────────────────────
    scheduledAt: { type: Date, required: true, index: true },
    durationMins: { type: Number, default: 60, min: 15 },
    // Display copies of what the customer picked, in their own words.
    date: { type: String, required: true },
    time: { type: String, required: true },

    address: { type: String, required: true, maxlength: 500 },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },

    // ── Pricing, all in paise, computed server-side ────────
    pricing: {
      servicePrice: { type: Number, required: true, min: 0 },
      visitFee: { type: Number, default: 0, min: 0 },
      subtotal: { type: Number, required: true, min: 0 },
      taxPercent: { type: Number, default: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
      commissionPercent: { type: Number, default: 0 },
      platformCommission: { type: Number, default: 0, min: 0 },
      staffEarning: { type: Number, default: 0, min: 0 },
      priceType: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
      quantity: { type: Number, default: 1, min: 1 },
    },

    paymentMethod: { type: String, enum: ["cash", "razorpay"], default: "cash" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Failed"],
      default: "Pending",
      index: true,
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.SCHEDULED,
      index: true,
    },
    statusHistory: [
      {
        from: String,
        to: String,
        by: String, // "consumer" | "staff" | "admin" | "system"
        reason: String,
        at: { type: Date, default: Date.now },
      },
    ],

    cancelledBy: { type: String, enum: ["consumer", "staff", "admin", "system", null], default: null },
    cancellationReason: { type: String, default: null },

    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review", default: null },

    // Denormalised for fast list rendering.
    workerName: { type: String, default: "" },
    workerPhone: { type: String, default: "" },
    workerPhoto: { type: String, default: null },

    confirmedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ staff: 1, scheduledAt: 1, status: 1 });
bookingSchema.index({ consumer: 1, createdAt: -1 });
bookingSchema.index({ location: "2dsphere" });

/** End of the booked window. */
bookingSchema.virtual("endsAt").get(function () {
  if (!this.scheduledAt) return null;
  return new Date(this.scheduledAt.getTime() + (this.durationMins || 60) * 60000);
});

/**
 * Applies a status change, recording who did it and stamping the matching
 * timestamp. Returns false when the transition is not allowed.
 */
bookingSchema.methods.applyStatus = function (next, by = "system", reason = null) {
  if (this.status === next) return true;
  if (!canTransition(this.status, next)) return false;

  this.statusHistory.push({ from: this.status, to: next, by, reason, at: new Date() });
  this.status = next;

  const now = new Date();
  if (next === BOOKING_STATUS.CONFIRMED) this.confirmedAt = now;
  if (next === BOOKING_STATUS.IN_PROGRESS) this.startedAt = now;
  if (next === BOOKING_STATUS.COMPLETED) this.completedAt = now;
  if (next === BOOKING_STATUS.CANCELLED || next === BOOKING_STATUS.REJECTED) {
    this.cancelledAt = now;
    this.cancelledBy = by;
    this.cancellationReason = reason;
  }

  return true;
};

bookingSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Booking", bookingSchema);
