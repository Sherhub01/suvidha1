import Booking from "../models/booking.js";
import StaffProfile from "../models/staffProfile.js";
import User from "../models/user.js";
import { sendBookingEmail } from "../config/mailer.js"

// ── Consumer: create a booking ─────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const { staffId, service, category, description, date, time, address, price, paymentMethod } = req.body;

    let workerName = "", workerPhone = "", workerPhoto = null, staffProfile = null;

    if (staffId) {
      const staffUser = await User.findById(staffId).select("firstName lastName phone avatar");
      if (staffUser) {
        workerName  = `${staffUser.firstName} ${staffUser.lastName}`.trim();
        workerPhone = staffUser.phone || "";
        workerPhoto = staffUser.avatar || null;
      }
      const sp = await StaffProfile.findOne({ user: staffId });
      if (sp) staffProfile = sp._id;
    }

    const booking = await Booking.create({
      consumer: req.userId, staff: staffId || null, staffProfile,
      service, category, description, date, time, address,
      price: price || "", paymentMethod: paymentMethod || "Cash",
      workerName, workerPhone, workerPhoto,
    });

    // Send booking confirmation emails
    try {
      const consumer = await User.findById(req.userId).select("firstName lastName email");
      let sEmail = null, sName = "";
      if (staffId) {
        const su = await User.findById(staffId).select("firstName lastName email");
        if (su) { sEmail = su.email; sName = `${su.firstName} ${su.lastName}`.trim(); }
      }
      await sendBookingEmail({
        consumerEmail: consumer.email,
        consumerName:  `${consumer.firstName} ${consumer.lastName}`.trim(),
        staffEmail:    sEmail,
        staffName:     sName,
        booking,
      });
    } catch (mailErr) {
      console.error("Mail error (booking):", mailErr.message);
    }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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

// ── Consumer: cancel booking ──────────────────────────────
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

// ── Consumer: mark completed + rate ───────────────────────
export const rateBooking = async (req, res) => {
  try {
    const { rating } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, consumer: req.userId });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    booking.rating = rating;
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
    const bookings = await Booking.find({ staff: req.userId })
      .populate("consumer", "firstName lastName phone avatar address")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Staff: accept (confirm) a booking ─────────────────────
export const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, staff: req.userId });
    if (!booking) return res.status(404).json({ success: false, message: "Not found" });
    booking.status = "Confirmed";
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Staff: complete a booking ──────────────────────────────
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, staff: req.userId });
    if (!booking) return res.status(404).json({ success: false, message: "Not found" });
    booking.status = "Completed";
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Consumer: mark booking as complete ───────────────────
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

// ── Get all approved staff (for consumer to book) ─────────
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
