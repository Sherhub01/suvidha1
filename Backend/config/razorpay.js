import crypto from "crypto";
import Razorpay from "razorpay";

// ────────────────────────────────────────────────────────────
// Razorpay
//
// Online payments are opt-in: without keys the platform still runs, but only
// cash bookings are offered. Nothing here throws at import time, so a missing
// key never takes the whole API down.
// ────────────────────────────────────────────────────────────

let client = null;

export const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export const getRazorpay = () => {
  if (!isRazorpayConfigured()) return null;

  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return client;
};

/** The publishable key id — safe to hand to the browser. */
export const getPublicKeyId = () => process.env.RAZORPAY_KEY_ID || null;

/**
 * Verifies the signature Razorpay Checkout returns to the browser.
 *
 * Without this a caller could POST an arbitrary payment id and have the booking
 * marked paid. Compared in constant time.
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) return false;
  if (!process.env.RAZORPAY_KEY_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Verifies a webhook payload against RAZORPAY_WEBHOOK_SECRET.
 *
 * @param {Buffer|string} rawBody  the exact bytes received — a re-serialised
 *                                 object will not match the signature
 */
export function verifyWebhookSignature({ rawBody, signature }) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !rawBody) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const verifyRazorpayConfig = () => {
  if (isRazorpayConfigured()) {
    console.log("Razorpay configured — online payments enabled");
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.warn(
        "RAZORPAY_WEBHOOK_SECRET is not set. Payments will only be confirmed by the " +
        "browser callback, so a customer who closes the tab mid-payment will not be reconciled."
      );
    }
    return true;
  }

  console.warn("Razorpay is not configured — bookings will be cash-only.");
  return false;
};
