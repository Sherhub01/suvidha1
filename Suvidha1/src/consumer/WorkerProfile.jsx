import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Phone, MessageCircle, Share2, CalendarCheck,
  BadgeCheck, IndianRupee, CheckCircle2, X, Clock, Calendar,
  ArrowLeft, Loader2, Navigation,
} from "lucide-react";
import { THEME, getCategoryBySlug } from "../api";
import { useBookings } from "../context/BookingsContext";
import { session } from "../session";
import Gallery from "../components/gallery/Gallery";
import { http } from "../services/http";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "";

const TIMES = ["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"];

const AVAILABILITY_LABEL = {
  available_now: "Available now",
  today: "Free today",
  this_week: "Free this week",
  unavailable: "Currently unavailable",
};

const SAMPLE_REVIEWS = [
  { name: "Anjali Mehra",    rating: 5, comment: "Punctual and did a really neat job. Would book again." },
  { name: "Karan Malhotra",  rating: 4, comment: "Good work overall, explained the issue clearly before starting." },
  { name: "Ritu Sharma",     rating: 5, comment: "Very professional and reasonably priced. Highly recommend." },
];

// ── Simple Leaflet mini-map ──────────────────────────────────────────────────
function MiniMap({ workerCoords, userCoords }) {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!workerCoords || mapRef.current) return;
    const LCSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    const LJS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    if (!document.querySelector(`link[href="${LCSS}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = LCSS;
      document.head.appendChild(l);
    }
    const boot = () => {
      if (!ref.current) return;
      const L   = window.L;
      const map = L.map(ref.current, { zoomControl: false }).setView(workerCoords, 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap", maxZoom: 19,
      }).addTo(map);

      // Professional marker (blue)
      const proIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#4F46E5;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], className: "",
      });
      L.marker(workerCoords, { icon: proIcon }).addTo(map).bindPopup("Professional location");

      // Consumer marker (green) if available
      if (userCoords) {
        const userIcon = L.divIcon({
          html: `<div style="width:16px;height:16px;background:#10B981;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8], className: "",
        });
        L.marker(userCoords, { icon: userIcon }).addTo(map).bindPopup("Your location");
        const group = L.featureGroup([
          L.marker(workerCoords, { icon: proIcon }),
          L.marker(userCoords,   { icon: userIcon }),
        ]);
        map.fitBounds(group.getBounds().pad(0.2));
      }

      mapRef.current = map;
    };

    if (window.L) { boot(); return; }
    const s = document.createElement("script"); s.src = LJS;
    s.onload = boot; document.head.appendChild(s);

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [workerCoords, userCoords]);

  if (!workerCoords) return null;
  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100" style={{ height: 240 }}>
      <div ref={ref} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

