import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../config/mailer.js";
import { generateOTP } from "../utils/otpGenerator.js";
import User from "../models/user.js";

// ── helpers ──────────────────────────────────────────────
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (user) => ({
    id:               user._id,
    firstName:        user.firstName,
    lastName:         user.lastName,
    email:            user.email,
    phone:            user.phone,
    userName:         user.userName,
    avatar:           user.avatar,
    address:          user.address,
    bio:              user.bio,
    profileCompleted: user.profileCompleted,
    isVerified:       user.isVerified,
    location:         user.location,
});

// ── Signup + send OTP ─────────────────────────────────────
export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpire = Date.now() + 5 * 60 * 1000;

        const user = await User.create({
            firstName, lastName, email, phone,
            password: hashedPassword, otp, otpExpire,
        });

        await sendOtpEmail(email, otp, "Verify Your Suvidha1 Account", "Email Verification");

        res.status(201).json({ success: true, message: "OTP sent to your email", email: user.email });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error during signup" });
    }
};

// ── Verify OTP ────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user)                        return res.status(404).json({ success: false, message: "User not found" });
        if (user.otp !== otp)             return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (user.otpExpire < Date.now())  return res.status(400).json({ success: false, message: "OTP expired" });

        user.isVerified = true;
        user.otp        = null;
        user.otpExpire  = null;
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Complete signup (set username) ────────────────────────
export const completeSignup = async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await User.findOne({ email });

        if (!user)            return res.status(404).json({ success: false, message: "User not found" });
        if (!user.isVerified) return res.status(400).json({ success: false, message: "Please verify your email first" });

        const taken = await User.findOne({ userName: username.toLowerCase() });
        if (taken) return res.status(400).json({ success: false, message: "Username already taken" });

        user.userName = username.toLowerCase();
        await user.save();

        res.status(200).json({ success: true, message: "Username set successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Login ─────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await User.findOne({
            $or: [{ email: identifier }, { userName: identifier }],
        });

        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: "Please verify your email before logging in" });
        }

        const token = signToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: safeUser(user),
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Create / complete profile ─────────────────────────────
// POST /api/auth/create-profile   (protected, multipart/form-data)
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

        // username (optional update)
        if (userName) {
            const taken = await User.findOne({ userName: userName.toLowerCase(), _id: { $ne: user._id } });
            if (taken) return res.status(400).json({ success: false, message: "Username already taken" });
            user.userName = userName.toLowerCase();
        }

        // avatar file uploaded via multer
        if (req.file) {
            user.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        user.profileCompleted = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile completed!",
            user: safeUser(user),
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Get current user ──────────────────────────────────────
// GET /api/auth/me   (protected)
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

// ── Forgot password ───────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "No account with that email" });

        const otp = generateOTP();
        user.otp       = otp;
        user.otpExpire = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendOtpEmail(email, otp, "Reset Your Suvidha1 Password", "Password Reset OTP");

        res.status(200).json({ success: true, message: "OTP sent to your email" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Reset password ────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

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

// ── Update location ───────────────────────────────────────
// PATCH /api/auth/location   (protected)
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
