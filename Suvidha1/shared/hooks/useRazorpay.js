import { useCallback, useRef, useState } from "react";
import { paymentsApi } from "../services/api";
import { errorMessage } from "../services/http";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Loads the Razorpay Checkout script once and caches the promise, so opening
 * checkout a second time is instant.
 */
let scriptPromise = null;

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(true);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => reject(new Error("load failed")));
        return;
      }

      const script = document.createElement("script");
      script.src = CHECKOUT_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptPromise = null; // allow a retry
        reject(new Error("Could not load the payment window."));
      };
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

/**
 * Drives a Razorpay payment for a booking.
 *
 * The amount is never passed in from the UI — the server reads it from the
 * stored booking when it creates the order, and re-checks the signature before
 * marking anything paid.
 */
export default function useRazorpay() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const openRef = useRef(false);

  const pay = useCallback(async ({ bookingId, description, onSuccess, onDismiss }) => {
    if (openRef.current) return undefined;

    setError("");
    setProcessing(true);
    openRef.current = true;

    try {
      await loadCheckout();

      const order = await paymentsApi.createOrder(bookingId);

      return await new Promise((resolve) => {
        const checkout = new window.Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Suvidha1",
          description: description || "Service booking",
          prefill: order.prefill || {},
          theme: { color: "#4F46E5" },

          handler: async (response) => {
            try {
              // The server verifies the signature; a forged response is refused.
              const result = await paymentsApi.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              setProcessing(false);
              openRef.current = false;
              onSuccess?.(result);
              resolve({ paid: true, result });
            } catch (err) {
              setError(errorMessage(err, "We could not confirm your payment."));
              setProcessing(false);
              openRef.current = false;
              resolve({ paid: false });
            }
          },

          modal: {
            ondismiss: () => {
              // The booking stays Pending. If money did leave the account, the
              // webhook reconciles it server-side.
              setProcessing(false);
              openRef.current = false;
              onDismiss?.();
              resolve({ paid: false, dismissed: true });
            },
          },
        });

        checkout.on("payment.failed", (response) => {
          setError(response?.error?.description || "The payment did not go through.");
          setProcessing(false);
          openRef.current = false;
          resolve({ paid: false, failed: true });
        });

        checkout.open();
      });
    } catch (err) {
      setError(errorMessage(err, "Could not start the payment."));
      setProcessing(false);
      openRef.current = false;
      return { paid: false };
    }
  }, []);

  return { pay, processing, error, clearError: () => setError("") };
}
