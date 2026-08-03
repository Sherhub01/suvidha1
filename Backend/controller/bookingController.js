import Booking from "../models/booking.js";
import StaffProfile from "../models/staffProfile.js";
import User from "../models/user.js";
import StaffAlert from "../models/staffAlert.js";
import ConsumerAlert from "../models/consumerAlert.js";
import { sendBookingEmail } from "../config/mailer.js";

// Returns array of $or conditions covering User._id + StaffProfile._id
async function staffOrConditions(userId) {
  const sp = await StaffProfile.findOne({ user: userId }).select("_id");
  if (sp) {
    return [{ staff: userId }, { staff: sp._id }, { staffProfile: sp._id }];
  }
  return [{ staff: userId }];
}

// ── Consumer: create a booking ─────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const { staffId, service, category, description, date, time, address, price, paymentMethod } = req.body;

    let workerName = "", workerPhone = "", workerPhoto = null, staffProfile = null;
    let resolvedStaffId = staffId;

    if (staffId) {
      // staffId from frontend may be StaffProfile._id (old bug) or User._id (fixed)
      let staffUser = await User.findById(staffId).select("firstName lastName phone avatar");
      if (!staffUser) {
        // staffId is a StaffProfile._id — resolve to User
        const sp = await StaffProfile.findById(staffId).populate("user", "firstName lastName phone avatar");
        if (sp && sp.user) {
          staffUser       = sp.user;
          resolvedStaffId = sp.user._id.toString();
          staffProfile    = sp._id;
        }
      } else {
        const sp = await StaffProfile.findOne({ user: staffId });
        if (sp) staffProfile = sp._id;
      }

      if (staffUser) {
        workerName  = `${staffUser.firstName} ${staffUser.lastName}`.trim();
        workerPhone = staffUser.phone  || "";
        workerPhoto = staffUser.avatar || null;
      }
    }

    const booking = await Booking.create({
      consumer:      req.userId,
      staff:         resolvedStaffId || null,
      staffProfile,
      service, category, description, date, time, address,
      price:         price         || "",
      paymentMethod: paymentMethod || "Cash",
      workerName, workerPhone, workerPhoto,
    });

    // Notify the professional
    if (resolvedStaffId) {
      try {
        const consumer    = await User.findById(req.userId).select("firstName lastName");
        const consumerName = consumer
          ? `${consumer.firstName} ${consumer.lastName}`.trim()
          : "A customer";
        await StaffAlert.create({
          staff:   resolvedStaffId,
          booking: booking._id,
          type:    "new_booking",
          title:   `New Booking: ${service}`,
          message: `${consumerName} has booked your service for ${date} at ${time}. Address: ${address}.`,
        });
      } catch (e) { console.error("StaffAlert error:", e.message); }
    }

    // Send confirmation emails
    try {
      const consumer = await User.findById(req.userId).select("firstName lastName email");
      let sEmail = null, sName = "";
      if (resolvedStaffId) {
        const su = await User.findById(resolvedStaffId).select("firstName lastName email");
        if (su) { sEmail = su.email; sName = `${su.firstName} ${su.lastName}`.trim(); }
      }
      await sendBookingEmail({
        consumerEmail: consumer.email,
        consumerName:  `${consumer.firstName} ${consumer.lastName}`.trim(),
        staffEmail: sEmail, staffName: sName, booking,
      });
    } catch (e) { console.error("Mail error:", e.message); }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Staff: get alerts/notifications ───────────────────────
