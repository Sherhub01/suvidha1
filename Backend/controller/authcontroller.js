import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { sendOtpEmail } from "../config/mailer.js";
import { generateOTP } from "../utils/otpGenerator.js";

import User from "../models/user.js";
import PendingSignup from "../models/pendingSignup.js";


// ============================================================
// HELPERS
// ============================================================

const signToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};


// Normalize email
const normalizeEmail = (email = "") => {
    return email.toLowerCase().trim();
};


// Normalize username
const normalizeUsername = (username = "") => {
    return username.toLowerCase().trim();
};

// Local-only fallback for testing when SMTP delivery is unavailable. Never
// enable this flag in production, because OTPs must not be returned by an API.
const isOtpPreviewEnabled = () =>
    process.env.OTP_DEBUG_MODE === "true" && process.env.NODE_ENV !== "production";


// First and last name will always be stored in CAPITAL letters
const normalizeName = (name = "") => {
    return name.trim().toUpperCase();
};


// Return safe user data
// Never send password / OTP to frontend
const safeUser = (user) => ({
    id: user._id,

    firstName: user.firstName,
    lastName: user.lastName,

    email: user.email,
    phone: user.phone,

    userName: user.userName,

    role: user.role,

    avatar: user.avatar,
    address: user.address,
    bio: user.bio,

    profileCompleted: user.profileCompleted,

    isVerified: user.isVerified,

    location: user.location,
});


// Validate role
const isValidRole = (role) => {
    return ["consumer", "staff"].includes(role);
};


// ============================================================
// 1. SIGNUP
// ============================================================
// STEP 1
//
// User fills:
//
// First Name
// Last Name
// Email
// Phone
// Password
// Role
//
// NOTHING is created inside User collection.
//
// Information goes temporarily into PendingSignup.
// ============================================================

export const signup = async (req, res) => {
    try {

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            role,
        } = req.body;


        // ----------------------------------------------------
        // REQUIRED FIELDS
        // ----------------------------------------------------

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }


        // ----------------------------------------------------
        // ROLE VALIDATION
        // ----------------------------------------------------

        if (!isValidRole(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role.",
            });
        }


        // ----------------------------------------------------
        // NORMALIZE DATA
        // ----------------------------------------------------

        const normalEmail = normalizeEmail(email);

        const normalFirstName = normalizeName(firstName);

        const normalLastName = normalizeName(lastName);

        const normalPhone = phone.trim();


        // ----------------------------------------------------
        // EMAIL VALIDATION
        // ----------------------------------------------------

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }


        // ----------------------------------------------------
        // PASSWORD VALIDATION
        // ----------------------------------------------------

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters.",
            });
        }


        // ----------------------------------------------------
        // CHECK IF COMPLETED ACCOUNT EXISTS
        // ----------------------------------------------------

        const existingUser = await User.findOne({
            email: normalEmail,
            role,
        });


        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    `An account with this email already exists for ${role}. Please sign in.`,
                code: "ACCOUNT_EXISTS",
            });
        }


        // ----------------------------------------------------
        // GENERATE OTP
        // ----------------------------------------------------

        const otp = generateOTP();

        if (isOtpPreviewEnabled()) {
            console.log(`[DEV OTP] Signup code for ${normalEmail}: ${otp}`);
        }


        // OTP expires in 5 minutes
        const otpExpire = new Date(
            Date.now() + 5 * 60 * 1000
        );


        // Pending signup expires in 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        // ----------------------------------------------------
        // HASH PASSWORD
        // ----------------------------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // ----------------------------------------------------
        // HASH OTP
        // ----------------------------------------------------

        const hashedOtp = await bcrypt.hash(
            String(otp),
            10
        );


        // ----------------------------------------------------
        // REMOVE OLD PENDING SIGNUP
        // ----------------------------------------------------

        await PendingSignup.deleteOne({
            email: normalEmail,
            role,
        });


        // ----------------------------------------------------
        // CREATE TEMPORARY SIGNUP
        // ----------------------------------------------------

        await PendingSignup.create({

            firstName: normalFirstName,

            lastName: normalLastName,

            email: normalEmail,

            phone: normalPhone,

            password: hashedPassword,

            role,

            otpHash: hashedOtp,

            otpExpire,

            otpVerified: false,

            expiresAt,
        });


        // ----------------------------------------------------
        // SEND OTP EMAIL
        // ----------------------------------------------------

        try {

            await sendOtpEmail(
                normalEmail,
                otp,
                "Verify Your Suvidha1 Account",
                "Email Verification"
            );

        } catch (mailError) {

            console.error(
                "Mail error (signup):",
                mailError
            );


            if (isOtpPreviewEnabled()) {
                console.warn("OTP preview enabled: continuing without SMTP delivery.");
                return res.status(201).json({
                    success: true,
                    message: "Email delivery failed; use the development OTP shown in the app.",
                    email: normalEmail,
                    role,
                    developmentOtp: otp,
                    nextStep: "VERIFY_EMAIL",
                });
            }

            await PendingSignup.deleteOne({ email: normalEmail, role });


            return res.status(500).json({
                success: false,
                message:
                    "Unable to send verification email. Please try again.",
            });
        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "OTP sent successfully to your email.",

            email: normalEmail,

            ...(isOtpPreviewEnabled() ? { developmentOtp: otp } : {}),

            role,

            nextStep: "VERIFY_EMAIL",
        });


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );


        // Duplicate index protection
        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message:
                    "An account or signup session already exists.",
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Server error during signup.",
        });
    }
};



