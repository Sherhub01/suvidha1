import express from "express";
import {
  adminLogin, adminSignup, adminSendOtp,
  getAdminProfile, adminForgotPassword, adminResetPassword,
  adminGetAllStaff, adminGetStaffDetail, adminDeleteStaff,
  adminGetAllConsumers, adminGetConsumerDetail, adminDeleteUser,
  adminGetDashboardStats, adminGetAllBookings, adminChangePassword,
  adminGetReports, adminExportReport,
  adminSendNotification, adminGetNotifications,
} from "../controller/adminController.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login",           adminLogin);
router.post("/send-otp",        adminSendOtp);
router.post("/signup",          adminSignup);
router.post("/forgot-password", adminForgotPassword);
router.post("/reset-password",  adminResetPassword);
router.get("/profile",          protectAdmin, getAdminProfile);
router.patch("/change-password", protectAdmin, adminChangePassword);

// Dashboard stats
router.get("/stats",            protectAdmin, adminGetDashboardStats);

// ── Consumer management
router.get("/consumers",        protectAdmin, adminGetAllConsumers);
router.get("/consumers/:id",    protectAdmin, adminGetConsumerDetail);
router.delete("/consumers/:id", protectAdmin, adminDeleteUser);

// ── Staff management
router.get("/staff",            protectAdmin, adminGetAllStaff);
router.get("/staff/:id",        protectAdmin, adminGetStaffDetail);
router.delete("/staff/:id",     protectAdmin, adminDeleteStaff);

// ── Booking management
router.get("/bookings",         protectAdmin, adminGetAllBookings);

// ── Notifications
router.post("/notifications/send",  protectAdmin, adminSendNotification);
router.get("/notifications",        protectAdmin, adminGetNotifications);

// ── Reports
router.get("/reports",          protectAdmin, adminGetReports);
router.get("/reports/export",   protectAdmin, adminExportReport);

export default router;
