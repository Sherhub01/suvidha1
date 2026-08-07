import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../config/mailer.js";
import { generateOTP } from "../utils/otpGenerator.js";
import User from "../models/user.js";

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (user) => ({
    id:               user._id,
    firstName:        user.firstName,
    lastName:         user.lastName,
    email:            user.email,
    phone:            user.phone,
    userName:         user.userName,
    role:             user.role,
    avatar:           user.avatar,
    address:          user.address,
    bio:              user.bio,
    profileCompleted: user.profileCompleted,
    isVerified:       user.isVerified,
    location:         user.location,
});

// ── In-memory pending signup store (never touches DB until username is set) ──
// Key: `${email}::${role}`  Value: { firstName, lastName, phone, hashedPassword, otp, otpExpire, otpVerified }
const _pending = new Map();

const pendingKey = (email, role) => `${email.toLowerCase().trim()}::${role}`;

// Auto-expire pending entries after 10 minutes
const setPending = (key, value) => {
    _pending.set(key, value);
    setTimeout(() => _pending.delete(key), 10 * 60 * 1000);
};

// ── Signup — store in memory only, NO DB write yet ───────────────────────────
export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, role } = req.body;

        if (!role || !["consumer", "staff"].includes(role))
            return res.status(400).json({ success: false, message: "Invalid role." });

        const normalEmail = email.toLowerCase().trim();
        const key = pendingKey(normalEmail, role);

        // Block only if a FULLY completed account exists (verified + has username)
        const existing = await User.findOne({ email: normalEmail, role, isVerified: true, userName: { $ne: null } });
        if (existing)
            return res.status(400).json({
                success: false,
                message: `An account with this email already exists for ${role}. Please sign in.`,
            });

        const otp = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 8);

        // Overwrite any previous pending entry for this email+role
        setPending(key, {
            firstName, lastName, phone,
            hashedPassword, otp,
            otpExpire: Date.now() + 5 * 60 * 1000,
            otpVerified: false,
        });

        sendOtpEmail(normalEmail, otp, "Verify Your Suvidha1 Account", "Email Verification")
            .catch((e) => console.error("Mail error (signup):", e.message));

        res.status(201).json({ success: true, message: "OTP sent to your email", email: normalEmail });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error during signup" });
    }
};

// ── Verify OTP — mark pending entry as verified, still NO DB write ───────────
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, role } = req.body;
        const normalEmail = email.toLowerCase().trim();
        const key = pendingKey(normalEmail, role);
        const entry = _pending.get(key);

        if (!entry)
            return res.status(404).json({ success: false, message: "No pending signup found. Please sign up again." });
        if (entry.otp !== otp)
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (entry.otpExpire < Date.now())
            return res.status(400).json({ success: false, message: "OTP expired. Please sign up again." });

        entry.otpVerified = true;
        _pending.set(key, entry); // update in place

        res.status(200).json({ success: true, message: "Email verified. Please choose a username." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Complete signup — username set → NOW write to DB ─────────────────────────
export const completeSignup = async (req, res) => {
    try {
        const { email, username, role } = req.body;
        const normalEmail = email.toLowerCase().trim();
        const key = pendingKey(normalEmail, role);
        const entry = _pending.get(key);

        if (!entry)
            return res.status(404).json({ success: false, message: "Session expired. Please sign up again." });
        if (!entry.otpVerified)
            return res.status(400).json({ success: false, message: "Please verify your email first." });
        if (!username || username.trim().length < 3)
            return res.status(400).json({ success: false, message: "Username must be at least 3 characters." });

        const normalUsername = username.toLowerCase().trim();

        // Check username uniqueness within the same role
        const takenUsername = await User.findOne({ userName: normalUsername, role });
        if (takenUsername)
            return res.status(400).json({ success: false, message: "Username already taken. Try another." });

        // Check if a completed account already exists for this email+role (race condition guard)
        const existingUser = await User.findOne({ email: normalEmail, role });
        if (existingUser) {
            // If it somehow exists but has no username yet, just set the username
            if (!existingUser.userName) {
                existingUser.userName = normalUsername;
                existingUser.isVerified = true;
                await existingUser.save();
                _pending.delete(key);
                return res.status(200).json({ success: true, message: "Username set successfully." });
            }
            _pending.delete(key);
            return res.status(400).json({ success: false, message: "Account already exists. Please sign in." });
        }

        // Create the DB record — only reaches here after OTP verified + username chosen
        await User.create({
            firstName:    entry.firstName,
            lastName:     entry.lastName,
            email:        normalEmail,
            phone:        entry.phone,
            role,
            password:     entry.hashedPassword,
            userName:     normalUsername,
            isVerified:   true,
        });

        _pending.delete(key); // clean up memory

        res.status(201).json({ success: true, message: "Account created successfully. Please sign in." });
    } catch (err) {
        console.error(err);
        if (err.code === 11000)
            return res.status(400).json({ success: false, message: "Username or email already taken." });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Resend OTP — regenerate OTP in pending store ─────────────────────────────
export const resendOtp = async (req, res) => {
    try {
        const { email, role } = req.body;
        const normalEmail = email.toLowerCase().trim();
        const key = pendingKey(normalEmail, role);
        const entry = _pending.get(key);

        if (!entry)
            return res.status(404).json({ success: false, message: "No pending signup found. Please sign up again." });

        const otp = generateOTP();
        entry.otp = otp;
        entry.otpExpire = Date.now() + 5 * 60 * 1000;
        entry.otpVerified = false;
        _pending.set(key, entry);

        sendOtpEmail(normalEmail, otp, "Verify Your Suvidha1 Account", "Email Verification")
            .catch((e) => console.error("Mail error (resend):", e.message));

        res.status(200).json({ success: true, message: "OTP resent." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { identifier, password, role } = req.body;

        if (!role || !["consumer", "staff"].includes(role))
            return res.status(400).json({ success: false, message: "Invalid role." });

        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase().trim(), role },
                { userName: identifier.toLowerCase().trim(), role },
            ],
        });

        if (!user)
            return res.status(404).json({
                success: false,
                message: `No ${role} account found. Please sign up first.`,
                code: "NOT_REGISTERED",
            });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ success: false, message: "Invalid credentials" });

        if (!user.isVerified)
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
                code: "NOT_VERIFIED",
                email: user.email,
            });

        const token = signToken(user._id);
        res.status(200).json({ success: true, token, user: safeUser(user) });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Create / complete profile ─────────────────────────────────────────────────