export const getStaffAlerts = async (req, res) => {
  try {
    const orConds = await staffOrConditions(req.userId);
    const alerts  = await StaffAlert.find({ $or: orConds })
      .populate({
        path:   "booking",
        select: "service category date time address price status consumer workerName workerPhone",
        populate: { path: "consumer", select: "firstName lastName phone avatar" },
      })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Staff: mark one alert read ─────────────────────────────
export const markAlertRead = async (req, res) => {
  try {
    const orConds = await staffOrConditions(req.userId);
    await StaffAlert.findOneAndUpdate(
      { _id: req.params.id, $or: orConds },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Staff: mark all alerts read ────────────────────────────
export const markAllAlertsRead = async (req, res) => {
  try {
    const orConds = await staffOrConditions(req.userId);
    await StaffAlert.updateMany({ $or: orConds, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Staff: unread count ────────────────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    const orConds = await staffOrConditions(req.userId);
    const count   = await StaffAlert.countDocuments({ $or: orConds, isRead: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, count: 0 });
  }
};

// ── Consumer: get my bookings ──────────────────────────────
export const getConsumerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ consumer: req.userId })
      .populate("staff", "firstName lastName phone avatar")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Consumer: cancel booking ───────────────────────────────
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, consumer: req.userId });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status === "Completed") return res.status(400).json({ success: false, message: "Cannot cancel completed booking" });
    booking.status = "Cancelled";
    if (booking.paymentStatus === "Paid") booking.paymentStatus = "Refunded";
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Consumer: rate booking ─────────────────────────────────
export const rateBooking = async (req, res) => {
  try {
    const { rating } = req.body;
    const booking    = await Booking.findOne({ _id: req.params.id, consumer: req.userId });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    booking.rating = rating;
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Consumer: mark complete ────────────────────────────────
export const markComplete = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, consumer: req.userId });
    if (!booking) return res.status(404).json({ success: false, message: "Not found" });
    booking.status = "Completed";
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Staff: get my assigned bookings ───────────────────────
export const getStaffBookings = async (req, res) => {
  try {
    const orConds  = await staffOrConditions(req.userId);
    const bookings = await Booking.find({ $or: orConds })
      .populate("consumer", "firstName lastName phone avatar address")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Staff: accept (confirm) booking ───────────────────────
export const acceptBooking = async (req, res) => {
  try {
    const orConds = await staffOrConditions(req.userId);
    const booking = await Booking.findOne({ _id: req.params.id, $or: orConds });
    if (!booking) return res.status(404).json({ success: false, message: "Not found" });

    booking.status = "Confirmed";
    booking.staff  = req.userId;   // normalise: always store User._id
    await booking.save();

    try {
      const staffUser = await User.findById(req.userId).select("firstName lastName");
      const staffName = staffUser
        ? `${staffUser.firstName} ${staffUser.lastName}`.trim()
        : "Your professional";
      await ConsumerAlert.create({
        consumer: booking.consumer,
        booking:  booking._id,
        type:     "booking_confirmed",
        title:    `Booking Confirmed: ${booking.service}`,
        message:  `${staffName} has confirmed your booking for ${booking.date} at ${booking.time}.`,
      });
    } catch (e) { console.error("ConsumerAlert error:", e.message); }

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Staff: complete booking ────────────────────────────────
export const completeBooking = async (req, res) => {
  try {
    const orConds = await staffOrConditions(req.userId);
    const booking = await Booking.findOne({ _id: req.params.id, $or: orConds });
    if (!booking) return res.status(404).json({ success: false, message: "Not found" });
    booking.status = "Completed";
    booking.staff  = req.userId;
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Get approved staff (consumer listing) ─────────────────
export const getApprovedStaff = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: "approved" };
    if (category) filter.category = category;
    const profiles = await StaffProfile.find(filter)
      .populate("user", "firstName lastName phone avatar location")
      .select("fullName category subCategory experience skills serviceCity photo");
    res.json({ success: true, staff: profiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Consumer: get notification alerts ─────────────────────
export const getConsumerAlerts = async (req, res) => {
  try {
    const alerts = await ConsumerAlert.find({ consumer: req.userId })
      .populate("booking", "service category date time address price status")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markConsumerAlertRead = async (req, res) => {
  try {
    await ConsumerAlert.findOneAndUpdate(
      { _id: req.params.id, consumer: req.userId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const markAllConsumerAlertsRead = async (req, res) => {
  try {
    await ConsumerAlert.updateMany({ consumer: req.userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
