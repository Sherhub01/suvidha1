import express from "express";

import { protect, requireStaff } from "../middleware/auth.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import { validate, requestPayoutSchema, processPayoutSchema, paginationSchema } from "../middleware/validate.js";
import {
  getEarningsSummary, getEarningsHistory,
  requestPayout, getMyPayouts,
  adminListPayouts, adminProcessPayout,
} from "../controller/earningsController.js";

const router = express.Router();

// ── Staff ──────────────────────────────────────────────────
router.get("/summary", protect, requireStaff, getEarningsSummary);
router.get("/history", protect, requireStaff, validate(paginationSchema, "query"), getEarningsHistory);
router.get("/payouts", protect, requireStaff, getMyPayouts);
router.post("/payouts", protect, requireStaff, validate(requestPayoutSchema), requestPayout);

// ── Admin ──────────────────────────────────────────────────
router.get("/admin/payouts", protectAdmin, validate(paginationSchema, "query"), adminListPayouts);
router.patch("/admin/payouts/:id", protectAdmin, validate(processPayoutSchema), adminProcessPayout);

export default router;
