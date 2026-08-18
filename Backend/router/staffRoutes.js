import express from "express";

import { protect, requireStaff } from "../middleware/auth.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import { staffDocumentUpload, handleUploadError } from "../middleware/upload.js";
import { uploadLimiter } from "../middleware/rateLimit.js";
import {
  getStaffProfile, saveStep, submitForReview, getApprovalStatus,
  getPendingStaff, approveStaff, rejectStaff, getStaffDetail,
  getPublicStaffProfile, getStaffDocument,
} from "../controller/staffController.js";
import { getApprovedStaff } from "../controller/bookingController.js";

const router = express.Router();

// ── Consumer-facing (any signed-in user) ───────────────────
router.get("/approved",           protect, getApprovedStaff);
router.get("/profile/:profileId", protect, getPublicStaffProfile);

// ── Staff-only ─────────────────────────────────────────────
router.get("/profile", protect, requireStaff, getStaffProfile);
router.get("/status",  protect, requireStaff, getApprovalStatus);
router.post("/submit", protect, requireStaff, submitForReview);
router.post(
  "/step",
  protect,
  requireStaff,
  uploadLimiter,
  staffDocumentUpload,
  handleUploadError,
  saveStep
);

// Documents: the owning professional reads their own uploads.
router.get("/document/:profileId/:field", protect, requireStaff, getStaffDocument);

// ── Admin-only ─────────────────────────────────────────────
router.get("/admin/list",                  protectAdmin, getPendingStaff);
router.get("/admin/detail/:profileId",     protectAdmin, getStaffDetail);
router.get("/admin/document/:profileId/:field", protectAdmin, getStaffDocument);
router.patch("/admin/approve/:profileId",  protectAdmin, approveStaff);
router.patch("/admin/reject/:profileId",   protectAdmin, rejectStaff);

export default router;
