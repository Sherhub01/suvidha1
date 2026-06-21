import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";
import User from "../models/user.js";
import StaffProfile from "../models/staffProfile.js";
import Booking from "../models/booking.js";
import Notification from "../models/notification.js";
import { sendOtpEmail } from "../config/mailer.js";
import { generateOTP } from "../utils/otpGenerator.js";

const signAdminToken = (id) =>
  jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "7d" });

const _otps = {}; // in-memory OTP store for signup flow

// ── Seed default admin ────────────────────────────────────
export const seedAdmin = async () => {
  const exists = await Admin.findOne({ email: "sswag177@gmail.com" });
  if (!exists) {
    await Admin.create({ name: "Super Admin", email: "sswag177@gmail.com", password: "Admin@me" });
    console.log("✅ Default admin seeded: sswag177@gmail.com / Admin@me");
  }
};

// ── Admin Login ───────────────────────────────────────────
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin account not found" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = signAdminToken(admin._id);
    res.json({ success: true, token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Step 1: Send OTP ──────────────────────────────────────
export const adminSendOtp = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const otp = generateOTP();
    _otps[email.toLowerCase()] = { otp, name: name || "", expire: Date.now() + 5 * 60 * 1000 };

    await sendOtpEmail(email, otp, "Suvidha1 Admin — Email Verification", "Your Signup OTP");
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// ── Step 2: Verify OTP + create account ──────────────────
export const adminSignup = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp)
      return res.status(400).json({ success: false, message: "name, email, password and otp are required" });

    const record = _otps[email.toLowerCase()];
    if (!record)                    return res.status(400).json({ success: false, message: "OTP not found. Request a new one." });
    if (record.otp !== otp)         return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (record.expire < Date.now()) return res.status(400).json({ success: false, message: "OTP expired" });

    delete _otps[email.toLowerCase()];

    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ success: false, message: "An admin account already exists with this email" });

    const admin = await Admin.create({ name, email, password });
    const token = signAdminToken(admin._id);
    res.status(201).json({ success: true, token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin Forgot Password ─────────────────────────────────
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(404).json({ success: false, message: "No admin account with that email" });

    const otp = generateOTP();
    admin.otp       = otp;
    admin.otpExpire = Date.now() + 5 * 60 * 1000;
    await admin.save();

    await sendOtpEmail(email, otp, "Reset Your Suvidha1 Admin Password", "Admin Password Reset OTP");
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin Reset Password ──────────────────────────────────
export const adminResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: "email, otp and newPassword are required" });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin)                        return res.status(404).json({ success: false, message: "Admin not found" });
    if (admin.otp !== otp)             return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (admin.otpExpire < Date.now())  return res.status(400).json({ success: false, message: "OTP expired" });

    admin.password  = newPassword;
    admin.otp       = null;
    admin.otpExpire = null;
    await admin.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Get admin profile ─────────────────────────────────────
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password -otp -otpExpire");
    if (!admin) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: Dashboard stats ──────────────────────────────
