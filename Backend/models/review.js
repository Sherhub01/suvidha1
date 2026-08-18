import mongoose from "mongoose";

// ────────────────────────────────────────────────────────────
// Review
//
// Replaces the SAMPLE_REVIEWS array that showed the same three fake testimonials
// on every professional's page. A review can only be written against a booking
// the reviewer owns and that has been completed, which is enforced both by the
// controller and by the unique index below.
// ────────────────────────────────────────────────────────────

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffProfile: { type: mongoose.Schema.Types.ObjectId, ref: "StaffProfile", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },

    // Optional per-aspect scores shown on the professional's profile.
    punctuality: { type: Number, min: 1, max: 5, default: null },
    quality: { type: Number, min: 1, max: 5, default: null },
    behaviour: { type: Number, min: 1, max: 5, default: null },

    // The professional may post one public reply.
    reply: { type: String, trim: true, maxlength: 1000, default: "" },
    repliedAt: { type: Date, default: null },

    // Moderation: hidden reviews stay in the aggregate but are not displayed.
    isHidden: { type: Boolean, default: false },
    hiddenReason: { type: String, default: null },
  },
  { timestamps: true }
);

// One review per booking.
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ staffProfile: 1, createdAt: -1 });
reviewSchema.index({ consumer: 1, createdAt: -1 });

/**
 * Recomputes the cached rating on a professional's profile.
 *
 * The old rate endpoint wrote a number onto the booking and stopped there, so
 * every profile showed 0 stars forever. Called after any review write.
 */
reviewSchema.statics.syncProfileRating = async function (staffProfileId) {
  const [agg] = await this.aggregate([
    { $match: { staffProfile: new mongoose.Types.ObjectId(String(staffProfileId)), isHidden: false } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const rating = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const reviewsCount = agg ? agg.count : 0;

  await mongoose.model("StaffProfile").findByIdAndUpdate(staffProfileId, { rating, reviewsCount });

  return { rating, reviewsCount };
};

export default mongoose.model("Review", reviewSchema);
