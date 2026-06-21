import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createBooking, getConsumerBookings, cancelBooking, rateBooking, markComplete,
  getStaffBookings, acceptBooking, completeBooking, getApprovedStaff,
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

// Get approved staff list (consumer uses this)
router.get("/approved-staff",     protect, getApprovedStaff);

export default router;
