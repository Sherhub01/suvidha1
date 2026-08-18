import mongoose from "mongoose";

// ────────────────────────────────────────────────────────────
// Service catalogue
//
// The admin "Services" screen used to hold a hardcoded array in React state,
// so every edit was lost on refresh. Services now live here, and booking
// pricing reads `basePrice` / `visitFee` from this collection rather than
// trusting whatever the browser sends.
// ────────────────────────────────────────────────────────────

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug may contain lowercase letters, numbers and hyphens only."],
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    icon: { type: String, default: "🔧" },

    // ── Pricing (paise are avoided; rupees with 2dp is enough for this domain)
    // `basePrice` is the professional's default when their profile has none.
    basePrice: { type: Number, required: true, min: 0 },
    // Non-refundable call-out charge added to every booking of this service.
    visitFee: { type: Number, default: 0, min: 0 },
    priceType: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
    // Guard rails: a professional cannot price outside this band.
    minPrice: { type: Number, default: 0, min: 0 },
    maxPrice: { type: Number, default: 100000, min: 0 },

    // Platform commission withheld from the professional's payout, in percent.
    commissionPercent: { type: Number, default: 15, min: 0, max: 100 },
    // GST applied to the customer-facing total, in percent.
    taxPercent: { type: Number, default: 18, min: 0, max: 100 },

    // Typical job length in minutes — used to detect overlapping bookings.
    defaultDurationMins: { type: Number, default: 60, min: 15 },

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ isActive: 1, sortOrder: 1 });
serviceSchema.index({ category: 1 });

export default mongoose.model("Service", serviceSchema);
