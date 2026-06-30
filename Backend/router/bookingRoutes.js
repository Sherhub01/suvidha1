import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createBooking, getConsumerBookings, cancelBooking, rateBooking, markComplete,
  getStaffBookings, acceptBooking, completeBooking, getApprovedStaff,
  getStaffAlerts, markAlertRead, markAllAlertsRead, getUnreadCount,
  getConsumerAlerts, markConsumerAlertRead, markAllConsumerAlertsRead,
} from "../controller/bookingController.js";

const router = express.Router();

// Consumer
router.post("/",                  protect, createBooking);
router.get("/consumer",           protect, getConsumerBookings);
router.patch("/:id/cancel",       protect, cancelBooking);
router.patch("/:id/rate",         protect, rateBooking);
router.patch("/:id/complete",     protect, markComplete);

// Staff
router.get("/staff",              protect, getStaffBookings);
router.patch("/:id/accept",       protect, acceptBooking);
router.patch("/:id/done",         protect, completeBooking);

// Staff alerts (in-app notifications)
router.get("/alerts",             protect, getStaffAlerts);
router.get("/alerts/unread-count",protect, getUnreadCount);
router.patch("/alerts/read-all",  protect, markAllAlertsRead);
router.patch("/alerts/:id/read",  protect, markAlertRead);

// Consumer alerts
router.get("/consumer-alerts",              protect, getConsumerAlerts);
router.patch("/consumer-alerts/read-all",   protect, markAllConsumerAlertsRead);
router.patch("/consumer-alerts/:id/read",   protect, markConsumerAlertRead);

// Get approved staff list (consumer uses this)
router.get("/approved-staff",     protect, getApprovedStaff);

export default router;