// ── Booking form modal ───────────────────────────────────────────────────────
function BookingModal({ worker, onClose, onSuccess }) {
  const [date, setDate]       = useState("");
  const [time, setTime]       = useState("");
  const [address, setAddress] = useState(
    (session.getUser() || JSON.parse(localStorage.getItem("user") || "null"))?.address || ""
  );
  const [desc, setDesc]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const { addBooking }        = useBookings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !address.trim()) { setError("Please fill all required fields."); return; }
    setLoading(true);
    try {
      const { data } = await http.post("/bookings", {
        staffId:     worker.id,
        service:     worker.category,
        workerName:  worker.name,
        workerPhoto: worker.profilePhoto || null,
        workerPhone: worker.phone || "",
        date, time, address, description: desc,
        price: `₹${worker.price}${worker.priceType === "hourly" ? "/hr" : ""}`,
        category: worker.category,
      });
      if (data.success) addBooking(data.booking);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Book {worker.category}</h2>
            <p className="text-xs text-slate-500">with {worker.name}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-1.5 hover:bg-slate-200 transition"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Worker summary */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            {worker.profilePhoto
              ? <img src={worker.profilePhoto} alt={worker.name} className="h-12 w-12 rounded-xl object-cover" />
              : <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600">{worker.name?.[0]}</div>
            }
            <div>
              <p className="font-semibold text-slate-900 text-sm">{worker.name}</p>
              <p className="text-xs text-slate-500">₹{worker.price}{worker.priceType === "hourly" ? "/hr" : ""} · {worker.experience} yrs exp</p>
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <Star size={11} className="fill-amber-400" />{worker.rating?.toFixed(1) || "4.5"}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar size={13} /> Date <span className="text-rose-500">*</span>
            </label>
            <input type="date" min={new Date().toISOString().split("T")[0]} value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
          </div>

          {/* Time */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Clock size={13} /> Time Slot <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIMES.map(t => (
                <button key={t} type="button" onClick={() => setTime(t)}
                  className={`rounded-xl border py-2 text-xs font-medium transition ${time === t ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <MapPin size={13} /> Address <span className="text-rose-500">*</span>
            </label>
            <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Enter your full address"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 text-xs font-semibold text-slate-600 block">Work Description (optional)</label>
            <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Describe the work needed…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
          </div>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-60">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Booking…</> : <><CalendarCheck size={15} /> Confirm Booking</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Confirmed modal ──────────────────────────────────────────────────────────
function ConfirmedModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Booking Confirmed!</h2>
        <p className="mt-2 text-sm text-slate-500">Your booking has been placed. The professional will contact you shortly.</p>
        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition">
          View My Bookings
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate     = useNavigate();
  const [worker,      setWorker]      = useState(undefined);
  const [userCoords,  setUserCoords]  = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Fetch professional from backend
  useEffect(() => {
    setWorker(undefined);
    http.get(`/staff/profile/${workerId}`)
      .then(({ data }) => {
        if (data.success) {
          const sp = data.profile;
          const u  = sp.user || {};
          setWorker({
            id:           u._id,        // User._id — used as staffId when booking
            profileId:    sp._id,       // StaffProfile._id — used in URL /workers/:id
            userId:       u._id,
            name:         sp.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Professional",
            category:     sp.category || "",
            profilePhoto: sp.photo   ? `${BACKEND}${sp.photo}`   : u.avatar ? `${BACKEND}${u.avatar}` : null,
            rating:       sp.rating  || 4.5,
            reviewsCount: sp.reviewsCount || 0,
            experience:   sp.experience || 0,
            price:        sp.price   || 0,
            priceType:    sp.priceType || "fixed",
            availability: sp.status === "approved" ? "available_now" : "unavailable",
            phone:        sp.phone   || u.phone || "",
            email:        u.email    || "",
            address:      [sp.street, sp.city || sp.serviceCity, sp.state].filter(Boolean).join(", "),
            skills:       sp.skills  || [],
            certificates: sp.certificates || [],
            bio:          sp.bio     || u.bio || "",
            location:     sp.location || u.location || null,
          });
        } else {
          setWorker(null);
        }
      })
      .catch(() => setWorker(null));
  }, [workerId]);

  // Get consumer's live location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: worker?.name, url }).catch(() => {}); }
    else { navigator.clipboard?.writeText(url); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }
  };

  const openGoogleMaps = () => {
    if (!worker?.location?.coordinates) return;
    const [lng, lat] = worker.location.coordinates;
    const origin = userCoords ? `${userCoords[0]},${userCoords[1]}` : "";
    const dest   = `${lat},${lng}`;
    const url    = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Loading skeleton
  if (worker === undefined) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${THEME.card} h-80 animate-pulse lg:col-span-1`} />
        <div className={`${THEME.card} h-80 animate-pulse lg:col-span-2`} />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-base font-semibold text-gray-900">Professional not found</p>
        <p className="mt-1 text-sm text-gray-500">This profile may have been removed.</p>
        <Link to="/services" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">← Back to services</Link>
      </div>
    );
  }

  const category     = getCategoryBySlug(worker.category);
  const workerCoords = worker.location?.coordinates
    ? [worker.location.coordinates[1], worker.location.coordinates[0]]
    : null;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Link to={-1} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Profile card ── */}
        <div className={`${THEME.card} flex flex-col items-center p-6 text-center lg:col-span-1`}>
          {worker.profilePhoto
            ? <img src={worker.profilePhoto} alt={worker.name} className="h-32 w-32 rounded-3xl object-cover ring-4 ring-indigo-50" />
            : <div className="h-32 w-32 rounded-3xl bg-indigo-100 flex items-center justify-center text-5xl font-bold text-indigo-600 ring-4 ring-indigo-50">{worker.name?.[0]}</div>
          }
          <h1 className="mt-4 text-xl font-bold text-gray-900">{worker.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <BadgeCheck size={14} className="text-indigo-500" />
            {category?.name || worker.category} · {worker.experience} yrs exp
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className={THEME.ratingBadge}>
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {worker.rating.toFixed(1)}
              <span className="font-normal text-gray-400">({worker.reviewsCount} reviews)</span>
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className={THEME.locationTag}><MapPin size={11} /> {worker.address?.split(",").pop()?.trim() || "India"}</span>
            <span className={THEME.priceTag}><IndianRupee size={11} /> {worker.price}{worker.priceType === "hourly" ? "/hr" : ""}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {AVAILABILITY_LABEL[worker.availability]}
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid w-full grid-cols-2 gap-2">
            {worker.phone && (
              <a href={`tel:${worker.phone}`} className={`${THEME.outlineBtn} text-sm`}>
                <Phone size={15} /> Call
              </a>
            )}
            <button onClick={handleShare} className={`${THEME.outlineBtn} text-sm`}>
              <Share2 size={15} /> {shareCopied ? "Copied!" : "Share"}
            </button>
            <button onClick={() => setShowBooking(true)}
              className={`${THEME.primaryBtn} col-span-2 text-sm justify-center`}>
              <CalendarCheck size={15} /> Book Service
            </button>
            {workerCoords && (
              <button onClick={openGoogleMaps}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition">
                <Navigation size={14} /> Navigate to Professional
              </button>
            )}
          </div>

          {worker.bio && (
            <p className="mt-4 text-sm text-gray-500 text-left leading-relaxed">{worker.bio}</p>
          )}
        </div>

        {/* ── Details panel ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Contact */}
          <div className={`${THEME.card} p-6`}>
            <h2 className="text-base font-bold text-gray-900">Contact & Location</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {worker.phone && (
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Phone size={16} /></span>
                  <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900">{worker.phone}</p></div>
                </div>
              )}
              {worker.email && (
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><MessageCircle size={16} /></span>
                  <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{worker.email}</p></div>
                </div>
              )}
              {worker.address && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><MapPin size={16} /></span>
                  <div><p className="text-xs text-gray-500">Service Area</p><p className="text-sm font-medium text-gray-900">{worker.address}</p></div>
                </div>
              )}
            </div>

            {/* Live location map */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Live Location Map</p>
                {userCoords && workerCoords && (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live tracking active
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-[11px] text-gray-500 mb-2">
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-indigo-600 inline-block" /> Professional</span>
                {userCoords && <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" /> You</span>}
              </div>
              <MiniMap workerCoords={workerCoords} userCoords={userCoords} />
              {!workerCoords && (
                <p className="mt-2 text-xs text-gray-400 text-center">Location not shared by this professional yet.</p>
              )}
            </div>
          </div>

          {/* Skills */}
          {worker.skills?.length > 0 && (
            <div className={`${THEME.card} p-6`}>
              <h2 className="text-base font-bold text-gray-900">Skills & Certificates</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {worker.skills.map(s => (
                  <span key={s} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">{s}</span>
                ))}
              </div>
              {worker.certificates?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {worker.certificates.map(c => (
                    <span key={c} className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <BadgeCheck size={12} /> {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <Gallery mode="staff" staffId={worker.userId} editable={false} title="Past Work" />

          {/* Reviews */}
          <div className={`${THEME.card} p-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Reviews</h2>
              <span className={THEME.ratingBadge}>
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {worker.rating.toFixed(1)}
                <span className="font-normal text-gray-400">({worker.reviewsCount})</span>
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {SAMPLE_REVIEWS.map((review, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={12} className={idx < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          worker={worker}
          onClose={() => setShowBooking(false)}
          onSuccess={() => { setShowBooking(false); setShowConfirmed(true); }}
        />
      )}
      {showConfirmed && (
        <ConfirmedModal onClose={() => { setShowConfirmed(false); navigate("/bookings"); }} />
      )}
    </div>
  );
};

export default WorkerProfile;
