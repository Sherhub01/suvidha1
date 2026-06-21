import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList, ArrowRight, X, Calendar, Clock, MapPin,
  CreditCard, ChevronRight, Navigation, Loader2,
} from "lucide-react";
import ServiceCard from "./components/ServiceCard";
import WorkerCard from "./components/WorkerCard";
import { THEME, SERVICES } from "../api";
import API from "../api";
import { useBookings } from "../context/BookingsContext";
import axios from "axios";

const BACKEND_API = axios.create({ baseURL: "http://localhost:5000/api" });
BACKEND_API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const STATUS_STYLES = {
  Scheduled: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-rose-50 text-rose-600",
  Confirmed: "bg-indigo-50 text-indigo-700",
  pending:   "bg-amber-50 text-amber-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-600",
};

const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Dashboard = () => {
  const now = useClock();
  const navigate = useNavigate();
  const { bookings: liveBookings } = useBookings();
  const [nearbyStaff, setNearbyStaff] = useState(null);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );
  const [quickView, setQuickView] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");

  useEffect(() => {
    API.get("/me").then((r) => setCurrentUser(r.data.user)).catch(() => {});
    // Load nearby approved staff
    BACKEND_API.get("/bookings/approved-staff")
      .then((r) => r.data.success && setNearbyStaff(r.data.staff.slice(0, 4)))
      .catch(() => setNearbyStaff([]));
  }, []);

  const handleShareLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    setLocationMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await API.patch("/location", {
            latitude:  pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLocationMsg("📍 Location updated!");
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

  const recentBookings = liveBookings.slice(0, 3);
  const formattedDate = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const formattedTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Profile incomplete banner */}
      {!currentUser.profileCompleted && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">👤</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Complete your profile</p>
              <p className="text-xs text-amber-700">Add your address and photo to get better professional matches.</p>
            </div>
          </div>
          <Link to="/settings"
            className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
            Complete Now
          </Link>
        </div>
      )}
      <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0F172A_0%,#1E3A5F_40%,#1E40AF_70%,#0EA5E9_100%)] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/60">{formattedDate} · {formattedTime}</p>
            <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              Welcome back, {currentUser.firstName || "there"} 👋
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              Find trusted professionals near {currentUser.address || "your city"}.
            </p>
          </div>
          <button
            onClick={handleShareLocation}
            disabled={locating}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25 disabled:opacity-60"
          >
            {locating ? <><Loader2 size={13} className="animate-spin" /> Locating…</> : <><Navigation size={13} /> My Location</>}
          </button>
        </div>
        {locationMsg && <p className="mt-2 text-xs text-white/80">{locationMsg}</p>}
      </section>

      {/* Featured services */}
      <section>
        <SectionHeader
          title="Featured services"
          subtitle="Tap a category to find verified professionals near you"
          action={
            <Link to="/services" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICES.slice(0, 10).map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      {/* Nearby staff from backend */}
      <section>
        <SectionHeader
          title="Available professionals"
          subtitle="Approved and verified near you"
          action={
            <Link to="/services" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          }
        />
        {nearbyStaff === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${THEME.card} h-48 animate-pulse p-4`} />
            ))}
          </div>
        ) : nearbyStaff.length === 0 ? (
          <div className={`${THEME.card} p-8 text-center text-sm text-gray-500`}>
            No professionals available yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearbyStaff.map((sp) => {
              const u = sp.user || {};
              const worker = {
                id:           sp._id,
                name:         sp.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
                category:     sp.category || "",
                profilePhoto: sp.photo ? `http://localhost:5000${sp.photo}` : (u.avatar ? `http://localhost:5000${u.avatar}` : null),
                rating:       4.5,
                reviewsCount: 0,
                experience:   sp.experience || 0,
                price:        0,
                priceType:    "fixed",
                availability: "available_now",
                distance:     "",
                phone:        u.phone || "",
                address:      sp.serviceCity || "",
                skills:       sp.skills || [],
              };
              return <WorkerCard key={sp._id} worker={worker} />;
            })}
          </div>
        )}
      </section>

      {/* Recent bookings */}
      <section>
        <SectionHeader title="Recent requests" subtitle="Your latest bookings and their status" />
        {recentBookings.length === 0 ? (
          <div className={`${THEME.card} flex flex-col items-center justify-center px-6 py-12 text-center`}>
            <ClipboardList size={28} className="mb-3 text-gray-400" />
            <h3 className="text-base font-semibold text-gray-900">No bookings yet</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Once you book a professional, your requests will show up here.
            </p>
            <Link to="/services" className="mt-4 text-sm font-semibold text-indigo-600 hover:underline">
              Browse services
            </Link>
          </div>
        ) : (
          <div className={`${THEME.card} divide-y divide-gray-100 p-2`}>
            {recentBookings.map((b) => (
              <button
                key={b.id}
                onClick={() => setQuickView(b)}
                className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 rounded-xl transition group"
              >
                {b.workerPhoto ? (
                  <img src={b.workerPhoto} alt={b.workerName}
                    className="h-10 w-10 rounded-full border border-gray-100 object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                    {b.workerName?.[0] || "P"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{b.workerName}</p>
                  <p className="text-xs text-gray-500">{b.service} · {b.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-gray-900">{b.price}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[b.status?.toLowerCase()] || ""}`}>
                    {b.status}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Quick-view mini modal */}
      {quickView && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setQuickView(null)}
        >
          <div
            className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
            <button onClick={() => setQuickView(null)}
              className="absolute top-4 right-4 rounded-full bg-slate-100 p-1.5 hover:bg-slate-200 transition">
              <X size={14} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              {quickView.workerPhoto
                ? <img src={quickView.workerPhoto} alt={quickView.workerName} className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-100" />
                : <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600">{quickView.workerName?.[0]||"P"}</div>
              }
              <div>
                <p className="font-semibold text-slate-900">{quickView.workerName}</p>
                <p className="text-xs text-slate-500">{quickView.service}</p>
              </div>
              <span className={`ml-auto inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[quickView.status?.toLowerCase()] || ""}`}>
                {quickView.status}
              </span>
            </div>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={13} className="text-indigo-500 shrink-0" /><span>{quickView.date}</span>
                {quickView.time && <><span className="text-slate-300">·</span><Clock size={13} className="text-indigo-500 shrink-0" /><span>{quickView.time}</span></>}
              </div>
              {quickView.address && (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin size={13} className="text-indigo-500 shrink-0 mt-0.5" /><span>{quickView.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CreditCard size={13} className="text-indigo-500 shrink-0" />
                <span className="font-semibold text-slate-900">{quickView.price}</span>
                {quickView.paymentStatus && <span className="text-xs text-slate-400">· {quickView.paymentStatus}</span>}
              </div>
            </div>
            <button
              onClick={() => { setQuickView(null); navigate("/bookings", { state: { openBookingId: quickView.id } }); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              View Full Details <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
