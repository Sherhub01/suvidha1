import mongoose from "mongoose";

import Booking, { BOOKING_STATUS, ACTIVE_STATUSES } from "../models/booking.js";
import Service from "../models/service.js";
import StaffProfile from "../models/staffProfile.js";
import User from "../models/user.js";
import StaffAlert from "../models/staffAlert.js";
import ConsumerAlert from "../models/consumerAlert.js";
import Payment from "../models/payment.js";
import Review from "../models/review.js";

import { sendBookingEmail } from "../config/mailer.js";
import { calculateBookingPrice, publicBreakdown, calculateRefund, formatPaise } from "../utils/pricing.js";
import { parseScheduledAt, validateSlot, formatSlot } from "../utils/schedule.js";
import { isRazorpayConfigured } from "../config/razorpay.js";

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const fail = (res, status, message) => res.status(status).json({ success: false, message });

/** Bookings may reference a professional by User id or StaffProfile id. */
async function staffOrConditions(userId) {
  const profile = await StaffProfile.findOne({ user: userId }).select("_id").lean();
  return profile
    ? [{ staff: userId }, { staff: profile._id }, { staffProfile: profile._id }]
    : [{ staff: userId }];
}

/** Shape sent to the browser. Internal paise stay out of the response. */
const publicBooking = (booking) => {
  const b = booking.toObject ? booking.toObject({ virtuals: true }) : booking;
  return {
    ...b,
    pricing: publicBreakdown(b.pricing || {}),
    priceLabel: formatPaise(b.pricing?.total || 0),
    slotLabel: formatSlot(b.scheduledAt),
    statusHistory: undefined,
  };
};

/**
 * Rejects a slot that clashes with something the professional already has.
 *
 * @returns {string|null} an error message when the slot is taken
 */
