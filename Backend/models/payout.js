import mongoose from "mongoose";

// ────────────────────────────────────────────────────────────
// Payout
//
// Withdrawal requests raised by professionals. The staff Earnings screen used
// to show a hardcoded withdrawal history; this is the real thing.
//
// Amounts are in paise, matching the Payment ledger.
// ────────────────────────────────────────────────────────────

export const MIN_PAYOUT_PAISE = 50000; // ₹500

const payoutSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    staffProfile: { type: mongoose.Schema.Types.ObjectId, ref: "StaffProfile", required: true },

    amount: { type: Number, required: true, min: MIN_PAYOUT_PAISE },

    status: {
      type: String,
      enum: ["requested", "approved", "processing", "paid", "rejected"],
      default: "requested",
      index: true,
    },

    method: { type: String, enum: ["bank", "upi"], required: true },

    // Destination is snapshotted at request time — a later profile edit must
    // not silently redirect a pending payout.
    destination: {
      accountHolder: { type: String, default: "" },
      // Only the last four digits are retained.
      accountLast4: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
      upiId: { type: String, default: "" },
    },

    reference: { type: String, default: null },
    note: { type: String, default: null },
    rejectionReason: { type: String, default: null },

    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

payoutSchema.index({ staff: 1, createdAt: -1 });

/** Sum of payouts that are not rejected — i.e. money already claimed. */
payoutSchema.statics.claimedTotal = async function (staffId) {
  const [agg] = await this.aggregate([
    {
      $match: {
        staff: new mongoose.Types.ObjectId(String(staffId)),
        status: { $ne: "rejected" },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return agg?.total || 0;
};

export default mongoose.model("Payout", payoutSchema);
