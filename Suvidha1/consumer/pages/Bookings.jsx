import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Phone, MessageCircle,
  Star, X, CheckCircle2, XCircle, AlertCircle,
  CreditCard, ChevronRight, BadgeCheck, RefreshCw,
} from "lucide-react";
import { useBookings } from "../context/BookingsContext";
import ReviewDialog from "../../shared/components/reviews/ReviewDialog";
import { Stars } from "../../shared/components/reviews/StarRating";
import { Button, Alert, Badge } from "../../shared/ui/index";
import useRazorpay from "../../shared/hooks/useRazorpay";
import { errorMessage } from "../../shared/services/http";
import { Modal } from "../../shared/ui";

const STATUS = {
  Scheduled: { bg: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-500",    icon: AlertCircle  },
  Confirmed: { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500",  icon: CheckCircle2 },
  Completed: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
  Cancelled: { bg: "bg-rose-50 text-rose-600 border-rose-200",     dot: "bg-rose-500",    icon: XCircle      },
};

const PAYMENT_STYLE = {
  Paid:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending:  "bg-amber-50 text-amber-700 border-amber-200",
  Refunded: "bg-slate-100 text-slate-600 border-slate-200",
};

const TABS = ["All", "Scheduled", "Confirmed", "Completed", "Cancelled"];

function BookingModal({ booking, onClose }) {
  const { cancelBooking, reload } = useBookings();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rated, setRated] = useState(Boolean(booking.rating));
  const [error, setError] = useState("");
  const [refundNote, setRefundNote] = useState("");

  const { pay, processing: paying, error: payError } = useRazorpay();

  // An online booking that was never paid stays out of the professional's
  // queue; the customer can settle it here.
  const awaitingPayment =
    booking.paymentMethod === "razorpay" && booking.paymentStatus === "Pending";

  const meta       = STATUS[booking.status] || STATUS.Scheduled;
  const StatusIcon = meta.icon;

  const TIMELINE = [
    { label: "Booking confirmed",     done: true },
    { label: "Professional assigned", done: true },
    { label: "Service in progress",   done: booking.status === "Completed" },
    { label: "Completed",             done: booking.status === "Completed" },
  ];

  const handleCancel = async () => {
    setError("");
    try {
      const refund = await cancelBooking(booking.id);
      setConfirmCancel(false);
      if (refund?.amount > 0) {
        setRefundNote(`₹${refund.amount} will be refunded. ${refund.reason}`);
      } else {
        onClose();
      }
    } catch (err) {
      setError(errorMessage(err, "Could not cancel this booking."));
    }
  };

  const handlePayNow = async () => {
    const result = await pay({
      bookingId: booking.id,
      description: `${booking.service} · ${booking.slotLabel || booking.date}`,
    });
    if (result?.paid) reload();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      hideHeader
      ariaLabel={`Booking details: ${booking.service}`}
      bodyClassName="p-0"
    >
      <div>

        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl sm:rounded-t-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 pt-6 pb-8 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            {booking.workerPhoto
              ? <img src={booking.workerPhoto} alt={booking.workerName} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/30" />
              : <div className="h-14 w-14 rounded-2xl bg-indigo-500/30 flex items-center justify-center text-2xl font-bold text-white">{booking.workerName?.[0] || "P"}</div>
            }
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold">{booking.workerName}</h2>
                <BadgeCheck size={16} className="text-amber-400" />
              </div>
              <p className="text-sm text-white/70">{booking.service}</p>
              <p className="text-xs text-white/50 mt-0.5">{booking.workerPhone}</p>
            </div>
          </div>
          <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {booking.status}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Date / Time / Address */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <Calendar size={15} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Date</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{booking.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <Clock size={15} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Time</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{booking.time}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <MapPin size={15} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Address</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{booking.address}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Work Description</p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{booking.description}</p>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CreditCard size={14} className="text-slate-400 dark:text-slate-500" />
              <span>{booking.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-slate-50">{booking.price}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${PAYMENT_STYLE[booking.paymentStatus]}`}>
                {booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {booking.status !== "Cancelled" && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Progress</p>
              <ol className="space-y-2.5">
                {TIMELINE.map((step, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {step.done ? "✓" : i + 1}
                    </span>
                    <span className={`text-sm ${step.done ? "font-medium text-slate-800" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(error || payError) && <Alert tone="error">{error || payError}</Alert>}
          {refundNote && <Alert tone="success">{refundNote}</Alert>}

          {/* Unpaid online booking */}
          {awaitingPayment && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Payment pending</p>
              <p className="mt-0.5 text-xs text-amber-700">
                This booking is not confirmed with the professional until it is paid.
              </p>
              <Button className="mt-3" fullWidth loading={paying} onClick={handlePayNow}>
                Pay {booking.price} now
              </Button>
            </div>
          )}

          {/* Review — completed bookings only */}
          {booking.status === "Completed" && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {rated ? "Your review" : "How did it go?"}
              </p>
              {rated ? (
                <div className="flex items-center gap-2">
                  <Stars value={booking.rating} size={16} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Thanks for the feedback.</span>
                </div>
              ) : (
                <Button size="sm" onClick={() => setReviewOpen(true)}>
                  Write a review
                </Button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Call / WhatsApp */}
            <div className="flex gap-3">
              <a
                href={`tel:${booking.workerPhone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-95"
              >
                <Phone size={15} /> Call Now
              </a>
              <a
                href={`https://wa.me/${booking.workerPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition hover:bg-[#1db954] active:scale-95"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>

            {/* Completion is the professional's action, not the customer's. */}
            {(booking.status === "Confirmed" || booking.status === "InProgress") && (
              <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                {booking.workerName} will mark this job complete once the work is done.
              </p>
            )}

            {/* Cancel (Scheduled only) */}
            {(booking.status === "Scheduled" || booking.status === "Confirmed") && !confirmCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition"
              >
                <XCircle size={15} /> Cancel Booking
              </button>
            )}

            {confirmCancel && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-700 mb-3">Cancel this booking?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 rounded-xl bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewDialog
        open={reviewOpen}
        booking={{ ...booking, _id: booking.id }}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => { setRated(true); reload(); }}
      />
    </Modal>
  );
}

export default function Bookings() {
  const { bookings, lastUpdated } = useBookings();
  const location = useLocation();
  const [tab, setTab]           = useState("All");
  const [selected, setSelected] = useState(null);
  // Set once the user closes a dialog that was opened from a navigation state,
  // so it does not immediately reopen.
  const [dismissed, setDismissed] = useState(false);

  const filtered = bookings.filter((b) => tab === "All" || b.status === tab);

  // Derived during render rather than copied into state by an effect. This also
  // keeps the open dialog in sync as the polled bookings list refreshes.
  const requestedId = location.state?.openBookingId;
  const liveSelected =
    (selected && bookings.find((b) => b.id === selected.id)) ||
    (!dismissed && requestedId ? bookings.find((b) => b.id === requestedId) : null) ||
    null;

  const lastUpdatedStr = new Date(lastUpdated).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div className="mx-auto max-w-2xl pb-16">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">My Bookings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track and manage all your service bookings.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
          <RefreshCw size={11} className="animate-spin" style={{ animationDuration: "3s" }} />
          Live · {lastUpdatedStr}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map((t) => {
          const count = bookings.filter((b) => t === "All" || b.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? "bg-slate-900 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-900/20 hover:text-slate-900"
              }`}
            >
              {t}
              <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                tab === t ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Calendar size={48} className="text-slate-200" />
          <p className="mt-4 font-semibold text-slate-800 dark:text-slate-100">No bookings found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Book a service to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const meta = STATUS[b.status] || STATUS.Scheduled;
            const StatusIcon = meta.icon;
            return (
              <button
                key={b.id}
                onClick={() => setSelected(b)}
                className="w-full text-left rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-amber-300/60 group dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-4">
                  {b.workerPhoto
                    ? <img src={b.workerPhoto} alt={b.workerName} className="h-12 w-12 rounded-xl object-cover shrink-0 ring-1 ring-slate-100" />
                    : <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600 shrink-0">{b.workerName?.[0] || "P"}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm dark:text-slate-50">{b.workerName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{b.service}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {b.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={11} />{b.date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{b.time}</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-100">{b.price}</span>
                      {b.rating && (
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star size={11} className="fill-amber-400" /> {b.rating}/5
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-slate-300 mt-1 group-hover:text-amber-500 transition" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {liveSelected && (
        <BookingModal
          booking={liveSelected}
          onClose={() => { setSelected(null); setDismissed(true); }}
        />
      )}
    </div>
  );
}
