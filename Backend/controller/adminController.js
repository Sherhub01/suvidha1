import crypto from "crypto";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import User from "../models/user.js";
import StaffProfile from "../models/staffProfile.js";
import Booking from "../models/booking.js";
import Notification from "../models/notification.js";
import { sendOtpEmail } from "../config/mailer.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { validatePassword, hashOtp, verifyOtpHash, isValidEmail } from "../utils/security.js";

const signAdminToken = (admin) =>
  jwt.sign(
    { id: admin._id.toString(), isAdmin: true, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

const OTP_TTL_MS       = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// Generic reply used for every forgot-password outcome so the endpoint cannot
// be used to discover which email addresses have admin accounts.
const GENERIC_RESET_REPLY = {
  success: true,
  message: "If an admin account exists for that email, a reset code has been sent.",
};

const publicAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  mustChangePassword: admin.mustChangePassword,
});

// -- Seed the first super admin ----------------------------
// Credentials come from the environment; nothing is hardcoded. When no
// password is supplied a random one is generated and printed once, and the
// account is flagged so the password must be changed at first login.
export const seedAdmin = async () => {
  const email = (process.env.SEED_ADMIN_EMAIL || "").toLowerCase().trim();

  if (!email) {
    const existing = await Admin.countDocuments();
    if (existing === 0) {
      console.warn(
        "No admin accounts exist and SEED_ADMIN_EMAIL is not set. " +
        "Set SEED_ADMIN_EMAIL (and optionally SEED_ADMIN_PASSWORD) to create one."
      );
    }
    return;
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    // Keep the seeded account at super-admin level.
    if (existing.role !== "superadmin") {
      existing.role = "superadmin";
      await existing.save();
    }
    return;
  }

  const generated = crypto.randomBytes(12).toString("base64url");
  const password  = process.env.SEED_ADMIN_PASSWORD || generated;

  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error("SEED_ADMIN_PASSWORD rejected: " + passwordError);
    return;
  }

  await Admin.create({
    name: process.env.SEED_ADMIN_NAME || "Super Admin",
    email,
    password,
    role: "superadmin",
    mustChangePassword: !process.env.SEED_ADMIN_PASSWORD,
  });

  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log(`Super admin seeded: ${email}`);
  } else {
    console.log(
      `Super admin seeded: ${email}\n` +
      `   Temporary password (shown once): ${generated}\n` +
      "   Change it immediately after signing in."
    );
  }
};

// -- Admin login -------------------------------------------
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });

    // Identical response for "no such admin" and "wrong password" so the
    // endpoint cannot be used to enumerate admin accounts.
    const isMatch = admin ? await admin.comparePassword(password) : false;
    if (!admin || !isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = signAdminToken(admin);
    res.json({ success: true, token, admin: publicAdmin(admin) });
  } catch (err) {
    console.error("adminLogin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -- Create another admin (super admin only) ---------------
// Replaces the previously public /signup endpoint. Admin accounts can now
// only be created by an authenticated super admin.
export const adminCreateAccount = async (req, res) => {
  try {
    const { name, email, password, role = "admin" } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "name, email and password are required" });

    if (!isValidEmail(email))
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });

    const passwordError = validatePassword(password);
    if (passwordError)
      return res.status(400).json({ success: false, message: passwordError });

    if (!["admin", "superadmin"].includes(role))
      return res.status(400).json({ success: false, message: "Invalid role." });

    const normalEmail = String(email).toLowerCase().trim();
    const exists = await Admin.findOne({ email: normalEmail });
    if (exists)
      return res.status(409).json({ success: false, message: "An admin account already exists with this email" });

    const admin = await Admin.create({ name: name.trim(), email: normalEmail, password, role });
    res.status(201).json({ success: true, admin: publicAdmin(admin) });
  } catch (err) {
    console.error("adminCreateAccount error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -- List admin accounts (super admin only) ----------------
export const adminListAccounts = async (req, res) => {
  try {
    const admins = await Admin.find().select("name email role createdAt").sort({ createdAt: -1 }).lean();
    res.json({ success: true, admins });
  } catch (err) {
    console.error("adminListAccounts error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -- Admin forgot password ---------------------------------
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
    if (!admin) return res.json(GENERIC_RESET_REPLY);

    const otp = generateOTP();
    admin.otpHash     = hashOtp(otp);
    admin.otpExpire   = new Date(Date.now() + OTP_TTL_MS);
    admin.otpAttempts = 0;
    await admin.save();

    try {
      await sendOtpEmail(admin.email, otp, "Reset Your Suvidha1 Admin Password", "Admin Password Reset OTP");
    } catch (mailErr) {
      console.error("Mail error (admin reset):", mailErr.message);
    }

    res.json(GENERIC_RESET_REPLY);
  } catch (err) {
    console.error("adminForgotPassword error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -- Admin reset password ----------------------------------
export const adminResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: "email, otp and newPassword are required" });

    const passwordError = validatePassword(newPassword);
    if (passwordError)
      return res.status(400).json({ success: false, message: passwordError });

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
    const invalid = { success: false, message: "Invalid or expired reset code." };

    if (!admin || !admin.otpHash) return res.status(400).json(invalid);

    if (admin.otpAttempts >= MAX_OTP_ATTEMPTS) {
      admin.otpHash   = null;
      admin.otpExpire = null;
      await admin.save();
      return res.status(429).json({ success: false, message: "Too many attempts. Request a new reset code." });
    }

    if (!admin.otpExpire || admin.otpExpire.getTime() < Date.now())
      return res.status(400).json(invalid);

    if (!verifyOtpHash(otp, admin.otpHash)) {
      admin.otpAttempts += 1;
      await admin.save();
      return res.status(400).json(invalid);
    }

    admin.password           = newPassword;
    admin.otpHash            = null;
    admin.otpExpire          = null;
    admin.otpAttempts        = 0;
    admin.mustChangePassword = false;
    await admin.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("adminResetPassword error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Get admin profile ─────────────────────────────────────
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password -otpHash -otpExpire -otpAttempts");
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
      .populate("consumer", "firstName lastName email phone avatar")
      .populate("staff",    "firstName lastName email phone avatar")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    // Ensure workerName is always filled — fall back to populated staff if denormalized field is empty
    const enriched = bookings.map(b => {
      const stf = b.staff || {};
      return {
        ...b,
        workerName:  b.workerName  || `${stf.firstName || ""} ${stf.lastName || ""}`.trim() || "—",
        workerPhone: b.workerPhone || stf.phone || "—",
      };
    });

    res.json({ success: true, bookings: enriched, total });
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
    const policyError = validatePassword(newPassword);
    if (policyError) return res.status(400).json({ success: false, message: policyError });
    admin.password           = newPassword;
    admin.mustChangePassword = false;
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

// -- Update own admin profile ------------------------------
export const adminUpdateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim())
      return res.status(400).json({ success: false, message: "Name is required" });

    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    admin.name = name.trim();
    await admin.save();

    res.json({
      success: true,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error("adminUpdateProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
