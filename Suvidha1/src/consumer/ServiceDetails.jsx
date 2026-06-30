import { useEffect, useState, useRef } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowRight, IndianRupee, MapPin, Star, Loader2,
  ShieldCheck, Clock, BadgeCheck, Navigation, Search,
  Phone, CalendarCheck, ChevronRight,
} from "lucide-react";
import { THEME, getCategoryBySlug } from "../api";
import axios from "axios";

const BACKEND = "http://localhost:5000";
const BAPI = axios.create({ baseURL: `${BACKEND}/api` });
BAPI.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

// Haversine distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function normaliseStaff(sp, userCoords) {
  const u   = sp.user || {};
  const loc = sp.location || u.location;
  let distance = "";
  if (userCoords && loc?.coordinates) {
    const [lng, lat] = loc.coordinates;
    distance = `${getDistance(userCoords[0], userCoords[1], lat, lng)} km`;
  }
  return {
    id:           sp._id,
    name:         sp.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Professional",
    category:     sp.category || "",
    profilePhoto: sp.photo ? `${BACKEND}${sp.photo}` : u.avatar ? `${BACKEND}${u.avatar}` : null,
    rating:       sp.rating || 4.5,
    reviewsCount: sp.reviewsCount || 0,
    experience:   sp.experience || 0,
    price:        sp.price || 0,
    priceType:    sp.priceType || "fixed",
    availability: "available_now",
    distance,
    phone:        sp.phone || u.phone || "",
    address:      sp.serviceCity || sp.city || "",
    skills:       sp.skills || [],
    location:     loc || null,
  };
}

// Leaflet mini-map
function ServiceMap({ workers, userCoords }) {
  const ref    = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!workers.length && !userCoords) return;
    const LCSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    const LJS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    if (!document.querySelector(`link[href="${LCSS}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = LCSS;
      document.head.appendChild(l);
    }
    const boot = () => {
      if (!ref.current || mapRef.current) return;
      const L   = window.L;
      const center = userCoords || (workers[0]?.location?.coordinates ? [workers[0].location.coordinates[1], workers[0].location.coordinates[0]] : [28.6139, 77.209]);
      const map = L.map(ref.current, { zoomControl: true }).setView(center, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 }).addTo(map);

      // User marker
      if (userCoords) {
        L.marker(userCoords, {
          icon: L.divIcon({
            html: `<div style="width:16px;height:16px;background:#4F46E5;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(79,70,229,0.5)"></div>`,
            iconSize: [16, 16], iconAnchor: [8, 8], className: "",
          }),
        }).addTo(map).bindPopup("<b>📍 Your Location</b>");
      }

      // Professional markers
      workers.forEach(w => {
        if (!w.location?.coordinates) return;
        const [lng, lat] = w.location.coordinates;
        const photo = w.profilePhoto
          ? `<img src="${w.profilePhoto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid #eee"/>`
          : `<div style="width:40px;height:40px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;font-weight:700;color:#4F46E5">${w.name?.[0]}</div>`;
        L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 32 42"><path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z" fill="#10B981" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/></svg>`,
            iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -38], className: "",
          }),
        }).addTo(map).bindPopup(`
          <div style="width:200px;font-family:sans-serif">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">${photo}<div><p style="margin:0;font-weight:700;font-size:13px">${w.name}</p><p style="margin:0;color:#6B7280;font-size:11px">${w.distance ? w.distance + " away" : ""}</p></div></div>
            <a href="/workers/${w.id}" style="display:block;background:#4F46E5;color:#fff;text-align:center;padding:6px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600">View & Book →</a>
          </div>`);
      });

      mapRef.current = map;
    };

    if (window.L) { boot(); return; }
    const s = document.createElement("script"); s.src = LJS; s.onload = boot; document.head.appendChild(s);
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [workers, userCoords]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 320 }}>
      <div ref={ref} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

