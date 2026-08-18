import express from "express";

import { protect, requireConsumer, requireStaff } from "../middleware/auth.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import { validate, createReviewSchema, replyReviewSchema, paginationSchema } from "../middleware/validate.js";
import {
  createReview, getProfileReviews, getMyReviews, replyToReview,
  adminListReviews, adminSetReviewVisibility,
} from "../controller/reviewController.js";

const router = express.Router();

// ── Public (signed-in) ─────────────────────────────────────
router.get("/profile/:profileId", protect, validate(paginationSchema, "query"), getProfileReviews);

// ── Consumer ───────────────────────────────────────────────
router.post("/", protect, requireConsumer, validate(createReviewSchema), createReview);

// ── Staff ──────────────────────────────────────────────────
router.get("/mine", protect, requireStaff, getMyReviews);
router.patch("/:id/reply", protect, requireStaff, validate(replyReviewSchema), replyToReview);

// ── Admin ──────────────────────────────────────────────────
router.get("/admin/list", protectAdmin, validate(paginationSchema, "query"), adminListReviews);
router.patch("/admin/:id/visibility", protectAdmin, adminSetReviewVisibility);

export default router;