async function findConflict({ staffId, staffProfileId, scheduledAt, durationMins, excludeId }) {
  const endsAt = new Date(scheduledAt.getTime() + durationMins * 60000);

  // Widen the window enough to catch any existing job that could still be
  // running when this one starts.
  const windowStart = new Date(scheduledAt.getTime() - 12 * 3600000);

  const staffMatch = [{ staff: staffId }];
  if (staffProfileId) staffMatch.push({ staffProfile: staffProfileId });

  const query = {
    $or: staffMatch,
    status: { $in: ACTIVE_STATUSES },
    scheduledAt: { $gte: windowStart, $lt: endsAt },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const candidates = await Booking.find(query).select("scheduledAt durationMins").lean();

  const clash = candidates.find((c) => {
    const cEnd = new Date(new Date(c.scheduledAt).getTime() + (c.durationMins || 60) * 60000);
    return new Date(c.scheduledAt) < endsAt && scheduledAt < cEnd;
  });

  return clash
    ? `This professional is already booked around ${formatSlot(clash.scheduledAt)}. Please choose another slot.`
    : null;
}

// ────────────────────────────────────────────────────────────
// Quote — price a booking before it is placed
// ────────────────────────────────────────────────────────────

export const getQuote = async (req, res) => {
  try {
    const { staffId, serviceSlug, quantity } = req.body;

    const service = await Service.findOne({ slug: serviceSlug, isActive: true }).lean();
    if (!service) return fail(res, 404, "That service is not available.");

    const profile = await StaffProfile.findOne({
      $or: [{ user: staffId }, { _id: mongoose.isValidObjectId(staffId) ? staffId : null }],
      status: "approved",
    }).lean();

    if (!profile) return fail(res, 404, "That professional is not available.");

    const pricing = calculateBookingPrice({ service, staffProfile: profile, quantity });

    res.json({
      success: true,
      quote: publicBreakdown(pricing),
      service: { slug: service.slug, name: service.name, durationMins: service.defaultDurationMins },
      onlinePaymentAvailable: isRazorpayConfigured(),
    });
  } catch (err) {
    console.error("getQuote error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Consumer: create a booking
// ────────────────────────────────────────────────────────────

export const createBooking = async (req, res) => {
  try {
    const {
      staffId, serviceSlug, date, time, address,
      description, quantity, paymentMethod, coordinates,
    } = req.body;

    // ── Service ──
    const service = await Service.findOne({ slug: serviceSlug, isActive: true });
    if (!service) return fail(res, 404, "That service is not available.");

    // ── Professional ──
    let staffUser = await User.findById(staffId).select("firstName lastName phone avatar email role");
    let profile = null;

    if (staffUser?.role === "staff") {
      profile = await StaffProfile.findOne({ user: staffUser._id, status: "approved" });
    } else {
      // The id may be a StaffProfile id from an older client build.
      profile = await StaffProfile.findOne({ _id: staffId, status: "approved" }).populate(
        "user",
        "firstName lastName phone avatar email role"
      );
      staffUser = profile?.user || null;
    }

    if (!profile || !staffUser) {
      return fail(res, 404, "That professional is not available for booking.");
    }

    // ── Slot ──
    const scheduledAt = parseScheduledAt(date, time);
    const slotError = validateSlot(scheduledAt);
    if (slotError) return fail(res, 400, slotError);

    const durationMins = service.defaultDurationMins || 60;

    const conflict = await findConflict({
      staffId: staffUser._id,
      staffProfileId: profile._id,
      scheduledAt,
      durationMins,
    });
    if (conflict) return fail(res, 409, conflict);

    // ── Price: computed here, never taken from the request ──
    const pricing = calculateBookingPrice({ service, staffProfile: profile, quantity });

    const wantsOnline = paymentMethod === "razorpay";
    if (wantsOnline && !isRazorpayConfigured()) {
      return fail(res, 400, "Online payment is unavailable right now. Please choose cash on service.");
    }

    // Online bookings stay Pending until payment lands, so an unpaid slot never
    // reaches the professional's queue.
    const status = wantsOnline ? BOOKING_STATUS.PENDING : BOOKING_STATUS.SCHEDULED;

    const booking = await Booking.create({
      consumer: req.userId,
      staff: staffUser._id,
      staffProfile: profile._id,
      serviceRef: service._id,
      service: service.name,
      category: service.category,
      description,
      scheduledAt,
      durationMins,
      date,
      time,
      address,
      location: coordinates
        ? { type: "Point", coordinates: [coordinates.lng, coordinates.lat] }
        : undefined,
      pricing,
      paymentMethod: wantsOnline ? "razorpay" : "cash",
      status,
      statusHistory: [{ from: null, to: status, by: "consumer", at: new Date() }],
      workerName: `${staffUser.firstName} ${staffUser.lastName}`.trim(),
      workerPhone: staffUser.phone || "",
      workerPhoto: staffUser.avatar || profile.photo || null,
    });

    // A pending booking is not announced until it is paid for.
    if (status === BOOKING_STATUS.SCHEDULED) {
      await notifyNewBooking({ booking, staffUser, consumerId: req.userId });
    }

    res.status(201).json({
      success: true,
      booking: publicBooking(booking),
      requiresPayment: wantsOnline,
    });
  } catch (err) {
    console.error("createBooking error:", err);
    fail(res, 500, "Server error");
  }
};

/** Alert + email the professional about a newly placed booking. */
export async function notifyNewBooking({ booking, staffUser, consumerId }) {
  try {
    const consumer = await User.findById(consumerId).select("firstName lastName email");
    const consumerName = consumer
      ? `${consumer.firstName} ${consumer.lastName}`.trim()
      : "A customer";

    await StaffAlert.create({
      staff: booking.staff,
      booking: booking._id,
      type: "new_booking",
      title: `New Booking: ${booking.service}`,
      message: `${consumerName} booked you for ${formatSlot(booking.scheduledAt)} — ${formatPaise(
        booking.pricing.total
      )}. Address: ${booking.address}.`,
    });

    await sendBookingEmail({
      consumerEmail: consumer?.email,
      consumerName,
      staffEmail: staffUser?.email || null,
      staffName: booking.workerName,
      booking,
    });
  } catch (err) {
    console.error("notifyNewBooking error:", err.message);
  }
}

// ────────────────────────────────────────────────────────────
// Consumer: read
// ────────────────────────────────────────────────────────────

export const getConsumerBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.validatedQuery || req.query;

    const filter = { consumer: req.userId };
    if (status) filter.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("staff", "firstName lastName phone avatar")
        .populate("review", "rating comment")
        .sort({ scheduledAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({ success: true, bookings: bookings.map(publicBooking), total });
  } catch (err) {
    console.error("getConsumerBookings error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Consumer: cancel
// ────────────────────────────────────────────────────────────

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, consumer: req.userId });
    if (!booking) return fail(res, 404, "Booking not found");

    if (!booking.applyStatus(BOOKING_STATUS.CANCELLED, "consumer", req.body.reason)) {
      return fail(res, 409, `A ${booking.status.toLowerCase()} booking cannot be cancelled.`);
    }

    const refund = calculateRefund({ booking });

    if (booking.paymentStatus === "Paid" && refund.refundable > 0) {
      // Marked for refund here; the money movement is handled by
      // paymentController.refundBooking so all Razorpay calls stay in one place.
      booking.paymentStatus = "Refunded";
    }

    await booking.save();

    await ConsumerAlert.create({
      consumer: booking.consumer,
      booking: booking._id,
      type: "booking_cancelled",
      title: `Booking cancelled: ${booking.service}`,
      message:
        refund.refundable > 0
          ? `Your booking was cancelled. ${formatPaise(refund.refundable)} will be refunded. ${refund.reason}`
          : `Your booking was cancelled. ${refund.reason}`,
    }).catch((e) => console.error("ConsumerAlert error:", e.message));

    await StaffAlert.create({
      staff: booking.staff,
      booking: booking._id,
      type: "booking_cancelled",
      title: `Booking cancelled: ${booking.service}`,
      message: `The customer cancelled the ${formatSlot(booking.scheduledAt)} job.`,
    }).catch((e) => console.error("StaffAlert error:", e.message));

    res.json({
      success: true,
      booking: publicBooking(booking),
      refund: {
        amount: refund.refundable / 100,
        retained: refund.retained / 100,
        reason: refund.reason,
      },
    });
  } catch (err) {
    console.error("cancelBooking error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Staff: read + act
// ────────────────────────────────────────────────────────────

export const getStaffBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.validatedQuery || req.query;

    const filter = { $or: await staffOrConditions(req.userId) };
    if (status) filter.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("consumer", "firstName lastName phone avatar address")
        .sort({ scheduledAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({ success: true, bookings: bookings.map(publicBooking), total });
  } catch (err) {
    console.error("getStaffBookings error:", err);
    fail(res, 500, "Server error");
  }
};

/** Shared handler for the staff-side status transitions. */
const staffTransition = (next, buildAlert) => async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: await staffOrConditions(req.userId),
    });
    if (!booking) return fail(res, 404, "Booking not found");

    if (!booking.applyStatus(next, "staff", req.body?.reason)) {
      return fail(
        res,
        409,
        `A ${booking.status.toLowerCase()} booking cannot be moved to ${next.toLowerCase()}.`
      );
    }

    // Normalise: always store the User id once the professional has acted.
    booking.staff = req.userId;
    await booking.save();

    const alert = buildAlert(booking);
    if (alert) {
      await ConsumerAlert.create({
        consumer: booking.consumer,
        booking: booking._id,
        ...alert,
      }).catch((e) => console.error("ConsumerAlert error:", e.message));
    }

    res.json({ success: true, booking: publicBooking(booking) });
  } catch (err) {
    console.error(`staffTransition(${next}) error:`, err);
    fail(res, 500, "Server error");
  }
};

export const acceptBooking = staffTransition(BOOKING_STATUS.CONFIRMED, (b) => ({
  type: "booking_confirmed",
  title: `Booking confirmed: ${b.service}`,
  message: `${b.workerName} confirmed your booking for ${formatSlot(b.scheduledAt)}.`,
}));

export const startBooking = staffTransition(BOOKING_STATUS.IN_PROGRESS, (b) => ({
  type: "general",
  title: `Work started: ${b.service}`,
  message: `${b.workerName} has started your job.`,
}));

export const rejectBooking = staffTransition(BOOKING_STATUS.REJECTED, (b) => ({
  type: "booking_cancelled",
  title: `Booking declined: ${b.service}`,
  message: `${b.workerName} is unable to take this job. Any amount paid will be refunded.`,
}));

/**
 * Completion is staff-only. Consumers used to be able to mark a booking
 * complete themselves, which skipped the professional entirely.
 */
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: await staffOrConditions(req.userId),
    });
    if (!booking) return fail(res, 404, "Booking not found");

    if (!booking.applyStatus(BOOKING_STATUS.COMPLETED, "staff")) {
      return fail(res, 409, `A ${booking.status.toLowerCase()} booking cannot be completed.`);
    }

    // Cash is collected in person, so completion is when it is settled.
    if (booking.paymentMethod === "cash" && booking.paymentStatus === "Pending") {
      booking.paymentStatus = "Paid";

      await Payment.create({
        booking: booking._id,
        consumer: booking.consumer,
        staff: booking.staff,
        method: "cash",
        status: "captured",
        amount: booking.pricing.total,
        breakdown: booking.pricing,
        capturedAt: new Date(),
        idempotencyKey: `cash_${booking._id}`,
      }).catch((e) => console.error("Cash payment record error:", e.message));
    }

    booking.staff = req.userId;
    await booking.save();

    await ConsumerAlert.create({
      consumer: booking.consumer,
      booking: booking._id,
      type: "booking_completed",
      title: `Job completed: ${booking.service}`,
      message: `${booking.workerName} marked your job complete. Please leave a review.`,
    }).catch((e) => console.error("ConsumerAlert error:", e.message));

    res.json({ success: true, booking: publicBooking(booking) });
  } catch (err) {
    console.error("completeBooking error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Alerts
// ────────────────────────────────────────────────────────────

export const getStaffAlerts = async (req, res) => {
  try {
    const alerts = await StaffAlert.find({ $or: await staffOrConditions(req.userId) })
      .populate({
        path: "booking",
        select: "service category scheduledAt date time address pricing status consumer workerName",
        populate: { path: "consumer", select: "firstName lastName phone avatar" },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, alerts });
  } catch (err) {
    console.error("getStaffAlerts error:", err);
    fail(res, 500, "Server error");
  }
};

export const markAlertRead = async (req, res) => {
  try {
    await StaffAlert.findOneAndUpdate(
      { _id: req.params.id, $or: await staffOrConditions(req.userId) },
      { isRead: true }
    );
    res.json({ success: true });
  } catch {
    fail(res, 500, "Server error");
  }
};

export const markAllAlertsRead = async (req, res) => {
  try {
    await StaffAlert.updateMany(
      { $or: await staffOrConditions(req.userId), isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch {
    fail(res, 500, "Server error");
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await StaffAlert.countDocuments({
      $or: await staffOrConditions(req.userId),
      isRead: false,
    });
    res.json({ success: true, count });
  } catch {
    res.json({ success: true, count: 0 });
  }
};

export const getConsumerAlerts = async (req, res) => {
  try {
    const alerts = await ConsumerAlert.find({ consumer: req.userId })
      .populate("booking", "service category scheduledAt date time address pricing status")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, alerts });
  } catch (err) {
    console.error("getConsumerAlerts error:", err);
    fail(res, 500, "Server error");
  }
};

export const markConsumerAlertRead = async (req, res) => {
  try {
    await ConsumerAlert.findOneAndUpdate(
      { _id: req.params.id, consumer: req.userId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch {
    fail(res, 500, "Server error");
  }
};

export const markAllConsumerAlertsRead = async (req, res) => {
  try {
    await ConsumerAlert.updateMany({ consumer: req.userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch {
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Approved professionals (consumer listing)
// ────────────────────────────────────────────────────────────

export const getApprovedStaff = async (req, res) => {
  try {
    const { category, city } = req.query;

    const filter = { status: "approved" };
    if (category) filter.category = category;
    if (city) filter.serviceCity = new RegExp(`^${String(city).slice(0, 60)}$`, "i");

    const profiles = await StaffProfile.find(filter)
      .populate("user", "firstName lastName phone avatar location")
      .select(
        "fullName category subCategory experience skills serviceCity city photo " +
        "price priceType rating reviewsCount location status"
      )
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(200);

    res.json({ success: true, profiles, staff: profiles });
  } catch (err) {
    console.error("getApprovedStaff error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Availability — free slots for a professional on a given day
// ────────────────────────────────────────────────────────────

export const getAvailability = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { date } = req.query;

    if (!date) return fail(res, 400, "A date is required.");

    const dayStart = parseScheduledAt(date, "00:00");
    if (!dayStart) return fail(res, 400, "Invalid date.");
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600000);

    const profile = await StaffProfile.findOne({
      $or: [{ user: staffId }, { _id: mongoose.isValidObjectId(staffId) ? staffId : null }],
    })
      .select("_id user")
      .lean();

    const staffMatch = [{ staff: profile?.user || staffId }];
    if (profile?._id) staffMatch.push({ staffProfile: profile._id });

    const booked = await Booking.find({
      $or: staffMatch,
      status: { $in: ACTIVE_STATUSES },
      scheduledAt: { $gte: dayStart, $lt: dayEnd },
    })
      .select("scheduledAt durationMins")
      .lean();

    // Working day: 08:00–20:00 IST in one-hour slots.
    const slots = [];
    const now = new Date();

    for (let hour = 8; hour < 20; hour += 1) {
      const slotStart = new Date(dayStart.getTime() + hour * 3600000);
      const slotEnd = new Date(slotStart.getTime() + 3600000);

      const taken = booked.some((b) => {
        const bStart = new Date(b.scheduledAt);
        const bEnd = new Date(bStart.getTime() + (b.durationMins || 60) * 60000);
        return bStart < slotEnd && slotStart < bEnd;
      });

      slots.push({
        time: `${String(hour).padStart(2, "0")}:00`,
        iso: slotStart.toISOString(),
        available: !taken && slotStart > now,
      });
    }

    res.json({ success: true, date, slots });
  } catch (err) {
    console.error("getAvailability error:", err);
    fail(res, 500, "Server error");
  }
};

// Kept so existing imports do not break; consumers can no longer self-complete.
export const markComplete = (req, res) =>
  fail(res, 403, "Only the professional can mark a job complete.");

export const rateBooking = (req, res) =>
  fail(res, 410, "Ratings have moved to POST /api/reviews.");

export { Review };
