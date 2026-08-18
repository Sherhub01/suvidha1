import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { X, MapPin, Phone, MessageCircle, CheckCircle, XCircle, Navigation, CreditCard, Star, RefreshCw } from "lucide-react";
import { T, card } from "../theme";
import { API_URL } from "../../shared/config";
import { http } from "../../shared/services/http";
import { Modal } from "../../shared/ui";
import useApiData from "../../shared/hooks/useApiData";


const STATUS_COLORS = {
  Scheduled: { bg: `${T.warning}20`,  color: T.warning,  border: `${T.warning}40`  },
  Confirmed: { bg: `${T.info}20`,     color: T.info,     border: `${T.info}40`     },
  Completed: { bg: `${T.success}20`,  color: T.success,  border: `${T.success}40`  },
  Cancelled: { bg: `${T.danger}20`,   color: T.danger,   border: `${T.danger}40`   },
};

const FILTERS = ["All", "Scheduled", "Confirmed", "Completed", "Cancelled"];

function BookingDetailModal({ booking: b, onClose, onAccept, onComplete }) {
  const sc = STATUS_COLORS[b.status] || STATUS_COLORS.Scheduled;
  const c  = b.consumer || {};
  const customerName  = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer";
  const customerPhone = c.phone || b.consumerPhone || "";

  const navigate2Google = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      hideHeader
      ariaLabel={`Booking details: ${b.service}`}
      panelStyle={{ background: "#0F172A", border: `1px solid ${T.cardBorder}` }}
      bodyClassName="p-0"
    >
      <div className="relative">

        {/* Header */}
        <div className="relative px-6 pt-6 pb-5" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
            style={{ color: T.subText }}>
            <X size={15} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6D28D9,#4F46E5)" }}>
              {customerName[0] || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold" style={{ color: T.heading }}>{customerName}</p>
              <p className="text-sm" style={{ color: T.subText }}>{b.service}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="rounded-lg px-3 py-1 text-xs font-semibold capitalize"
              style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{b.status}</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 col-span-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Description</p>
              <p className="text-sm" style={{ color: T.text }}>{b.description || "No description"}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Date & Time</p>
              <p className="text-sm font-semibold" style={{ color: T.heading }}>{b.date} · {b.time}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Phone</p>
              {customerPhone
                ? <a href={`tel:${customerPhone}`} className="text-sm font-semibold" style={{ color: T.info }}>{customerPhone}</a>
                : <p className="text-sm" style={{ color: T.muted }}>N/A</p>
              }
            </div>
            <div className="rounded-xl p-3 col-span-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Address</p>
              <p className="text-sm font-semibold" style={{ color: T.heading }}>{b.address}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}` }}>
            <div className="flex items-center gap-2" style={{ color: T.subText }}>
              <CreditCard size={14} /><span className="text-sm">{b.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold" style={{ color: T.heading }}>{b.price}</span>
              <span className="rounded-lg px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ background: b.paymentStatus === "Paid" ? `${T.success}20` : `${T.warning}20`,
                  color: b.paymentStatus === "Paid" ? T.success : T.warning }}>{b.paymentStatus}</span>
            </div>
          </div>

          {/* Rating if given */}
          {b.rating && (
            <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <Star size={14} className="fill-current" style={{ color: T.warning }} />
              <span className="text-sm font-semibold" style={{ color: T.heading }}>{b.rating}/5 — Customer rating</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-3">
              {customerPhone && (
                <a href={`tel:${customerPhone}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: `${T.success}20`, color: T.success, border: `1px solid ${T.success}40` }}>
                  <Phone size={14} /> Call
                </a>
              )}
              {customerPhone && (
                <a href={`https://wa.me/${customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: "#25D36620", color: "#25D366", border: "1px solid #25D36640" }}>
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
            </div>
            <button onClick={navigate2Google}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
              style={{ background: `${T.info}20`, color: T.info, border: `1px solid ${T.info}40` }}>
              <Navigation size={14} /> Navigate to Location
            </button>

            {b.status === "Scheduled" && (
              <button onClick={() => onAccept(b._id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
                style={{ background: `${T.success}20`, color: T.success, border: `1px solid ${T.success}40` }}>
                <CheckCircle size={14} /> Confirm Job
              </button>
            )}

            {(b.status === "Scheduled" || b.status === "Confirmed") && (
              <button onClick={() => onComplete(b._id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
                style={{ background: T.primary, color: "#fff" }}>
                <CheckCircle size={14} /> Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Bookings() {
  const location = useLocation();
  // null means "follow the ?filter= in the URL"; a value means the user picked one.
  const [filter,   setFilter]   = useState(null);
  const [selected, setSelected] = useState(null);
  // Set when a dialog opened from navigation state is closed, so it stays closed.
  const [dismissed, setDismissed] = useState(false);

  const fetchBookings = useCallback(async ({ signal }) => {
    const { data } = await http.get("/bookings/staff", { signal });
    return data.success ? data.bookings : [];
  }, []);

  const { data: bookings, loading, setData: setBookings, reload: load } =
    useApiData(fetchBookings, { initial: [] });

  // Both of these are derived from the URL during render rather than copied
  // into state by an effect.
  const urlFilter = new URLSearchParams(location.search).get("filter");
  const activeFilter =
    filter ?? (urlFilter ? urlFilter.charAt(0).toUpperCase() + urlFilter.slice(1) : "All");

  const requestedId = location.state?.openBookingId;
  const liveSelected =
    (selected && bookings.find((b) => (b._id || b.id) === (selected._id || selected.id))) ||
    (!dismissed && requestedId
      ? bookings.find((b) => b._id === requestedId || b.id === requestedId)
      : null) ||
    null;

  const filtered = activeFilter === "All" ? bookings : bookings.filter(b => b.status === activeFilter);

  const handleAccept = async (id) => {
    try { await http.patch(`/bookings/${id}/accept`); } catch { /* optimistic */ }
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "Confirmed" } : b));
    setSelected(null);
  };

  const handleComplete = async (id) => {
    try { await http.patch(`/bookings/${id}/done`); } catch { /* optimistic */ }
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "Completed" } : b));
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: T.heading }}>Bookings</h1>
          <p className="text-sm mt-0.5" style={{ color: T.subText }}>{filtered.length} booking{filtered.length !== 1 ? "s" : ""} shown</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={load} className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition hover:opacity-70"
            style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.subText }}>
            <RefreshCw size={12} /> Refresh
          </button>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold transition"
                style={activeFilter === f
                  ? { background: T.primary, color: "#fff" }
                  : { background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.subText }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}` }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={card}>
            <p className="text-sm" style={{ color: T.subText }}>No {filter.toLowerCase()} bookings found.</p>
          </div>
        ) : filtered.map((b) => {
          const sc = STATUS_COLORS[b.status] || STATUS_COLORS.Scheduled;
          const c  = b.consumer || {};
          const customerName = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer";
          return (
            <button key={b._id} onClick={() => setSelected(b)}
              className="rounded-2xl p-4 w-full text-left transition hover:ring-2 cursor-pointer group"
              style={{ ...card }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#6D28D9,#4F46E5)" }}>
                  {customerName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: T.heading }}>{customerName}</p>
                  <p className="text-xs truncate" style={{ color: T.subText }}>{b.service}</p>
                </div>
                <span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold capitalize"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{b.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["📍", b.address],
                  ["🕐", `${b.date} · ${b.time}`],
                  [b.price || "—", b.paymentStatus],
                ].map(([icon, txt], j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs" style={{ color: T.subText }}>
                    <span>{icon}</span>{txt}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-right" style={{ color: T.primary }}>Tap for full details →</p>
            </button>
          );
        })}
      </div>

      {liveSelected && (
        <BookingDetailModal
          booking={liveSelected}
          onClose={() => { setSelected(null); setDismissed(true); }}
          onAccept={handleAccept}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