// ============================================================
// 2. VERIFY OTP
// ============================================================
// STEP 2
//
// User enters OTP.
//
// Correct OTP:
//     otpVerified = true
//
// Still NO User document is created.
//
// User remains inside PendingSignup.
// ============================================================

export const verifyOtp = async (req, res) => {

    try {

        const {
            email,
            otp,
            role,
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!email || !otp || !role) {

            return res.status(400).json({
                success: false,
                message:
                    "Email, OTP and role are required.",
            });
        }


        if (!isValidRole(role)) {

            return res.status(400).json({
                success: false,
                message: "Invalid role.",
            });
        }


        const normalEmail = normalizeEmail(email);


        // ----------------------------------------------------
        // FIND PENDING SIGNUP
        // ----------------------------------------------------

        const pending = await PendingSignup.findOne({
            email: normalEmail,
            role,
        });


        if (!pending) {

            return res.status(404).json({
                success: false,
                message:
                    "Signup session expired. Please sign up again.",
                code: "SIGNUP_EXPIRED",
            });
        }


        // ----------------------------------------------------
        // CHECK OTP EXPIRY
        // ----------------------------------------------------

        if (
            !pending.otpExpire ||
            pending.otpExpire.getTime() < Date.now()
        ) {

            await PendingSignup.deleteOne({
                _id: pending._id,
            });


            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please sign up again.",
                code: "OTP_EXPIRED",
            });
        }


        // ----------------------------------------------------
        // CHECK OTP
        // ----------------------------------------------------

        const otpMatches = await bcrypt.compare(
            String(otp).trim(),
            pending.otpHash
        );


        if (!otpMatches) {

            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
                code: "INVALID_OTP",
            });
        }


        // ----------------------------------------------------
        // MARK EMAIL VERIFIED
        // ----------------------------------------------------

        pending.otpVerified = true;

        // OTP is no longer required
        pending.otpHash = undefined;
        pending.otpExpire = undefined;


        // Extend pending signup lifetime
        pending.expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        await pending.save();


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Email verified successfully. Please create your username.",

            email: normalEmail,

            role,

            nextStep: "CREATE_USERNAME",
        });


    } catch (error) {

        console.error(
            "Verify OTP error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error while verifying OTP.",
        });
    }
};



