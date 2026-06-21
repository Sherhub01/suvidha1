import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock, CheckCircle2, Clock3, XCircle,
  X, Calendar, Clock, MapPin, CreditCard, ArrowRight,
} from "lucide-react";
import { recentRequests, mockBookings } from "../../data/mockData";

const STATUS_STYLES = {
  Completed: { icon: CheckCircle2, classes: "bg-emerald-100 text-emerald-600" },
  Scheduled: { icon: Clock3,       classes: "bg-amber-100 text-amber-600" },
  Cancelled: { icon: XCircle,      classes: "bg-rose-100 text-rose-500" },
};

const QUICK_STATUS = {
  Scheduled: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-rose-50 text-rose-600",
};

export default function RecentRequests() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const booking = selected
    ? mockBookings.find((b) => b.id === selected.bookingId)
    : null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-slate-800">Recent requests</h2>

      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-900/5">
        {recentRequests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <CalendarClock size={28} className="text-slate-400" />
            <p className="text-sm text-slate-500">
              No bookings yet — your service history will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentRequests.map((req) => {
              const status = STATUS_STYLES[req.status];
              const StatusIcon = status.icon;
              return (
                <li
                  key={req.id}
                  onClick={() => setSelected(req)}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 cursor-pointer group"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${status.classes}`}>
                    <StatusIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {req.service}{" "}
                      <span className="font-normal text-slate-500">with {req.worker}</span>
                    </p>
                    <p className="text-xs text-slate-400">{req.date}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}>
                    {req.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick-view modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 rounded-full bg-slate-100 p-1.5 hover:bg-slate-200 transition"
            >
              <X size={14} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              {booking?.workerPhoto && (
                <img
                  src={booking.workerPhoto}
                  alt={selected.worker}
                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{selected.worker}</p>
                <p className="text-xs text-slate-500">{selected.service}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${QUICK_STATUS[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            {/* Short details */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={13} className="text-indigo-500 shrink-0" />
                <span>{selected.date}</span>
                {booking?.time && (
                  <>
                    <span className="text-slate-300">·</span>
                    <Clock size={13} className="text-indigo-500 shrink-0" />
                    <span>{booking.time}</span>
                  </>
                )}
              </div>
              {booking?.address && (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span>{booking.address}</span>
                </div>
              )}
              {booking?.price && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CreditCard size={13} className="text-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-900">{booking.price}</span>
                  {booking.paymentStatus && (
                    <span className="text-xs text-slate-400">· {booking.paymentStatus}</span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSelected(null);
                navigate("/bookings", { state: { openBookingId: selected.bookingId } });
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              View Full Details <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
