import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, CheckCircle, IndianRupee, Star, Users, Plus, Navigation, X, MapPin, Phone, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import StatsCard from "./components/StatsCard";
import { T, card } from "./theme";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

// Upcoming job quick-detail modal
function UpcomingJobModal({ job, onClose, onFullDetails }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl"
        style={{ background: "#0F172A", border: `1px solid ${T.cardBorder}` }}
        onClick={e => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full sm:hidden" style={{ background: T.cardBorder }} />
        <button onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
          style={{ color: T.subText }}>
          <X size={15} />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ background: "#1E3A5F" }}>🔧</div>
          <div>
            <h3 className="text-base font-bold" style={{ color: T.heading }}>{job.service}</h3>
            <p className="text-xs" style={{ color: T.subText }}>{job.customerName}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize"
            style={{ background: job.status === "Confirmed" ? `${T.success}20` : `${T.warning}20`,
              color: job.status === "Confirmed" ? T.success : T.warning,
              border: `1px solid ${job.status === "Confirmed" ? T.success+"40" : T.warning+"40"}` }}>
            {job.status}
          </span>
        </div>
        <div className="space-y-3 mb-5">
          {[
            { icon: Calendar, label: "Date & Time", value: `${job.date}, ${job.time}` },
            { icon: MapPin,   label: "Address",     value: job.address },
            { icon: Phone,    label: "Customer",    value: job.phone },
            { icon: IndianRupee, label: "Amount",   value: job.price },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <Icon size={14} className="shrink-0 mt-0.5" style={{ color: T.primary }} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: T.muted }}>{label}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: T.heading }}>{value || "—"}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          {job.phone && (
            <a href={`tel:${job.phone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
              style={{ background: `${T.success}20`, color: T.success, border: `1px solid ${T.success}40` }}>
              <Phone size={14} /> Call
            </a>
          )}
          <button onClick={onFullDetails}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90"
            style={{ background: T.primary, color: "#fff" }}>
            Full Details <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user")) || {};
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today     = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [quickJob,  setQuickJob]  = useState(null);
  const [locating,  setLocating]  = useState(false);
  const [locationMsg, setLocationMsg] = useState("");

  const loadBookings = useCallback(async () => {
    try {
      const { data } = await API.get("/bookings/staff");
      if (data.success) setBookings(data.bookings);
    } catch { /* offline */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const handleShareLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    setLocationMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await API.patch("/auth/location", {
            latitude:  pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLocationMsg("📍 Location shared!");
        } catch {
          setLocationMsg("📍 Got location (offline)");
        }
        setLocating(false);
        setTimeout(() => setLocationMsg(""), 3000);
      },
      () => { setLocating(false); setLocationMsg("Location denied."); setTimeout(() => setLocationMsg(""), 3000); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Compute stats from real bookings
  const today_str = new Date().toISOString().split("T")[0];
  const todayBookings  = bookings.filter(b => b.date === today_str).length;
  const pendingCount   = bookings.filter(b => b.status === "Scheduled").length;
  const completedCount = bookings.filter(b => b.status === "Completed").length;
  const confirmedCount = bookings.filter(b => b.status === "Confirmed").length;

  const STATS = [
    { icon: Calendar,    value: String(todayBookings),  label: "Today's Bookings", change: `${todayBookings} scheduled`, changeColor: T.info,    iconBg: "#1E3A5F", iconColor: T.info,    to: "/staff/bookings?filter=confirmed" },
    { icon: Clock,       value: String(pendingCount),   label: "Pending Jobs",    change: pendingCount > 0 ? "Action needed" : "All clear", changeColor: T.warning, iconBg: "#3B2C0A", iconColor: T.warning, to: "/staff/bookings?filter=pending" },
    { icon: CheckCircle, value: String(completedCount), label: "Completed Jobs",  change: "Total",            changeColor: T.success, iconBg: "#0A2E1A", iconColor: T.success, to: "/staff/bookings?filter=completed" },
    { icon: Users,       value: String(confirmedCount), label: "Active Jobs",     change: "Confirmed",        changeColor: T.info,    iconBg: "#0A2E2E", iconColor: "#2DD4BF", to: "/staff/bookings" },
  ];

  // Upcoming = scheduled/confirmed bookings
  const upcoming = bookings
    .filter(b => b.status === "Scheduled" || b.status === "Confirmed")
    .slice(0, 5)
    .map(b => {
      const c = b.consumer || {};
      return {
        id:           b._id,
        service:      b.service,
        address:      b.address,
        time:         b.time,
        date:         b.date,
        customerName: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer",
        phone:        c.phone || b.consumerPhone || "",
        amount:       b.price || "—",
        status:       b.status,
        bookingId:    b._id,
      };
    });

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* Profile incomplete banner */}
      {!user.profileCompleted && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">👤</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Profile incomplete</p>
              <p className="text-xs text-amber-700">Complete all 8 profile steps and submit for admin approval to start receiving jobs.</p>
            </div>
          </div>
          <button onClick={() => navigate("/staff/create-profile")}
            className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
            Complete Now
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="overflow-hidden rounded-3xl p-6 sm:p-8 flex items-center justify-between gap-4"
        style={{ background: `linear-gradient(135deg, ${T.pageBg} 0%, #1E1B4B 40%, ${T.secondary} 75%, ${T.primary} 100%)` }}>
        <div>
          <p className="text-sm font-medium" style={{ color: `${T.heading}99` }}>{today}</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl" style={{ color: T.heading }}>
            {greeting}, {user.firstName || "Professional"} 👋
          </h1>
          <p className="mt-1 max-w-md text-sm" style={{ color: `${T.heading}b3` }}>
            Here's your work summary for today.
          </p>
          {locationMsg && <p className="mt-1 text-xs" style={{ color: T.success }}>{locationMsg}</p>}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleShareLocation}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition hover:opacity-90 disabled:opacity-60 shadow"
            style={{ background: "rgba(255,255,255,0.15)", color: T.heading }}>
            {locating ? <><Loader2 size={13} className="animate-spin" /> Locating…</> : <><Navigation size={13} /> My Location</>}
          </button>
          <button
            onClick={() => navigate("/staff/bookings")}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 shadow-lg"
            style={{ background: T.primary, color: "#fff" }}>
            <Plus size={15} /> View Jobs
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <button key={i} onClick={() => navigate(s.to)}
            className="text-left rounded-2xl transition hover:scale-[1.03] active:scale-95 cursor-pointer"
            style={{ border: `1px solid ${T.cardBorder}` }}>
            <StatsCard {...s} />
          </button>
        ))}
      </div>

      {/* Upcoming jobs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: T.heading }}>Upcoming Jobs</h2>
          <button onClick={loadBookings} className="flex items-center gap-1 text-xs transition hover:opacity-70" style={{ color: T.muted }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={card}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ))
          ) : upcoming.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: T.subText }}>No upcoming jobs. New bookings will appear here.</p>
            </div>
          ) : (
            upcoming.map((j) => (
              <button key={j.id} onClick={() => setQuickJob(j)}
                className="flex items-center gap-3 rounded-xl p-3 w-full text-left transition hover:bg-white/8 group"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.cardBorder}` }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "#1E3A5F" }}>
                  <span className="text-lg">🔧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: T.heading }}>{j.service}</p>
                  <p className="text-xs truncate" style={{ color: T.subText }}>{j.customerName} · {j.address}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="rounded-lg px-2 py-1 text-[11px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.1)", color: T.text }}>{j.time}</span>
                  <p className="text-[10px] mt-0.5" style={{ color: T.muted }}>{j.date}</p>
                </div>
                <ArrowRight size={13} className="shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: T.muted }} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl p-5" style={card}>
        <h2 className="text-base font-bold mb-4" style={{ color: T.heading }}>Recent Activity</h2>
        <div className="flex flex-col">
          {bookings.slice(0, 5).length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: T.subText }}>No activity yet.</p>
          ) : bookings.slice(0, 5).map((b, i) => {
            const dotColor = b.status === "Completed" ? T.success : b.status === "Cancelled" ? T.danger : T.info;
            const c = b.consumer || {};
            return (
              <div key={b._id} className="flex items-center gap-3 py-3"
                style={i < Math.min(bookings.length, 5) - 1 ? { borderBottom: `1px solid ${T.cardBorder}` } : {}}>
                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dotColor }} />
                <span className="flex-1 text-sm" style={{ color: T.text }}>
                  {b.status} · {b.service} · {`${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer"}
                </span>
                <span className="shrink-0 text-xs" style={{ color: T.muted }}>{b.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {quickJob && (
        <UpcomingJobModal
          job={quickJob}
          onClose={() => setQuickJob(null)}
          onFullDetails={() => {
            setQuickJob(null);
            navigate("/staff/bookings", { state: { openBookingId: quickJob.bookingId } });
          }}
        />
      )}
    </div>
  );
}