// ============================================================
// 3. RESEND OTP
// ============================================================

export const resendOtp = async (req, res) => {

    try {

        const {
            email,
            role,
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!email || !role) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and role are required.",
            });
        }


        if (!isValidRole(role)) {

            return res.status(400).json({
                success: false,
                message: "Invalid role.",
            });
        }


        const normalEmail = normalizeEmail(email);


        // ----------------------------------------------------
        // FIND PENDING SIGNUP
        // ----------------------------------------------------

        const pending = await PendingSignup.findOne({
            email: normalEmail,
            role,
        });


        if (!pending) {

            return res.status(404).json({
                success: false,
                message:
                    "Signup session expired. Please sign up again.",
                code: "SIGNUP_EXPIRED",
            });
        }


        // ----------------------------------------------------
        // GENERATE NEW OTP
        // ----------------------------------------------------

        const otp = generateOTP();

        if (isOtpPreviewEnabled()) {
            console.log(`[DEV OTP] Resend code for ${normalEmail}: ${otp}`);
        }


        const hashedOtp = await bcrypt.hash(
            String(otp),
            10
        );


        pending.otpHash = hashedOtp;

        pending.otpExpire = new Date(
            Date.now() + 5 * 60 * 1000
        );

        pending.otpVerified = false;

        pending.expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        await pending.save();


        // ----------------------------------------------------
        // SEND NEW OTP
        // ----------------------------------------------------

        try {

            await sendOtpEmail(
                normalEmail,
                otp,
                "Verify Your Suvidha1 Account",
                "Email Verification"
            );

        } catch (mailError) {

            console.error(
                "Mail error (resend):",
                mailError
            );


            if (isOtpPreviewEnabled()) {
                console.warn("OTP preview enabled: continuing without SMTP delivery.");
                return res.status(200).json({
                    success: true,
                    message: "Email delivery failed; use the development OTP shown in the app.",
                    email: normalEmail,
                    developmentOtp: otp,
                    nextStep: "VERIFY_EMAIL",
                });
            }

            return res.status(500).json({
                success: false,
                message:
                    "Unable to send OTP email. Please try again.",
            });
        }


        return res.status(200).json({

            success: true,

            message:
                "A new OTP has been sent to your email.",

            email: normalEmail,

            ...(isOtpPreviewEnabled() ? { developmentOtp: otp } : {}),

            nextStep: "VERIFY_EMAIL",
        });


    } catch (error) {

        console.error(
            "Resend OTP error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error while resending OTP.",
        });
    }
};



// ============================================================
// 4. COMPLETE SIGNUP
// ============================================================
// STEP 3
//
// User enters username.
//
// ONLY NOW:
//
// PendingSignup → User
//
// This is the ONLY place where signup creates the real user.
// ============================================================

