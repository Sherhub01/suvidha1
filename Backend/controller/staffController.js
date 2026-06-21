import StaffProfile from "../models/staffProfile.js";
import User from "../models/user.js";
import Admin from "../models/admin.js";
import { sendApplicationSubmittedEmail, sendApprovalEmail, sendRejectionEmail } from "../config/mailer.js";

// ── Get or create staff profile ───────────────────────────
export const getStaffProfile = async (req, res) => {
  try {
    let profile = await StaffProfile.findOne({ user: req.userId });
    if (!profile) profile = await StaffProfile.create({ user: req.userId });
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Save a single step (upsert) ───────────────────────────
export const saveStep = async (req, res) => {
  try {
    const step = req.body.step;
    // data arrives as a JSON string when sent via multipart/form-data
    let data = req.body.data;
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch { data = {}; }
    }
    if (!step || !data) return res.status(400).json({ success: false, message: "step and data required" });

    let profile = await StaffProfile.findOne({ user: req.userId });
    if (!profile) profile = new StaffProfile({ user: req.userId });

    // Merge step data
    Object.assign(profile, data);

    // Track completed steps
    if (!profile.completedSteps.includes(Number(step))) {
      profile.completedSteps.push(Number(step));
    }
    profile.currentStep = Math.max(profile.currentStep, Number(step) + 1);

    // Handle file uploads stored from multer (set via req.files)
    if (req.files) {
      if (req.files.aadhaarDoc?.[0]) profile.aadhaarDoc = `/uploads/docs/${req.files.aadhaarDoc[0].filename}`;
      if (req.files.panDoc?.[0])     profile.panDoc     = `/uploads/docs/${req.files.panDoc[0].filename}`;
      if (req.files.certDoc?.[0])    profile.certDoc    = `/uploads/docs/${req.files.certDoc[0].filename}`;
      if (req.files.photo?.[0])      profile.photo      = `/uploads/avatars/${req.files.photo[0].filename}`;
    }

    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Final submit for admin review ─────────────────────────
export const submitForReview = async (req, res) => {
  try {
    const profile = await StaffProfile.findOne({ user: req.userId });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
    if (profile.status === "approved") return res.json({ success: true, message: "Already approved" });

    profile.status      = "pending";
    profile.submittedAt = new Date();
    await profile.save();

    // Send emails to staff and admin
    try {
      const staffUser = await User.findById(req.userId).select("firstName lastName email");
      const admin     = await Admin.findOne().select("email").lean();
      const staffName = `${staffUser.firstName} ${staffUser.lastName}`.trim();
      await sendApplicationSubmittedEmail({
        staffEmail: staffUser.email,
        staffName,
        adminEmail: admin?.email,
      });
    } catch (mailErr) {
      console.error("Mail error (submit):", mailErr.message);
    }

    res.json({ success: true, message: "Application submitted for review. Please wait for admin approval." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Check approval status ─────────────────────────────────
export const getApprovalStatus = async (req, res) => {
  try {
    const profile = await StaffProfile.findOne({ user: req.userId }).select("status rejectionReason submittedAt approvedAt currentStep completedSteps");
    if (!profile) return res.json({ success: true, status: "incomplete", currentStep: 1, completedSteps: [] });
    res.json({ success: true, status: profile.status, rejectionReason: profile.rejectionReason, submittedAt: profile.submittedAt, approvedAt: profile.approvedAt, currentStep: profile.currentStep, completedSteps: profile.completedSteps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ────────────────────────────────────────────────────────────

// ── Get all pending staff ─────────────────────────────────
export const getPendingStaff = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const profiles = await StaffProfile.find({ status }).populate("user", "firstName lastName email phone");
    res.json({ success: true, profiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Approve staff ─────────────────────────────────────────
export const approveStaff = async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = await StaffProfile.findById(profileId).populate("user");
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    profile.status     = "approved";
    profile.approvedAt = new Date();
    profile.approvedBy = req.adminId || "admin";
    await profile.save();

    await User.findByIdAndUpdate(profile.user._id, { profileCompleted: true });

    // Email notification to staff
    try {
      await sendApprovalEmail({
        staffEmail: profile.user.email,
        staffName:  `${profile.user.firstName} ${profile.user.lastName}`.trim(),
      });
    } catch (mailErr) {
      console.error("Mail error (approve):", mailErr.message);
    }

    res.json({ success: true, message: `${profile.user.firstName} has been approved.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Reject staff ──────────────────────────────────────────
export const rejectStaff = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ success: false, message: "Rejection reason required" });

    const profile = await StaffProfile.findById(profileId).populate("user");
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    profile.status          = "rejected";
    profile.rejectionReason = reason.trim();
    await profile.save();

    await User.findByIdAndUpdate(profile.user._id, { profileCompleted: false });

    // Email notification to staff
    try {
      await sendRejectionEmail({
        staffEmail: profile.user.email,
        staffName:  `${profile.user.firstName} ${profile.user.lastName}`.trim(),
        reason:     reason.trim(),
      });
    } catch (mailErr) {
      console.error("Mail error (reject):", mailErr.message);
    }

    res.json({ success: true, message: `${profile.user.firstName}'s application has been rejected.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Get single staff detail (admin) ──────────────────────
export const getStaffDetail = async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = await StaffProfile.findById(profileId).populate("user", "-password -otp -otpExpire");
    if (!profile) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