// Professional card with distance
function ProCard({ worker }) {
  const navigate = useNavigate();
  return (
    <div className={`${THEME.cardHover} flex flex-col p-4 cursor-pointer`}
      onClick={() => navigate(`/workers/${worker.id}`)}>
      <div className="flex items-start gap-3">
        {worker.profilePhoto
          ? <img src={worker.profilePhoto} alt={worker.name} className="h-14 w-14 rounded-2xl object-cover border border-gray-100 shrink-0" />
          : <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 shrink-0">{worker.name?.[0]}</div>
        }
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">{worker.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-amber-700">{worker.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({worker.reviewsCount})</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{worker.experience}yr exp</span>
          </div>
          {worker.distance && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={10} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">{worker.distance} away</span>
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-gray-900">₹{worker.price}</p>
          <p className="text-[10px] text-gray-400">{worker.priceType === "hourly" ? "/hr" : "/visit"}</p>
        </div>
      </div>

      {worker.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {worker.skills.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600 font-medium">{s}</span>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {worker.phone && (
          <a href={`tel:${worker.phone}`} onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition">
            <Phone size={11} /> Call
          </a>
        )}
        <button onClick={e => { e.stopPropagation(); navigate(`/workers/${worker.id}`); }}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition">
          <CalendarCheck size={11} /> Book Now
        </button>
        {worker.location?.coordinates && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${worker.location.coordinates[1]},${worker.location.coordinates[0]}`}
            target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition">
            <Navigation size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

const ServiceDetails = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchTerm  = searchParams.get("search") || "";
  const category    = getCategoryBySlug(categoryId);

  const [workers,    setWorkers]    = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [locating,   setLocating]   = useState(false);

  // Get consumer live location
  useEffect(() => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      pos => { setUserCoords([pos.coords.latitude, pos.coords.longitude]); setLocating(false); },
      ()  => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Fetch real staff from backend
  useEffect(() => {
    setWorkers(null);
    const params = new URLSearchParams({ status: "approved" });
    if (category) params.set("category", categoryId);
    else if (searchTerm) params.set("search", searchTerm);
    BAPI.get(`/staff/admin/list?${params.toString()}`)
      .then(({ data }) => {
        let list = (data.profiles || []).map(sp => normaliseStaff(sp, userCoords));
        // Sort by distance if we have user location
        if (userCoords) list.sort((a, b) => parseFloat(a.distance || 999) - parseFloat(b.distance || 999));
        setWorkers(list.slice(0, 8));
      })
      .catch(() => setWorkers([]));
  }, [categoryId, searchTerm, userCoords]); // eslint-disable-line react-hooks/exhaustive-deps

  const Icon = category?.icon;

  // ── No-category search results ──
  if (!category) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#312E81_0%,#4F46E5_30%,#7C3AED_60%,#06B6D4_100%)] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-white/80 mb-2"><Search size={16} /><span className="text-sm font-medium">Search results</span></div>
          <h1 className="text-2xl font-extrabold text-white">{searchTerm ? `Results for "${searchTerm}"` : "All professionals"}</h1>
        </div>
        {!workers ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`${THEME.card} h-48 animate-pulse`} />)}
          </div>
        ) : workers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">No professionals found{searchTerm ? ` for "${searchTerm}"` : ""}.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workers.map(w => <ProCard key={w.id} worker={w} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* ── Hero banner ── */}
      <section className="overflow-hidden rounded-3xl relative" style={{ minHeight: 220 }}>
        <img src={category.bg} alt={category.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(49,46,129,0.85) 0%, rgba(79,70,229,0.75) 40%, rgba(6,182,212,0.7) 100%)" }} />
        <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md border border-white/20">
                {Icon && <Icon size={28} />}
              </span>
              <div>
                <h1 className="text-3xl font-extrabold text-white">{category.name}</h1>
                <p className="text-sm text-white/75 mt-1 max-w-lg">{category.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                <ShieldCheck size={12} /> Verified Professionals
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                <Clock size={12} /> Same-day availability
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                <BadgeCheck size={12} /> Service Guarantee
              </span>
            </div>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 px-5 py-4 text-center">
            <p className="text-xs text-white/70 mb-1">Starting from</p>
            <div className="flex items-center gap-1 justify-center">
              <IndianRupee size={20} className="text-white font-bold" />
              <span className="text-3xl font-extrabold text-white">{category.startingPrice}</span>
            </div>
            <p className="text-xs text-white/70 mt-1">{category.priceType === "hourly" ? "per hour" : "per visit"}</p>
          </div>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className={`${THEME.card} p-6`}>
        <h2 className="text-base font-bold text-gray-900 mb-4">What's included</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, label: "Background-verified professional", color: "text-indigo-600 bg-indigo-50" },
            { icon: Clock,       label: "On-time arrival guarantee",        color: "text-amber-600 bg-amber-50"  },
            { icon: BadgeCheck,  label: "Quality assurance & re-visit",    color: "text-emerald-600 bg-emerald-50" },
            { icon: Navigation,  label: "Real-time GPS tracking",           color: "text-blue-600 bg-blue-50"    },
          ].map(({ icon: Ic, label, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Ic size={16} />
              </span>
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Location status ── */}
      {(locating || userCoords) && (
        <div className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm ${userCoords ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
          {locating
            ? <><Loader2 size={15} className="text-amber-500 animate-spin shrink-0" /><span className="text-amber-700">Detecting your location to find nearest professionals…</span></>
            : <><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" /><span className="text-emerald-700 font-medium">Your location detected — professionals sorted by distance!</span></>
          }
        </div>
      )}

      {/* ── Nearby professionals ── */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {userCoords ? "Nearby " : "Available "}{category.name}s
              {workers !== null && <span className="ml-2 text-base font-normal text-gray-400">({workers.length})</span>}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {userCoords ? "Sorted by distance from your location" : "Verified professionals ready to help"}
            </p>
          </div>
          <Link to={`/services/${category.slug}/workers`} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline shrink-0">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {!workers ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className={`${THEME.card} h-48 animate-pulse`} />)}
          </div>
        ) : workers.length === 0 ? (
          <div className={`${THEME.card} p-10 text-center`}>
            <p className="text-sm font-medium text-gray-600">No {category.name.toLowerCase()}s available in your area yet.</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon — we're adding new professionals daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map(w => <ProCard key={w.id} worker={w} />)}
          </div>
        )}
      </section>

      {/* ── Live map ── */}
      {workers && workers.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Live Location Map</h2>
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Professionals (green)
            {userCoords && <><span className="h-2.5 w-2.5 rounded-full bg-indigo-600 inline-block ml-2" /> You (blue)</>}
          </p>
          <ServiceMap workers={workers} userCoords={userCoords} />
        </section>
      )}

      <Link to={`/services/${category.slug}/workers`} className={`${THEME.primaryBtn} self-start`}>
        View all {category.name.toLowerCase()}s <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default ServiceDetails;