export const completeSignup = async (req, res) => {

    try {

        const {
            email,
            username,
            role,
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!email || !username || !role) {

            return res.status(400).json({
                success: false,
                message:
                    "Email, username and role are required.",
            });
        }


        if (!isValidRole(role)) {

            return res.status(400).json({
                success: false,
                message: "Invalid role.",
            });
        }


        const normalEmail = normalizeEmail(email);

        const normalUsername =
            normalizeUsername(username);


        // ----------------------------------------------------
        // USERNAME VALIDATION
        // ----------------------------------------------------

        if (normalUsername.length < 3) {

            return res.status(400).json({
                success: false,
                message:
                    "Username must be at least 3 characters.",
            });
        }


        if (
            !/^[a-z0-9._]+$/.test(
                normalUsername
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Username can contain only letters, numbers, dots and underscores.",
            });
        }


        // ----------------------------------------------------
        // FIND PENDING SIGNUP
        // ----------------------------------------------------

        const pending = await PendingSignup.findOne({
            email: normalEmail,
            role,
        });


        if (!pending) {

            return res.status(404).json({
                success: false,
                message:
                    "Signup session expired. Please start signup again.",
                code: "SIGNUP_EXPIRED",
            });
        }


        // ----------------------------------------------------
        // EMAIL MUST BE VERIFIED
        // ----------------------------------------------------

        if (!pending.otpVerified) {

            return res.status(403).json({
                success: false,
                message:
                    "Please verify your email before creating a username.",
                code: "EMAIL_NOT_VERIFIED",
            });
        }


        // ----------------------------------------------------
        // CHECK USERNAME
        // ----------------------------------------------------

        const usernameExists = await User.findOne({
            userName: normalUsername,
            role,
        });


        if (usernameExists) {

            return res.status(409).json({
                success: false,
                message:
                    "Username already taken. Please choose another.",
                code: "USERNAME_TAKEN",
            });
        }


        // ----------------------------------------------------
        // FINAL EMAIL CHECK
        // ----------------------------------------------------

        const emailExists = await User.findOne({
            email: normalEmail,
            role,
        });


        if (emailExists) {

            await PendingSignup.deleteOne({
                _id: pending._id,
            });


            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists. Please sign in.",
                code: "ACCOUNT_EXISTS",
            });
        }


        // ----------------------------------------------------
        // CREATE REAL USER
        // ----------------------------------------------------

        const user = await User.create({

            firstName:
                normalizeName(pending.firstName),

            lastName:
                normalizeName(pending.lastName),

            email:
                pending.email,

            phone:
                pending.phone,

            password:
                pending.password,

            userName:
                normalUsername,

            role:
                pending.role,

            isVerified:
                true,

            profileCompleted:
                false,
        });


        // ----------------------------------------------------
        // DELETE TEMPORARY SIGNUP
        // ----------------------------------------------------

        await PendingSignup.deleteOne({
            _id: pending._id,
        });


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully. Please sign in.",

            nextStep: "LOGIN",

            user: safeUser(user),
        });


    } catch (error) {

        console.error(
            "Complete signup error:",
            error
        );


        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message:
                    "Email or username already exists.",
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Server error while creating account.",
        });
    }
};



// ============================================================
// 5. LOGIN
// ============================================================
// Login with:
//
// email + password
// OR
// username + password
//
// Role must match.
// ============================================================

export const login = async (req, res) => {

    try {

        const {
            identifier,
            password,
            role,
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !identifier ||
            !password ||
            !role
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Email/username, password and role are required.",
            });
        }


        if (!isValidRole(role)) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid role.",
            });
        }


        const normalIdentifier =
            normalizeEmail(identifier);


        // ----------------------------------------------------
        // FIND USER
        // ----------------------------------------------------

        const user = await User.findOne({

            role,

            $or: [
                {
                    email: normalIdentifier,
                },
                {
                    userName: normalIdentifier,
                },
            ],
        });


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    `No ${role} account found. Please sign up first.`,
                code: "NOT_REGISTERED",
            });
        }


        // ----------------------------------------------------
        // VERIFY EMAIL
        // ----------------------------------------------------

        if (!user.isVerified) {

            return res.status(403).json({
                success: false,
                message:
                    "Please verify your email before logging in.",
                code: "NOT_VERIFIED",
                email: user.email,
            });
        }


        // ----------------------------------------------------
        // PASSWORD
        // ----------------------------------------------------

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatches) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email/username or password.",
                code: "INVALID_CREDENTIALS",
            });
        }


        // ----------------------------------------------------
        // TOKEN
        // ----------------------------------------------------

        const token =
            signToken(user._id);


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Login successful.",

            token,

            user:
                safeUser(user),
        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error during login.",
        });
    }
};



// ============================================================
// 6. CREATE / COMPLETE PROFILE
// ============================================================

