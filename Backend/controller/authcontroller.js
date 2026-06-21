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

// ── Signup ────────────────────────────────────────────────
export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, role } = req.body;

        if (!role || !["consumer", "staff"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role. Must be consumer or staff." });
        }

        // Check if this email+role combo already exists
        const existing = await User.findOne({ email: email.toLowerCase(), role });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `An account with this email already exists for ${role}. Please sign in.`,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpire = Date.now() + 5 * 60 * 1000;

        const user = await User.create({
            firstName, lastName, email, phone, role,
            password: hashedPassword, otp, otpExpire,
        });

        try {
            await sendOtpEmail(email, otp, "Verify Your Suvidha1 Account", "Email Verification");
        } catch (mailErr) {
            console.error("Mail error (signup):", mailErr.message);
        }

        res.status(201).json({ success: true, message: "OTP sent to your email", email: user.email });

    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: `An account with this email already exists for ${req.body.role}. Please sign in.` });
        }
        res.status(500).json({ success: false, message: "Server error during signup" });
    }
};

// ── Verify OTP ────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, role } = req.body;
        const user = await User.findOne({ email: email.toLowerCase(), ...(role ? { role } : {}) });

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
        const { email, username, role } = req.body;
        const user = await User.findOne({ email: email.toLowerCase(), ...(role ? { role } : {}) });

        if (!user)            return res.status(404).json({ success: false, message: "User not found" });
        if (!user.isVerified) return res.status(400).json({ success: false, message: "Please verify your email first" });

        const taken = await User.findOne({ userName: username.toLowerCase(), role: user.role });
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
        const { identifier, password, role } = req.body;

        if (!role || !["consumer", "staff"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role." });
        }

        // Find user by email OR username, scoped to the requested role
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase(), role },
                { userName: identifier.toLowerCase(), role },
            ],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `No ${role} account found. Please sign up first.`,
                code: "NOT_REGISTERED",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
                code: "NOT_VERIFIED",
                email: user.email,
            });
        }

        const token = signToken(user._id);
        res.status(200).json({ success: true, token, user: safeUser(user) });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Create / complete profile ─────────────────────────────
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

// ── Get current user ──────────────────────────────────────
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

// ── Change password (authenticated) ─────────────────────
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

// ── Forgot password ───────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !/\S+@\S+\.\S+/.test(email.trim()))
            return res.status(400).json({ success: false, message: "Please enter a valid email address" });
        const user = await User.findOne({ email: email.toLowerCase(), ...(role ? { role } : {}) });
        if (!user) return res.status(404).json({ success: false, message: "No account found with this email" });

        const otp = generateOTP();
        user.otp       = otp;
        user.otpExpire = Date.now() + 5 * 60 * 1000;
        await user.save();

        try {
            await sendOtpEmail(email, otp, "Reset Your Suvidha1 Password", "Password Reset OTP");
        } catch (mailErr) {
            console.error("Mail error (forgot):", mailErr.message);
        }
        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Reset password ────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, role } = req.body;
        const user = await User.findOne({ email: email.toLowerCase(), ...(role ? { role } : {}) });

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
