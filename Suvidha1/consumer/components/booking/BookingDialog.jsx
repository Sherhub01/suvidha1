import { useCallback, useEffect, useState } from "react";
import { Banknote, CreditCard, MapPin, CheckCircle2, ShieldCheck } from "lucide-react";
import {
  Modal, Button, Textarea, Input, Alert, Avatar, Badge, Spinner, cx, FOCUS_RING,
} from "../../../shared/ui/index";
import SlotPicker from "./SlotPicker";
import PriceBreakdown from "./PriceBreakdown";
import { formatINR } from "./format";
import { bookingsApi, paymentsApi } from "../../../shared/services/api";
import { errorMessage } from "../../../shared/services/http";
import useRazorpay from "../../../shared/hooks/useRazorpay";

/**
 * Books a professional.
 *
 * The browser never sends a price. It asks the server for a quote, shows that
 * breakdown, and the server recomputes the same figure when the booking is
 * created — so what the customer agrees to is what gets charged.
 */
export default function BookingDialog({ open, worker, serviceSlug, onClose, onBooked }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState("cash");

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [onlineAvailable, setOnlineAvailable] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [done, setDone] = useState(null);

  const { pay, processing: paying, error: payError } = useRazorpay();

  // Read once so the memo dependency is a plain value, not an optional chain.
  const workerId = worker?.id;

  // Which payment methods the backend can actually offer right now.
  useEffect(() => {
    if (!open) return;
    paymentsApi
      .config()
      .then((c) => setOnlineAvailable(Boolean(c.online)))
      .catch(() => setOnlineAvailable(false));
  }, [open]);

  // Re-quote whenever the priced inputs change.
  const loadQuote = useCallback(async () => {
    if (!workerId || !serviceSlug) return;

    setQuoteLoading(true);
    try {
      const result = await bookingsApi.quote({ staffId: workerId, serviceSlug, quantity });
      setQuote(result.quote);
    } catch (err) {
      setError(errorMessage(err, "Could not fetch the price."));
    } finally {
      setQuoteLoading(false);
    }
  }, [workerId, serviceSlug, quantity]);

  useEffect(() => {
    if (open) loadQuote();
  }, [open, loadQuote]);

  const validate = () => {
    const errs = {};
    if (!date) errs.date = "Choose a date.";
    if (!time) errs.time = "Choose a time slot.";
    if (address.trim().length < 8) errs.address = "Enter your full address.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await bookingsApi.create({
        staffId: workerId,
        serviceSlug,
        date,
        time,
        address: address.trim(),
        description: description.trim(),
        quantity,
        paymentMethod: method,
      });

      const booking = result.booking;

      if (result.requiresPayment) {
        const payment = await pay({
          bookingId: booking._id,
          description: `${booking.service} · ${booking.slotLabel}`,
        });

        if (!payment?.paid) {
          // The booking exists but is unpaid; it stays out of the professional's
          // queue until payment lands, and can be paid from Bookings later.
          setError(
            "Payment was not completed. Your booking is saved as pending — you can pay for it from My Bookings."
          );
          setSubmitting(false);
          onBooked?.(booking);
          return;
        }
      }

      setDone(booking);
      onBooked?.(booking);
    } catch (err) {
      setError(errorMessage(err, "Booking failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDate("");
    setTime("");
    setAddress("");
    setDescription("");
    setQuantity(1);
    setDone(null);
    setError("");
    setFieldErrors({});
  };

  const close = () => {
    reset();
    onClose?.();
  };

  // ── Confirmation ────────────────────────────────────────
  if (done) {
    return (
      <Modal open={open} onClose={close} size="sm" title="Booking confirmed">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={26} className="text-emerald-600" aria-hidden="true" />
          </span>
          <p className="text-base font-bold text-slate-900">You're booked</p>
          <p className="text-sm text-slate-500">
            {done.workerName} · {done.slotLabel}
          </p>
          <Badge status={done.status} />
          <p className="text-sm font-semibold text-slate-800">{done.priceLabel}</p>
          <p className="text-xs text-slate-400">
            {done.paymentMethod === "cash"
              ? "Pay the professional after the job is done."
              : "Payment received. A receipt is on its way to your email."}
          </p>
          <Button fullWidth onClick={close} className="mt-2">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  const busy = submitting || paying;

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Book ${worker?.category || "service"}`}
      description={worker?.name ? `with ${worker.name}` : undefined}
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Professional summary */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <Avatar src={worker?.profilePhoto} name={worker?.name} size={44} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{worker?.name}</p>
            <p className="text-xs text-slate-500">
              {worker?.experience ? `${worker.experience} yrs experience` : worker?.category}
            </p>
          </div>
        </div>

        {(error || payError) && <Alert tone="error">{error || payError}</Alert>}

        <SlotPicker
          staffId={workerId}
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          error={fieldErrors.date || fieldErrors.time}
        />

        {quote?.priceType === "hourly" && (
          <Input
            label="How many hours?"
            type="number"
            min={1}
            max={12}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
            hint="Billed per hour. You can extend on the day if needed."
          />
        )}

        <Input
          label="Service address"
          icon={MapPin}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="House / flat, street, area, city, PIN"
          error={fieldErrors.address}
          required
        />

        <Textarea
          label="What needs doing?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — a short description helps the professional come prepared."
          rows={2}
        />

        {/* Payment method */}
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-slate-600">Payment</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "cash", label: "Cash after service", icon: Banknote, enabled: true },
              {
                value: "razorpay",
                label: "Pay online now",
                icon: CreditCard,
                enabled: onlineAvailable,
              },
            ].map(({ value, label, icon: Icon, enabled }) => (
              <button
                key={value}
                type="button"
                disabled={!enabled}
                aria-pressed={method === value}
                onClick={() => setMethod(value)}
                className={cx(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
                  FOCUS_RING,
                  method === value
                    ? "border-indigo-600 bg-indigo-50"
                    : enabled
                      ? "border-slate-200 bg-white hover:border-indigo-300"
                      : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
                )}
              >
                <Icon size={16} className={method === value ? "text-indigo-600" : "text-slate-400"} />
                <span className="text-xs font-semibold text-slate-800">{label}</span>
                {!enabled && <span className="text-[10px] text-slate-400">Unavailable</span>}
              </button>
            ))}
          </div>
        </fieldset>

        <PriceBreakdown quote={quote} loading={quoteLoading} />

        <p className="flex items-start gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
          The price is set by Suvidha1 and confirmed on our servers — it cannot change after you book.
        </p>

        <Button type="submit" fullWidth size="lg" loading={busy} disabled={!quote}>
          {busy ? (
            <>
              <Spinner size={14} label="Processing" /> Processing…
            </>
          ) : method === "razorpay" ? (
            `Pay ${quote ? formatINR(quote.total) : ""} & book`
          ) : (
            `Confirm booking${quote ? ` · ${formatINR(quote.total)}` : ""}`
          )}
        </Button>
      </form>
    </Modal>
  );
}
