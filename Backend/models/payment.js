import mongoose from "mongoose";

// ────────────────────────────────────────────────────────────
// Payment
//
// Immutable-ish ledger of every money movement against a booking. The admin
// "Payments" screen previously just re-listed bookings; it now has real
// transactions to show.
//
// Amounts are stored in paise (integers) because that is what Razorpay works
// in, and it avoids floating-point drift on totals.
// ────────────────────────────────────────────────────────────

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    method: {
      type: String,
      enum: ["cash", "razorpay"],
      required: true,
    },

    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded", "partially_refunded"],
      default: "created",
      index: true,
    },

    // ── Amounts, all in paise ──────────────────────────────
    amount: { type: Number, required: true, min: 0 },
    amountRefunded: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },

    // Frozen copy of the breakdown at the moment of charge, so a later change
    // to commission or tax rates cannot rewrite history.
    breakdown: {
      servicePrice: { type: Number, default: 0 },
      visitFee: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      taxPercent: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      platformCommission: { type: Number, default: 0 },
      commissionPercent: { type: Number, default: 0 },
      staffEarning: { type: Number, default: 0 },
    },

    // ── Razorpay references ────────────────────────────────
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    failureReason: { type: String, default: null },
    capturedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },

    // Guards against a webhook and a client callback both processing the same
    // event; see paymentController.
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

/** Amount still refundable, in paise. */
paymentSchema.virtual("refundableAmount").get(function () {
  return Math.max(0, this.amount - this.amountRefunded);
});

paymentSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Payment", paymentSchema);
