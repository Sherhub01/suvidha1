import Review from "../models/review.js";
import Booking, { BOOKING_STATUS } from "../models/booking.js";
import StaffProfile from "../models/staffProfile.js";
import StaffAlert from "../models/staffAlert.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// ────────────────────────────────────────────────────────────
// Consumer: leave a review
//
// Replaces PATCH /bookings/:id/rate, which accepted any number, did not check
// the booking was finished, and never updated the professional's rating.
// ────────────────────────────────────────────────────────────

export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, punctuality, quality, behaviour } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, consumer: req.userId });
    if (!booking) return fail(res, 404, "Booking not found");

    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return fail(res, 409, "You can review a job once it has been completed.");
    }
    if (!booking.staffProfile) {
      return fail(res, 409, "This booking has no professional attached.");
    }

    const existing = await Review.findOne({ booking: booking._id });
    if (existing) return fail(res, 409, "You have already reviewed this booking.");

    const review = await Review.create({
      booking: booking._id,
      consumer: req.userId,
      staff: booking.staff,
      staffProfile: booking.staffProfile,
      rating,
      comment,
      punctuality,
      quality,
      behaviour,
    });

    booking.review = review._id;
    await booking.save();

    // Recompute the cached average on the professional's profile.
    const totals = await Review.syncProfileRating(booking.staffProfile);

    await StaffAlert.create({
      staff: booking.staff,
      booking: booking._id,
      type: "general",
      title: `New ${rating}-star review`,
      message: comment
        ? `"${comment.slice(0, 140)}"`
        : `A customer rated your ${booking.service} job ${rating} out of 5.`,
    }).catch((e) => console.error("StaffAlert error:", e.message));

    res.status(201).json({ success: true, review, profileRating: totals });
  } catch (err) {
    if (err.code === 11000) return fail(res, 409, "You have already reviewed this booking.");
    console.error("createReview error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Public: reviews for a professional
// ────────────────────────────────────────────────────────────

export const getProfileReviews = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { page = 1, limit = 10 } = req.validatedQuery || req.query;

    const filter = { staffProfile: profileId, isHidden: false };

    const [reviews, total, distribution] = await Promise.all([
      Review.find(filter)
        .populate("consumer", "firstName lastName avatar")
        .select("-staff -booking")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { ...filter, staffProfile: new (await import("mongoose")).default.Types.ObjectId(String(profileId)) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    // Only the reviewer's first name is shown publicly.
    const publicReviews = reviews.map((r) => ({
      ...r,
      consumer: {
        firstName: r.consumer?.firstName || "Customer",
        avatar: r.consumer?.avatar || null,
      },
    }));

    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: distribution.find((d) => d._id === star)?.count || 0,
    }));

    const profile = await StaffProfile.findById(profileId).select("rating reviewsCount").lean();

    res.json({
      success: true,
      reviews: publicReviews,
      total,
      breakdown,
      average: profile?.rating || 0,
    });
  } catch (err) {
    console.error("getProfileReviews error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Staff: read own reviews, reply to one
// ────────────────────────────────────────────────────────────

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ staff: req.userId })
      .populate("consumer", "firstName avatar")
      .populate("booking", "service scheduledAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, reviews });
  } catch (err) {
    console.error("getMyReviews error:", err);
    fail(res, 500, "Server error");
  }
};

export const replyToReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, staff: req.userId });
    if (!review) return fail(res, 404, "Review not found");
    if (review.reply) return fail(res, 409, "You have already replied to this review.");

    review.reply = req.body.reply;
    review.repliedAt = new Date();
    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    console.error("replyToReview error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Admin: moderation
// ────────────────────────────────────────────────────────────

export const adminListReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.validatedQuery || req.query;

    const [reviews, total] = await Promise.all([
      Review.find()
        .populate("consumer", "firstName lastName email")
        .populate("staff", "firstName lastName")
        .populate("booking", "service scheduledAt")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(),
    ]);

    res.json({ success: true, reviews, total });
  } catch (err) {
    console.error("adminListReviews error:", err);
    fail(res, 500, "Server error");
  }
};

export const adminSetReviewVisibility = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return fail(res, 404, "Review not found");

    review.isHidden = Boolean(req.body.isHidden);
    review.hiddenReason = review.isHidden ? req.body.reason || "Hidden by admin" : null;
    await review.save();

    // A hidden review drops out of the professional's average.
    const totals = await Review.syncProfileRating(review.staffProfile);

    res.json({ success: true, review, profileRating: totals });
  } catch (err) {
    console.error("adminSetReviewVisibility error:", err);
    fail(res, 500, "Server error");
  }
};
