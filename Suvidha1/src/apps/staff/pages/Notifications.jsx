import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, Trash2, BookOpen, Calendar, MapPin,
  Phone, Clock, IndianRupee, Loader2, X, ArrowRight, RefreshCw,
} from "lucide-react";
import { T, card } from "../theme";
import { API_URL } from "../../../shared/config";
import { http } from "../../../shared/services/http";


// ── Detail Modal ─────────────────────────────────────────────────────────────
function AlertDetailModal({ alert, onClose, onAccept, onComplete }) {
  const navigate   = useNavigate();
  const b          = alert.booking || {};
  const c          = b.consumer   || {};
  const consumerName  = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer";
  const consumerPhone = c.phone || "";

  const openMaps = () => {
    if (!b.address) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl"
        style={{ background: "#0F172A", border: `1px solid ${T.cardBorder}` }}
        onClick={e => e.stopPropagation()}>
        <div className="mx-auto mt-3 h-1 w-12 rounded-full sm:hidden" style={{ background: T.cardBorder }} />

        {/* Header */}
        <div className="px-6 pt-6 pb-5" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
            style={{ color: T.subText }}>
            <X size={15} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
              🔔
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: T.heading }}>{alert.title}</p>
              <p className="text-sm mt-0.5" style={{ color: T.subText }}>
                {new Date(alert.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Booking details */}
          {b._id && (
            <div className="space-y-3">
              <div className="rounded-xl p-3 col-span-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Customer</p>
                <p className="text-sm font-semibold" style={{ color: T.heading }}>{consumerName}</p>
                {consumerPhone && <p className="text-xs mt-0.5" style={{ color: T.info }}>{consumerPhone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Service</p>
                  <p className="text-sm font-semibold" style={{ color: T.heading }}>{b.service}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Date & Time</p>
                  <p className="text-sm font-semibold" style={{ color: T.heading }}>{b.date} · {b.time}</p>
                </div>
                <div className="rounded-xl p-3 col-span-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Address</p>
                  <p className="text-sm font-semibold" style={{ color: T.heading }}>{b.address}</p>
                </div>
                {b.price && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Amount</p>
                    <p className="text-sm font-bold" style={{ color: T.success }}>{b.price}</p>
                  </div>
                )}
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.muted }}>Status</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{
                      background: b.status === "Completed" ? `${T.success}20` : b.status === "Confirmed" ? `${T.info}20` : `${T.warning}20`,
                      color: b.status === "Completed" ? T.success : b.status === "Confirmed" ? T.info : T.warning,
                    }}>{b.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            {consumerPhone && (
              <div className="flex gap-2">
                <a href={`tel:${consumerPhone}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: `${T.success}20`, color: T.success, border: `1px solid ${T.success}40` }}>
                  <Phone size={14} /> Call Customer
                </a>
                <a href={`https://wa.me/${consumerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: "#25D36620", color: "#25D366", border: "1px solid #25D36640" }}>
                  💬 WhatsApp
                </a>
              </div>
            )}
            {b.address && (
              <button onClick={openMaps}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
                style={{ background: `${T.info}20`, color: T.info, border: `1px solid ${T.info}40` }}>
                <MapPin size={14} /> Navigate to Address
              </button>
            )}
            {b.status === "Scheduled" && onAccept && (
              <button onClick={() => { onAccept(b._id); onClose(); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
                style={{ background: `${T.success}20`, color: T.success, border: `1px solid ${T.success}40` }}>
                ✅ Accept Booking
              </button>
            )}
            {(b.status === "Scheduled" || b.status === "Confirmed") && onComplete && (
              <button onClick={() => { onComplete(b._id); onClose(); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: T.primary }}>
                ✔ Mark as Completed
              </button>
            )}
            <button onClick={() => { onClose(); navigate("/staff/bookings"); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-80"
              style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.subText }}>
              View All Bookings <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StaffNotifications() {
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await http.get("/bookings/alerts");
      if (data.success) setAlerts(data.alerts);
    } catch { /* offline */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll every 15 seconds for new bookings
  useEffect(() => {
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const handleOpen = async (alert) => {
    setSelected(alert);
    if (!alert.isRead) {
      try { await http.patch(`/bookings/alerts/${alert._id}/read`); } catch { /* ignore */ }
      setAlerts(prev => prev.map(a => a._id === alert._id ? { ...a, isRead: true } : a));
    }
  };

  const markAllRead = async () => {
    try { await http.patch("/bookings/alerts/read-all"); } catch { /* ignore */ }
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const handleAccept = async (bookingId) => {
    try { await http.patch(`/bookings/${bookingId}/accept`); } catch { /* ignore */ }
    setAlerts(prev => prev.map(a =>
      a.booking?._id === bookingId
        ? { ...a, booking: { ...a.booking, status: "Confirmed" } }
        : a
    ));
  };

  const handleComplete = async (bookingId) => {
    try { await http.patch(`/bookings/${bookingId}/done`); } catch { /* ignore */ }
    setAlerts(prev => prev.map(a =>
      a.booking?._id === bookingId
        ? { ...a, booking: { ...a.booking, status: "Completed" } }
        : a
    ));
  };

  const deleteAlert = (e, id) => {
    e.stopPropagation();
    setAlerts(prev => prev.filter(a => a._id !== id));
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="mx-auto max-w-2xl pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
            <Bell size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: T.heading }}>Notifications</h1>
            <p className="text-xs" style={{ color: T.subText }}>
              {unreadCount > 0 ? `${unreadCount} new booking alert${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition hover:opacity-80"
            style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.subText }}>
            <RefreshCw size={12} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition hover:opacity-80"
              style={{ background: `${T.primary}20`, border: `1px solid ${T.primary}40`, color: T.primary }}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Live polling indicator */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs" style={{ color: T.muted }}>Live · auto-refreshes every 15s</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: T.primary }} />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl" style={card}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <Bell size={36} style={{ color: T.muted }} />
          </div>
          <p className="font-semibold" style={{ color: T.subText }}>No notifications yet</p>
          <p className="text-sm mt-1" style={{ color: T.muted }}>When a customer books you, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const b = alert.booking || {};
            const isNew = !alert.isRead;
            return (
              <button key={alert._id} onClick={() => handleOpen(alert)}
                className="w-full text-left rounded-2xl p-4 transition group cursor-pointer"
                style={{
                  background: isNew ? "rgba(236,72,153,0.08)" : T.cardBg,
                  border: `1px solid ${isNew ? T.primary + "40" : T.cardBorder}`,
                  boxShadow: isNew ? `0 0 0 1px ${T.primary}20` : "none",
                }}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
                    style={{ background: isNew ? `${T.primary}20` : "rgba(255,255,255,0.06)", border: `1px solid ${isNew ? T.primary + "30" : T.cardBorder}` }}>
                    🔔
                    {isNew && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2"
                        style={{ background: T.primary, borderColor: T.pageBg }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold leading-snug" style={{ color: isNew ? T.heading : T.text }}>
                        {alert.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] whitespace-nowrap" style={{ color: T.muted }}>
                          {new Date(alert.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <button onClick={e => deleteAlert(e, alert._id)}
                          className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white/10"
                          style={{ color: T.muted }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: T.subText }}>
                      {alert.message}
                    </p>

                    {/* Quick booking details */}
                    {b.date && (
                      <div className="mt-2 flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: T.muted }}>
                          <Calendar size={10} /> {b.date} · {b.time}
                        </span>
                        {b.price && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: T.success }}>
                            <IndianRupee size={10} /> {b.price}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded-lg"
                          style={{
                            background: b.status === "Confirmed" ? `${T.success}20` : `${T.warning}20`,
                            color: b.status === "Confirmed" ? T.success : T.warning,
                          }}>{b.status}</span>
                      </div>
                    )}

                    {isNew && (
                      <p className="mt-2 text-[11px] font-semibold" style={{ color: T.primary }}>
                        Tap to view & respond →
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <AlertDetailModal
          alert={selected}
          onClose={() => setSelected(null)}
          onAccept={handleAccept}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
