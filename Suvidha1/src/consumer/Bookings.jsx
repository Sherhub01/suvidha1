import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Phone, MessageCircle,
  Star, X, CheckCircle2, XCircle, AlertCircle,
  CreditCard, ChevronRight, BadgeCheck, RefreshCw,
} from "lucide-react";
import { useBookings } from "../context/BookingsContext";

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

function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(s)}
          className={`transition ${readonly ? "cursor-default" : "hover:scale-110"}`}
        >
          <Star size={22} className={s <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
        </button>
      ))}
    </div>
  );
}

function BookingModal({ booking, onClose }) {
  const { updateStatus, submitRating, cancelBooking } = useBookings();
  const [rating, setRating]       = useState(booking.rating || 0);
  const [rated, setRated]         = useState(!!booking.rating);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const meta       = STATUS[booking.status] || STATUS.Scheduled;
  const StatusIcon = meta.icon;

  const TIMELINE = [
    { label: "Booking confirmed",     done: true },
    { label: "Professional assigned", done: true },
    { label: "Service in progress",   done: booking.status === "Completed" },
    { label: "Completed",             done: booking.status === "Completed" },
  ];

  const handleCancel = () => {
    cancelBooking(booking.id);
    setConfirmCancel(false);
    onClose();
  };

  const handleRating = (val) => {
    setRating(val);
    submitRating(booking.id, val);
    setRated(true);
  };

  const handleMarkComplete = () => updateStatus(booking.id, "Completed");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-slate-200 sm:hidden" />

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
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
              <Calendar size={15} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Date</p>
                <p className="text-sm font-semibold text-slate-800">{booking.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
              <Clock size={15} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Time</p>
                <p className="text-sm font-semibold text-slate-800">{booking.time}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
              <MapPin size={15} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Address</p>
                <p className="text-sm font-semibold text-slate-800">{booking.address}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Work Description</p>
            <p className="text-sm leading-relaxed text-slate-600">{booking.description}</p>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CreditCard size={14} className="text-slate-400" />
              <span>{booking.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">{booking.price}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${PAYMENT_STYLE[booking.paymentStatus]}`}>
                {booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {booking.status !== "Cancelled" && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Progress</p>
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

          {/* Rating — completed bookings */}
          {booking.status === "Completed" && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-800">
                {rated ? "Your rating" : "Rate this service"}
              </p>
              <StarRating value={rating} onChange={handleRating} readonly={rated} />
              {rated && <p className="mt-2 text-xs text-slate-500">Thank you for your feedback!</p>}
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

            {/* Mark complete (Scheduled only) */}
            {booking.status === "Scheduled" || booking.status === "Confirmed" ? (
              <button
                onClick={handleMarkComplete}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
              >
                <CheckCircle2 size={15} /> Mark as Completed
              </button>
            ) : null}

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
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
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
    </div>
  );
}

export default function Bookings() {
  const { bookings, lastUpdated } = useBookings();
  const location = useLocation();
  const [tab, setTab]           = useState("All");
  const [selected, setSelected] = useState(null);

  // Auto-open booking if navigated from Dashboard quick-view
  useEffect(() => {
    const id = location.state?.openBookingId;
    if (id && bookings.length) {
      const found = bookings.find(b => b.id === id);
      if (found) setSelected(found);
    }
  }, [location.state, bookings]);

  const filtered = bookings.filter((b) => tab === "All" || b.status === tab);

  // When modal is open and booking changes (real-time), keep selected in sync
  const liveSelected = selected ? bookings.find((b) => b.id === selected.id) || null : null;

  const lastUpdatedStr = new Date(lastUpdated).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div className="mx-auto max-w-2xl pb-16">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage all your service bookings.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-400 shadow-sm">
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
          <p className="mt-4 font-semibold text-slate-800">No bookings found</p>
          <p className="mt-1 text-sm text-slate-500">Book a service to get started</p>
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
                className="w-full text-left rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-amber-300/60 group"
              >
                <div className="flex items-start gap-4">
                  {b.workerPhoto
                    ? <img src={b.workerPhoto} alt={b.workerName} className="h-12 w-12 rounded-xl object-cover shrink-0 ring-1 ring-slate-100" />
                    : <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600 shrink-0">{b.workerName?.[0] || "P"}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{b.workerName}</p>
                        <p className="text-xs text-slate-500">{b.service}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {b.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={11} />{b.date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{b.time}</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-800">{b.price}</span>
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
        <BookingModal booking={liveSelected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
