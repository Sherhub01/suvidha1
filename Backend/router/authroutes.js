import express from "express";
import {
    signup, verifyOtp, resendOtp, completeSignup,
    login, createProfile, getMe, deleteMe,
    forgotPassword, verifyResetOtp, resetPassword, updateLocation, changePassword,
} from "../controller/authcontroller.js";
import { protect }         from "../middleware/auth.js";
import { upload }          from "../middleware/upload.js";

const router = express.Router();

// Public
router.post("/signup",         signup);
router.post("/verify-otp",     verifyOtp);
router.post("/resend-otp",     resendOtp);
router.post("/complete-signup", completeSignup);
router.post("/login",          login);
router.post("/forgot-password",  forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password",   resetPassword);

// Protected
router.get(  "/me",             protect, getMe);
router.delete("/me",             protect, deleteMe);
router.post( "/create-profile", protect, upload.single("avatar"), createProfile);
router.patch("/location",       protect, updateLocation);
router.patch("/change-password", protect, changePassword);

export default router;
