import express from "express";

import { protect, requireConsumer, requireStaff } from "../middleware/auth.js";
import { validate, createBookingSchema, quoteSchema, cancelBookingSchema, rejectBookingSchema, paginationSchema } from "../middleware/validate.js";
import {
  getQuote, createBooking, getConsumerBookings, cancelBooking,
  getStaffBookings, acceptBooking, startBooking, rejectBooking, completeBooking,
  getApprovedStaff, getAvailability,
  getStaffAlerts, markAlertRead, markAllAlertsRead, getUnreadCount,
  getConsumerAlerts, markConsumerAlertRead, markAllConsumerAlertsRead,
} from "../controller/bookingController.js";

const router = express.Router();

// ── Shared ─────────────────────────────────────────────────
router.get("/approved-staff", protect, getApprovedStaff);
router.get("/availability/:staffId", protect, getAvailability);

// ── Consumer ───────────────────────────────────────────────
router.post("/quote", protect, requireConsumer, validate(quoteSchema), getQuote);
router.post("/", protect, requireConsumer, validate(createBookingSchema), createBooking);
router.get("/consumer", protect, requireConsumer, validate(paginationSchema, "query"), getConsumerBookings);
router.patch("/:id/cancel", protect, requireConsumer, validate(cancelBookingSchema), cancelBooking);

router.get("/consumer-alerts", protect, requireConsumer, getConsumerAlerts);
router.patch("/consumer-alerts/read-all", protect, requireConsumer, markAllConsumerAlertsRead);
router.patch("/consumer-alerts/:id/read", protect, requireConsumer, markConsumerAlertRead);

// ── Staff ──────────────────────────────────────────────────
router.get("/staff", protect, requireStaff, validate(paginationSchema, "query"), getStaffBookings);
router.patch("/:id/accept", protect, requireStaff, acceptBooking);
router.patch("/:id/start", protect, requireStaff, startBooking);
router.patch("/:id/reject", protect, requireStaff, validate(rejectBookingSchema), rejectBooking);
router.patch("/:id/done", protect, requireStaff, completeBooking);

router.get("/alerts", protect, requireStaff, getStaffAlerts);
router.get("/alerts/unread-count", protect, requireStaff, getUnreadCount);
router.patch("/alerts/read-all", protect, requireStaff, markAllAlertsRead);
router.patch("/alerts/:id/read", protect, requireStaff, markAlertRead);

export default router;
