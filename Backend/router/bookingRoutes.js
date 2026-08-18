import express from "express";

import { protect, requireConsumer, requireStaff } from "../middleware/auth.js";
import {
  createBooking, getConsumerBookings, cancelBooking, rateBooking, markComplete,
  getStaffBookings, acceptBooking, completeBooking, getApprovedStaff,
  getStaffAlerts, markAlertRead, markAllAlertsRead, getUnreadCount,
  getConsumerAlerts, markConsumerAlertRead, markAllConsumerAlertsRead,
} from "../controller/bookingController.js";

const router = express.Router();

// ── Consumer ───────────────────────────────────────────────
router.post("/",              protect, requireConsumer, createBooking);
router.get("/consumer",       protect, requireConsumer, getConsumerBookings);
router.patch("/:id/cancel",   protect, requireConsumer, cancelBooking);
router.patch("/:id/rate",     protect, requireConsumer, rateBooking);
router.patch("/:id/complete", protect, requireConsumer, markComplete);

router.get("/consumer-alerts",            protect, requireConsumer, getConsumerAlerts);
router.patch("/consumer-alerts/read-all", protect, requireConsumer, markAllConsumerAlertsRead);
router.patch("/consumer-alerts/:id/read", protect, requireConsumer, markConsumerAlertRead);

// ── Staff ──────────────────────────────────────────────────
router.get("/staff",        protect, requireStaff, getStaffBookings);
router.patch("/:id/accept", protect, requireStaff, acceptBooking);
router.patch("/:id/done",   protect, requireStaff, completeBooking);

router.get("/alerts",              protect, requireStaff, getStaffAlerts);
router.get("/alerts/unread-count", protect, requireStaff, getUnreadCount);
router.patch("/alerts/read-all",   protect, requireStaff, markAllAlertsRead);
router.patch("/alerts/:id/read",   protect, requireStaff, markAlertRead);

// ── Shared: approved professional listing ──────────────────
router.get("/approved-staff", protect, getApprovedStaff);

export default router;