export const createProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const { firstName, lastName, address, bio, userName, phone } = req.body;

        if (firstName) user.firstName = firstName.trim();
        if (lastName)  user.lastName  = lastName.trim();
        if (address)   user.address   = address.trim();
        if (bio)       user.bio       = bio.trim();
        if (phone)     user.phone     = phone.trim();

        if (userName) {
            const taken = await User.findOne({ userName: userName.toLowerCase(), role: user.role, _id: { $ne: user._id } });
            if (taken) return res.status(400).json({ success: false, message: "Username already taken" });
            user.userName = userName.toLowerCase();
        }

        if (req.file) user.avatar = `/uploads/avatars/${req.file.filename}`;

        user.profileCompleted = true;
        await user.save();

        res.status(200).json({ success: true, message: "Profile completed!", user: safeUser(user) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Get current user ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password -otp -otpExpire");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, user: safeUser(user) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Change password (authenticated) ──────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ success: false, message: "Current and new password required" });
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Forgot password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !/\S+@\S+\.\S+/.test(email.trim()))
            return res.status(400).json({ success: false, message: "Please enter a valid email address" });

        const user = await User.findOne({ email: email.toLowerCase().trim(), ...(role ? { role } : {}) });
        if (!user)
            return res.status(404).json({ success: false, message: "No account found with this email" });

        const otp = generateOTP();
        user.otp       = otp;
        user.otpExpire = Date.now() + 5 * 60 * 1000;
        await user.save();

        sendOtpEmail(email, otp, "Reset Your Suvidha1 Password", "Password Reset OTP")
            .catch((e) => console.error("Mail error (forgot):", e.message));

        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Verify reset OTP ──────────────────────────────────────────────────────────
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user)                       return res.status(404).json({ success: false, message: "User not found" });
        if (user.otp !== otp)            return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (user.otpExpire < Date.now()) return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        res.status(200).json({ success: true, message: "OTP verified" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Reset password ────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, role } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim(), ...(role ? { role } : {}) });

        if (!user)                       return res.status(404).json({ success: false, message: "User not found" });
        if (user.otp !== otp)            return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (user.otpExpire < Date.now()) return res.status(400).json({ success: false, message: "OTP expired" });

        user.password  = await bcrypt.hash(newPassword, 10);
        user.otp       = null;
        user.otpExpire = null;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Update location ───────────────────────────────────────────────────────────
export const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        if (!latitude || !longitude)
            return res.status(400).json({ success: false, message: "Coordinates required" });

        const user = await User.findByIdAndUpdate(
            req.userId,
            { location: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] } },
            { new: true }
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, message: "Location updated", location: user.location });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