export const adminGetDashboardStats = async (req, res) => {
  try {
    const [totalConsumers, totalStaff, totalBookings, pendingApprovals, completedBookings, totalRevenue] = await Promise.all([
      User.countDocuments({ role: "consumer" }),
      User.countDocuments({ role: "staff" }),
      Booking.countDocuments({}),
      StaffProfile.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "Completed" }),
      Booking.aggregate([{ $match: { status: "Completed" } }, { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ["$price", "0"] } } } } }]),
    ]);
    res.json({
      success: true,
      stats: {
        totalConsumers, totalStaff, totalBookings, pendingApprovals,
        completedBookings, totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: get all bookings ─────────────────────────────
export const adminGetAllBookings = async (req, res) => {
  try {
    const { status = "", page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate("consumer", "firstName lastName email phone")
      .populate("staff",    "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    res.json({ success: true, bookings, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: change password ────────────────────────────────
export const adminChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Both passwords required" });
    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });
    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminGetAllStaff = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 20 } = req.query;
    const profileFilter = {};
    if (status) profileFilter.status = status;

    const profiles = await StaffProfile.find(profileFilter)
      .populate("user", "-password -otp -otpExpire")
      .sort({ createdAt: -1 })
      .lean();

    let results = profiles;
    if (search) {
      const q = search.toLowerCase();
      results = profiles.filter(p => {
        const name = `${p.user?.firstName} ${p.user?.lastName}`.toLowerCase();
        return name.includes(q) || (p.category || "").toLowerCase().includes(q) || (p.user?.email || "").toLowerCase().includes(q);
      });
    }

    const total = results.length;
    const skip  = (Number(page) - 1) * Number(limit);
    res.json({ success: true, staff: results.slice(skip, skip + Number(limit)), total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: get single staff full detail ───────────────────
export const adminGetStaffDetail = async (req, res) => {
  try {
    const profile = await StaffProfile.findById(req.params.id)
      .populate("user", "-password -otp -otpExpire")
      .lean();
    if (!profile) return res.status(404).json({ success: false, message: "Not found" });
    const bookings = await Booking.find({ staff: profile.user?._id }).select("service date status price").lean();
    res.json({ success: true, profile, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: get all consumers ──────────────────────────────
export const adminGetAllConsumers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const filter = { role: "consumer" };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName:  { $regex: search, $options: "i" } },
        { email:     { $regex: search, $options: "i" } },
      ];
    }
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password -otp -otpExpire")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    res.json({ success: true, consumers: users, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: get single consumer full detail ────────────────
export const adminGetConsumerDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpire").lean();
    if (!user) return res.status(404).json({ success: false, message: "Not found" });
    const bookings = await Booking.find({ consumer: user._id })
      .select("service date status price workerName")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, consumer: user, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: delete consumer ────────────────────────────────
export const adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "consumer")
      return res.status(404).json({ success: false, message: "Consumer not found" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Consumer account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: delete staff ───────────────────────────────────
export const adminDeleteStaff = async (req, res) => {
  try {
    const profile = await StaffProfile.findById(req.params.id).populate("user");
    if (!profile) return res.status(404).json({ success: false, message: "Staff profile not found" });
    await User.findByIdAndDelete(profile.user?._id);
    await StaffProfile.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Staff account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: reports summary ────────────────────────────────
export const adminGetReports = async (req, res) => {
  try {
    const { range = "30" } = req.query;
    const days = parseInt(range) || 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalConsumers, newConsumers,
      totalStaff, newStaff,
      totalBookings, newBookings,
      completedBookings, cancelledBookings,
      revenueAgg, newRevenueAgg,
      bookingsByDay,
    ] = await Promise.all([
      User.countDocuments({ role: "consumer" }),
      User.countDocuments({ role: "consumer", createdAt: { $gte: from } }),
      User.countDocuments({ role: "staff" }),
      User.countDocuments({ role: "staff", createdAt: { $gte: from } }),
      Booking.countDocuments({}),
      Booking.countDocuments({ createdAt: { $gte: from } }),
      Booking.countDocuments({ status: "Completed" }),
      Booking.countDocuments({ status: "Cancelled" }),
      Booking.aggregate([{ $match: { status: "Completed" } }, { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ["$price", "0"] } } } } }]),
      Booking.aggregate([{ $match: { status: "Completed", createdAt: { $gte: from } } }, { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ["$price", "0"] } } } } }]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: from } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      range: days,
      stats: {
        totalConsumers, newConsumers,
        totalStaff, newStaff,
        totalBookings, newBookings,
        completedBookings, cancelledBookings,
        totalRevenue: revenueAgg[0]?.total || 0,
        newRevenue: newRevenueAgg[0]?.total || 0,
      },
      charts: { bookingsByDay },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: send notification ─────────────────────────────
export const adminSendNotification = async (req, res) => {
  try {
    const { title, message, audience = "all" } = req.body;
    if (!title || !message)
      return res.status(400).json({ success: false, message: "title and message are required" });
    if (!["all", "consumers", "staff"].includes(audience))
      return res.status(400).json({ success: false, message: "audience must be all, consumers or staff" });
    const notif = await Notification.create({ title, message, audience, sentBy: req.adminId });
    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: get sent notifications ────────────────────────
export const adminGetNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, notifications: notifs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: export report as JSON (client renders PDF/Excel) ─
export const adminExportReport = async (req, res) => {
  try {
    const { range = "30" } = req.query;
    const days = parseInt(range) || 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [consumers, staff, bookings] = await Promise.all([
      User.find({ role: "consumer", createdAt: { $gte: from } }).select("firstName lastName email phone createdAt isVerified").lean(),
      StaffProfile.find({ createdAt: { $gte: from } }).populate("user", "firstName lastName email phone").select("category city experience status createdAt").lean(),
      Booking.find({ createdAt: { $gte: from } }).select("service date status price createdAt").lean(),
    ]);

    res.json({ success: true, consumers, staff, bookings, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