export const createProfile = async (req, res) => {

    try {

        const user =
            await User.findById(req.userId);


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }


        const {
            firstName,
            lastName,
            address,
            bio,
            userName,
            phone,
        } = req.body;


        // ----------------------------------------------------
        // UPDATE BASIC DETAILS
        // ----------------------------------------------------

        if (firstName) {

            user.firstName =
                normalizeName(firstName);
        }


        if (lastName) {

            user.lastName =
                normalizeName(lastName);
        }


        if (address) {

            user.address =
                address.trim();
        }


        if (bio) {

            user.bio =
                bio.trim();
        }


        if (phone) {

            user.phone =
                phone.trim();
        }


        // ----------------------------------------------------
        // UPDATE USERNAME
        // ----------------------------------------------------

        if (userName) {

            const normalUsername =
                normalizeUsername(userName);


            const taken =
                await User.findOne({

                    userName:
                        normalUsername,

                    role:
                        user.role,

                    _id: {
                        $ne: user._id,
                    },
                });


            if (taken) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Username already taken.",
                });
            }


            user.userName =
                normalUsername;
        }


        // ----------------------------------------------------
        // AVATAR
        // ----------------------------------------------------

        if (req.file) {

            user.avatar =
                `/uploads/avatars/${req.file.filename}`;
        }


        user.profileCompleted = true;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Profile completed successfully.",

            user:
                safeUser(user),
        });


    } catch (error) {

        console.error(
            "Create profile error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error.",
        });
    }
};



// ============================================================
// 7. GET CURRENT USER
// ============================================================

export const getMe = async (req, res) => {

    try {

        const user =
            await User.findById(
                req.userId
            ).select(
                "-password -otp -otpExpire"
            );


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }


        return res.status(200).json({

            success: true,

            user:
                safeUser(user),
        });


    } catch (error) {

        console.error(
            "Get me error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error.",
        });
    }
};



// ============================================================
// 8. CHANGE PASSWORD
// ============================================================

export const changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword,
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required.",
            });
        }


        if (newPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters.",
            });
        }


        const user =
            await User.findById(
                req.userId
            );


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }


        // ----------------------------------------------------
        // CURRENT PASSWORD
        // ----------------------------------------------------

        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                user.password
            );


        if (!passwordMatches) {

            return res.status(400).json({
                success: false,
                message:
                    "Current password is incorrect.",
            });
        }


        // ----------------------------------------------------
        // NEW PASSWORD
        // ----------------------------------------------------

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Password changed successfully.",
        });


    } catch (error) {

        console.error(
            "Change password error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error.",
        });
    }
};



// ============================================================
// 9. FORGOT PASSWORD
// ============================================================
// This is for EXISTING users.
//
// Signup OTP is stored in PendingSignup.
// Password-reset OTP remains on the existing User.
// ============================================================

export const forgotPassword = async (req, res) => {

    try {

        const {
            email,
            role,
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!email) {

            return res.status(400).json({
                success: false,
                message:
                    "Email address is required.",
            });
        }


        const normalEmail =
            normalizeEmail(email);


        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailRegex.test(normalEmail)) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address.",
            });
        }


        // ----------------------------------------------------
        // FIND USER
        // ----------------------------------------------------

        const query = {
            email: normalEmail,
        };


        if (role) {

            query.role = role;
        }


        const user =
            await User.findOne(query);


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "No account found with this email.",
                code: "NOT_REGISTERED",
            });
        }


        // ----------------------------------------------------
        // GENERATE OTP
        // ----------------------------------------------------

        const otp =
            generateOTP();


        user.otp =
            otp;


        user.otpExpire =
            new Date(
                Date.now() + 5 * 60 * 1000
            );


        await user.save();


        // ----------------------------------------------------
        // SEND EMAIL
        // ----------------------------------------------------

        try {

            await sendOtpEmail(

                normalEmail,

                otp,

                "Reset Your Suvidha1 Password",

                "Password Reset OTP"
            );

        } catch (mailError) {

            console.error(
                "Mail error (forgot password):",
                mailError
            );


            return res.status(500).json({
                success: false,
                message:
                    "Unable to send reset email. Please try again.",
            });
        }


        return res.status(200).json({

            success: true,

            message:
                "Password reset OTP sent to your email.",

            email:
                normalEmail,
        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error.",
        });
    }
};



