import crypto from "crypto";

import Booking, { BOOKING_STATUS } from "../models/booking.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import ConsumerAlert from "../models/consumerAlert.js";

import {
  getRazorpay,
  getPublicKeyId,
  isRazorpayConfigured,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../config/razorpay.js";
import { calculateRefund, formatPaise } from "../utils/pricing.js";
import { notifyNewBooking } from "./bookingController.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// ────────────────────────────────────────────────────────────
// Config probe — the checkout screen asks what it may offer
// ────────────────────────────────────────────────────────────

export const getPaymentConfig = (req, res) => {
  res.json({
    success: true,
    online: isRazorpayConfigured(),
    keyId: getPublicKeyId(),
    methods: isRazorpayConfigured() ? ["razorpay", "cash"] : ["cash"],
  });
};

// ────────────────────────────────────────────────────────────
// Create a Razorpay order for a booking
// ────────────────────────────────────────────────────────────

export const createOrder = async (req, res) => {
  try {
    if (!isRazorpayConfigured()) {
      return fail(res, 503, "Online payment is not available right now.");
    }

    const booking = await Booking.findOne({
      _id: req.body.bookingId,
      consumer: req.userId,
    });

    if (!booking) return fail(res, 404, "Booking not found");
    if (booking.paymentStatus === "Paid") return fail(res, 409, "This booking is already paid.");
    if ([BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED].includes(booking.status)) {
      return fail(res, 409, "This booking is no longer active.");
    }

    // The amount is read from the stored booking, never from the request.
    const amount = booking.pricing.total;
    if (!amount || amount < 100) return fail(res, 400, "This booking has no payable amount.");

    // Reuse an order that is still awaiting payment rather than stacking new ones.
    const existing = await Payment.findOne({
      booking: booking._id,
      status: { $in: ["created", "authorized"] },
      razorpayOrderId: { $ne: null },
    });

    if (existing && existing.amount === amount) {
      return res.json({
        success: true,
        orderId: existing.razorpayOrderId,
        amount: existing.amount,
        currency: existing.currency,
        keyId: getPublicKeyId(),
        paymentId: existing._id,
      });
    }

    const order = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt: `bkg_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        consumerId: req.userId.toString(),
        service: booking.service,
      },
    });

    const payment = await Payment.create({
      booking: booking._id,
      consumer: booking.consumer,
      staff: booking.staff,
      method: "razorpay",
      status: "created",
      amount,
      breakdown: booking.pricing,
      razorpayOrderId: order.id,
      idempotencyKey: `order_${order.id}`,
    });

    booking.payment = payment._id;
    await booking.save();

    const consumer = await User.findById(req.userId).select("firstName lastName email phone").lean();

    res.json({
      success: true,
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: getPublicKeyId(),
      paymentId: payment._id,
      prefill: {
        name: `${consumer?.firstName || ""} ${consumer?.lastName || ""}`.trim(),
        email: consumer?.email || "",
        contact: consumer?.phone || "",
      },
    });
  } catch (err) {
    console.error("createOrder error:", err);
    fail(res, 502, "Could not start the payment. Please try again.");
  }
};

// ────────────────────────────────────────────────────────────
// Settle a paid booking (shared by the callback and the webhook)
// ────────────────────────────────────────────────────────────

/**
 * Marks a payment captured and releases the booking to the professional.
 *
 * Safe to call more than once: the browser callback and the webhook routinely
 * both arrive, and only the first does any work.
 */
async function settlePayment({ payment, razorpayPaymentId, signature }) {
  if (payment.status === "captured") {
    return { alreadySettled: true, payment };
  }

  payment.status = "captured";
  payment.razorpayPaymentId = razorpayPaymentId;
  if (signature) payment.razorpaySignature = signature;
  payment.capturedAt = new Date();
  await payment.save();

  const booking = await Booking.findById(payment.booking);
  if (!booking) return { alreadySettled: false, payment, booking: null };

  booking.paymentStatus = "Paid";
  booking.payment = payment._id;

  // A pending online booking becomes visible to the professional only now.
  const wasPending = booking.status === BOOKING_STATUS.PENDING;
  if (wasPending) booking.applyStatus(BOOKING_STATUS.SCHEDULED, "system", "Payment received");

  await booking.save();

  if (wasPending && booking.staff) {
    const staffUser = await User.findById(booking.staff).select("firstName lastName email");
    await notifyNewBooking({ booking, staffUser, consumerId: booking.consumer });
  }

  await ConsumerAlert.create({
    consumer: booking.consumer,
    booking: booking._id,
    type: "general",
    title: `Payment received: ${booking.service}`,
    message: `We received ${formatPaise(payment.amount)}. Your booking is confirmed with the professional.`,
  }).catch((e) => console.error("ConsumerAlert error:", e.message));

  return { alreadySettled: false, payment, booking };
}

// ────────────────────────────────────────────────────────────
// Browser callback after Razorpay Checkout closes
// ────────────────────────────────────────────────────────────

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    // Without this check, anyone could POST an invented payment id and have the
    // booking marked paid.
    if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { status: "failed", failureReason: "Signature verification failed" }
      );
      return fail(res, 400, "Payment verification failed. If you were charged, it will be refunded.");
    }

    const payment = await Payment.findOne({ razorpayOrderId: orderId, consumer: req.userId });
    if (!payment) return fail(res, 404, "Payment record not found.");

    const { alreadySettled, booking } = await settlePayment({
      payment,
      razorpayPaymentId: paymentId,
      signature,
    });

    res.json({
      success: true,
      alreadySettled,
      message: "Payment confirmed.",
      bookingId: booking?._id || payment.booking,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Webhook — the authoritative signal
// ────────────────────────────────────────────────────────────

/**
 * Handles Razorpay webhooks.
 *
 * Mounted with a raw body parser: the signature is computed over the exact
 * bytes Razorpay sent, so a re-serialised object would never match.
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body; // Buffer, thanks to express.raw()

    if (!verifyWebhookSignature({ rawBody, signature })) {
      console.warn("Rejected webhook with a bad signature");
      return res.status(400).json({ success: false });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const entity = event.payload?.payment?.entity;

    // Always acknowledge quickly — Razorpay retries on a non-2xx.
    res.json({ success: true });

    if (!entity) return undefined;

    if (event.event === "payment.captured") {
      const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
      if (payment) {
        await settlePayment({ payment, razorpayPaymentId: entity.id });
      }
      return undefined;
    }

    if (event.event === "payment.failed") {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: entity.order_id },
        {
          status: "failed",
          razorpayPaymentId: entity.id,
          failureReason: entity.error_description || "Payment failed",
        }
      );
      await Booking.findOneAndUpdate(
        { payment: (await Payment.findOne({ razorpayOrderId: entity.order_id }))?._id },
        { paymentStatus: "Failed" }
      );
      return undefined;
    }

    if (event.event === "refund.processed") {
      const refund = event.payload?.refund?.entity;
      if (refund) {
        const payment = await Payment.findOne({ razorpayPaymentId: refund.payment_id });
        if (payment) {
          payment.amountRefunded = refund.amount;
          payment.status =
            refund.amount >= payment.amount ? "refunded" : "partially_refunded";
          payment.refundedAt = new Date();
          await payment.save();
        }
      }
    }

    return undefined;
  } catch (err) {
    console.error("handleWebhook error:", err);
    // The response was already sent; nothing more to do.
    return undefined;
  }
};

// ────────────────────────────────────────────────────────────
// Refunds (admin)
// ────────────────────────────────────────────────────────────

export const refundBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return fail(res, 404, "Booking not found");

    const payment = await Payment.findOne({ booking: booking._id, status: "captured" });
    if (!payment) return fail(res, 404, "No captured payment for this booking.");

    const { refundable, reason } = calculateRefund({ booking });
    const amount = Math.min(refundable || payment.amount, payment.amount - payment.amountRefunded);

    if (amount <= 0) return fail(res, 400, `Nothing to refund. ${reason}`);

    if (payment.method === "cash") {
      // Cash is settled off-platform; record it and let the admin hand it back.
      payment.amountRefunded += amount;
      payment.status = payment.amountRefunded >= payment.amount ? "refunded" : "partially_refunded";
      payment.refundedAt = new Date();
      await payment.save();

      booking.paymentStatus = "Refunded";
      await booking.save();

      return res.json({
        success: true,
        message: `Recorded a cash refund of ${formatPaise(amount)}. Please return it to the customer.`,
        amount: amount / 100,
      });
    }

    if (!isRazorpayConfigured()) return fail(res, 503, "Razorpay is not configured.");

    const refund = await getRazorpay().payments.refund(payment.razorpayPaymentId, {
      amount,
      speed: "normal",
      notes: { bookingId: booking._id.toString(), reason: req.body?.reason || reason },
    });

    payment.amountRefunded += amount;
    payment.status = payment.amountRefunded >= payment.amount ? "refunded" : "partially_refunded";
    payment.refundedAt = new Date();
    await payment.save();

    booking.paymentStatus = "Refunded";
    await booking.save();

    await ConsumerAlert.create({
      consumer: booking.consumer,
      booking: booking._id,
      type: "general",
      title: `Refund issued: ${booking.service}`,
      message: `${formatPaise(amount)} is on its way back to your original payment method.`,
    }).catch(() => {});

    res.json({ success: true, refundId: refund.id, amount: amount / 100 });
  } catch (err) {
    console.error("refundBooking error:", err);
    fail(res, 502, "The refund could not be processed. Please try again.");
  }
};

// ────────────────────────────────────────────────────────────
// Ledger reads
// ────────────────────────────────────────────────────────────

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ consumer: req.userId })
      .populate("booking", "service category scheduledAt status")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      payments: payments.map((p) => ({
        ...p,
        amount: p.amount / 100,
        amountRefunded: p.amountRefunded / 100,
      })),
    });
  } catch (err) {
    console.error("getMyPayments error:", err);
    fail(res, 500, "Server error");
  }
};

export const adminListPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.validatedQuery || req.query;
    const { status, method } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    const [payments, total, totals] = await Promise.all([
      Payment.find(filter)
        .populate("booking", "service category scheduledAt status")
        .populate("consumer", "firstName lastName email")
        .populate("staff", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Payment.countDocuments(filter),
      Payment.aggregate([
        { $match: { status: "captured" } },
        {
          $group: {
            _id: null,
            gross: { $sum: "$amount" },
            refunded: { $sum: "$amountRefunded" },
            commission: { $sum: "$breakdown.platformCommission" },
          },
        },
      ]),
    ]);

    const t = totals[0] || { gross: 0, refunded: 0, commission: 0 };

    res.json({
      success: true,
      total,
      payments: payments.map((p) => ({
        ...p,
        amount: p.amount / 100,
        amountRefunded: p.amountRefunded / 100,
      })),
      summary: {
        gross: t.gross / 100,
        refunded: t.refunded / 100,
        net: (t.gross - t.refunded) / 100,
        commission: t.commission / 100,
      },
    });
  } catch (err) {
    console.error("adminListPayments error:", err);
    fail(res, 500, "Server error");
  }
};

/** Deterministic idempotency key for retryable operations. */
export const buildIdempotencyKey = (...parts) =>
  crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 32);
