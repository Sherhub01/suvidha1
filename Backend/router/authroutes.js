import express from "express";

import {
    signup, verifyOtp, resendOtp, completeSignup,
    login, createProfile, getMe, deleteMe,
    forgotPassword, verifyResetOtp, resetPassword, updateLocation, changePassword,
} from "../controller/authcontroller.js";
import { protect } from "../middleware/auth.js";
import { upload, handleUploadError } from "../middleware/upload.js";
import { authLimiter, otpLimiter, signupLimiter, uploadLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// ── Public (rate limited) ──────────────────────────────────
router.post("/signup",           signupLimiter, signup);
router.post("/verify-otp",       authLimiter,   verifyOtp);
router.post("/resend-otp",       otpLimiter,    resendOtp);
router.post("/complete-signup",  signupLimiter, completeSignup);
router.post("/login",            authLimiter,   login);
router.post("/forgot-password",  otpLimiter,    forgotPassword);
router.post("/verify-reset-otp", authLimiter,   verifyResetOtp);
router.post("/reset-password",   authLimiter,   resetPassword);

// ── Protected ──────────────────────────────────────────────
router.get("/me",       protect, getMe);
router.delete("/me",    protect, deleteMe);
router.patch("/location",        protect, updateLocation);
router.patch("/change-password", protect, authLimiter, changePassword);
router.post(
    "/create-profile",
    protect,
    uploadLimiter,
    upload.single("avatar"),
    handleUploadError,
    createProfile
);

export default router;