// ============================================================
// 10. VERIFY RESET PASSWORD OTP
// ============================================================

export const verifyResetOtp = async (req, res) => {

    try {

        const {
            email,
            otp,
            role,
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required.",
            });
        }


        const normalEmail =
            normalizeEmail(email);


        const query = {
            email: normalEmail,
        };


        if (role) {

            query.role = role;
        }


        const user =
            await User.findOne(query);


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }


        // ----------------------------------------------------
        // OTP CHECK
        // ----------------------------------------------------

        if (
            user.otp === null ||
            user.otp === undefined
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "No password reset OTP found. Please request a new one.",
            });
        }


        if (
            String(user.otp) !==
            String(otp).trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid OTP.",
                code: "INVALID_OTP",
            });
        }


        if (
            !user.otpExpire ||
            new Date(user.otpExpire).getTime() <
                Date.now()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please request a new one.",
                code: "OTP_EXPIRED",
            });
        }


        return res.status(200).json({

            success: true,

            message:
                "OTP verified successfully.",

            email:
                normalEmail,
        });


    } catch (error) {

        console.error(
            "Verify reset OTP error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error.",
        });
    }
};



// ============================================================
// 11. RESET PASSWORD
// ============================================================

export const resetPassword = async (req, res) => {

    try {

        const {
            email,
            otp,
            newPassword,
            role,
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !email ||
            !otp ||
            !newPassword
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Email, OTP and new password are required.",
            });
        }


        if (newPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters.",
            });
        }


        const normalEmail =
            normalizeEmail(email);


        const query = {
            email: normalEmail,
        };


        if (role) {

            query.role = role;
        }


        const user =
            await User.findOne(query);


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }


        // ----------------------------------------------------
        // OTP CHECK
        // ----------------------------------------------------

        if (
            user.otp === null ||
            user.otp === undefined
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "No reset OTP found. Please request a new one.",
            });
        }


        if (
            String(user.otp) !==
            String(otp).trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid OTP.",
            });
        }


        if (
            !user.otpExpire ||
            new Date(user.otpExpire).getTime() <
                Date.now()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired.",
            });
        }


        // ----------------------------------------------------
        // UPDATE PASSWORD
        // ----------------------------------------------------

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        // ----------------------------------------------------
        // DELETE USED OTP
        // ----------------------------------------------------

        user.otp = null;

        user.otpExpire = null;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Password reset successfully. You can now sign in.",
        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error.",
        });
    }
};



// ============================================================
// 12. UPDATE LOCATION
// ============================================================

export const updateLocation = async (req, res) => {

    try {

        const {
            latitude,
            longitude,
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            latitude === undefined ||
            longitude === undefined
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Latitude and longitude are required.",
            });
        }


        const lat =
            parseFloat(latitude);

        const lng =
            parseFloat(longitude);


        if (
            Number.isNaN(lat) ||
            Number.isNaN(lng)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid coordinates.",
            });
        }


        if (
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Coordinates are out of range.",
            });
        }


        // ----------------------------------------------------
        // UPDATE LOCATION
        // ----------------------------------------------------

        const user =
            await User.findByIdAndUpdate(

                req.userId,

                {
                    location: {
                        type: "Point",

                        coordinates: [
                            lng,
                            lat,
                        ],
                    },
                },

                {
                    new: true,
                    runValidators: true,
                }
            );


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }


        return res.status(200).json({

            success: true,

            message:
                "Location updated successfully.",

            location:
                user.location,
        });


    } catch (error) {

        console.error(
            "Update location error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Server error.",
        });
    }
};
