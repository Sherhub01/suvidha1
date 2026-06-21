import express from "express";
import {
    signup, verifyOtp, completeSignup,
    login, createProfile, getMe,
    forgotPassword, resetPassword, updateLocation, changePassword,
} from "../controller/authcontroller.js";
import { protect }         from "../middleware/auth.js";
import { upload }          from "../middleware/upload.js";

const router = express.Router();

// Public
router.post("/signup",         signup);
router.post("/verify-otp",     verifyOtp);
router.post("/complete-signup", completeSignup);
router.post("/login",          login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// Protected
router.get(  "/me",             protect, getMe);
router.post( "/create-profile", protect, upload.single("avatar"), createProfile);
router.patch("/location",       protect, updateLocation);
router.patch("/change-password", protect, changePassword);

export default router;
