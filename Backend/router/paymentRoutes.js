import express from "express";

import { protect, requireConsumer } from "../middleware/auth.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import { validate, createOrderSchema, verifyPaymentSchema, paginationSchema } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimit.js";
import {
  getPaymentConfig, createOrder, verifyPayment,
  refundBooking, getMyPayments, adminListPayments,
} from "../controller/paymentController.js";

const router = express.Router();

router.get("/config", protect, getPaymentConfig);

// ── Consumer ───────────────────────────────────────────────
router.post("/order", protect, requireConsumer, authLimiter, validate(createOrderSchema), createOrder);
router.post("/verify", protect, requireConsumer, validate(verifyPaymentSchema), verifyPayment);
router.get("/mine", protect, requireConsumer, getMyPayments);

// ── Admin ──────────────────────────────────────────────────
router.get("/admin/list", protectAdmin, validate(paginationSchema, "query"), adminListPayments);
router.post("/admin/refund/:bookingId", protectAdmin, refundBooking);

export default router;
