import express from "express";

import {
  adminLogin, adminCreateAccount, adminListAccounts,
  getAdminProfile, adminUpdateProfile, adminForgotPassword, adminResetPassword,
  adminGetAllStaff, adminGetStaffDetail, adminDeleteStaff,
  adminGetAllConsumers, adminGetConsumerDetail, adminDeleteUser,
  adminGetDashboardStats, adminGetAllBookings, adminChangePassword,
  adminGetReports, adminExportReport,
  adminSendNotification, adminGetNotifications,
} from "../controller/adminController.js";
import { protectAdmin, requireSuperAdmin } from "../middleware/adminAuth.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// ── Public (rate limited) ──────────────────────────────────
// NOTE: there is deliberately no public signup route. New admin accounts are
// created by an authenticated super admin via POST /accounts.
router.post("/login",           authLimiter, adminLogin);
router.post("/forgot-password", otpLimiter,  adminForgotPassword);
router.post("/reset-password",  authLimiter, adminResetPassword);

// ── Account management (super admin only) ──────────────────
router.post("/accounts", protectAdmin, requireSuperAdmin, adminCreateAccount);
router.get("/accounts",  protectAdmin, requireSuperAdmin, adminListAccounts);

// ── Self ───────────────────────────────────────────────────
router.get("/profile",           protectAdmin, getAdminProfile);
router.patch("/profile",         protectAdmin, adminUpdateProfile);
router.patch("/change-password", protectAdmin, adminChangePassword);

// ── Dashboard ──────────────────────────────────────────────
router.get("/stats", protectAdmin, adminGetDashboardStats);

// ── Consumer management ────────────────────────────────────
router.get("/consumers",        protectAdmin, adminGetAllConsumers);
router.get("/consumers/:id",    protectAdmin, adminGetConsumerDetail);
router.delete("/consumers/:id", protectAdmin, requireSuperAdmin, adminDeleteUser);

// ── Staff management ───────────────────────────────────────
router.get("/staff",        protectAdmin, adminGetAllStaff);
router.get("/staff/:id",    protectAdmin, adminGetStaffDetail);
router.delete("/staff/:id", protectAdmin, requireSuperAdmin, adminDeleteStaff);

// ── Bookings ───────────────────────────────────────────────
router.get("/bookings", protectAdmin, adminGetAllBookings);

// ── Notifications ──────────────────────────────────────────
router.post("/notifications/send", protectAdmin, adminSendNotification);
router.get("/notifications",       protectAdmin, adminGetNotifications);

// ── Reports ────────────────────────────────────────────────
router.get("/reports",        protectAdmin, adminGetReports);
router.get("/reports/export", protectAdmin, adminExportReport);

export default router;
