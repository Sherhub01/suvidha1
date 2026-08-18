import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star, MapPin, Phone, MessageCircle, Share2, CalendarCheck,
  BadgeCheck, IndianRupee, CheckCircle2, X, Clock, Calendar,
  ArrowLeft, Loader2, Navigation,
} from "lucide-react";
import { THEME, getCategoryBySlug } from "../api";
import BookingDialog from "../components/booking/BookingDialog";
import ReviewList from "../components/reviews/ReviewList";
import { Stars } from "../components/reviews/StarRating";
import Gallery from "../components/gallery/Gallery";
import { http } from "../services/http";
import { servicesApi } from "../services/api";
import { assetUrl } from "../config";



const AVAILABILITY_LABEL = {
  available_now: "Available now",
  today: "Free today",
  this_week: "Free this week",
  unavailable: "Currently unavailable",
};

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
const WorkerProfile = () => {
  const { workerId } = useParams();
  const [worker,      setWorker]      = useState(undefined);
  const [userCoords,  setUserCoords]  = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [services, setServices] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => setReloadKey((k) => k + 1);

  // The catalogue maps a professional's category onto the service slug that
  // the booking and quote endpoints expect.
  useEffect(() => {
    servicesApi.list().then((d) => setServices(d.services || [])).catch(() => setServices([]));
  }, []);

  const serviceSlug =
    services.find((s) => s.category === worker?.category)?.slug ||
    services.find((s) => s.name === worker?.category)?.slug ||
    services[0]?.slug;

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
            profilePhoto: assetUrl(sp.photo) || assetUrl(u.avatar),
            rating:       sp.rating  || 0,
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
  }, [workerId, reloadKey]);

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

          {/* Reviews — real, from the API */}
          <div className={`${THEME.card} p-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Reviews</h2>
              <span className={THEME.ratingBadge}>
                <Stars value={worker.rating} size={12} />
                {Number(worker.rating || 0).toFixed(1)}
                <span className="font-normal text-gray-400">({worker.reviewsCount})</span>
              </span>
            </div>
            <ReviewList profileId={worker.profileId} className="mt-4" />
          </div>
        </div>
      </div>

      <BookingDialog
        open={showBooking}
        worker={worker}
        serviceSlug={serviceSlug}
        onClose={() => setShowBooking(false)}
        onBooked={() => reload()}
      />
    </div>
  );
};

export default WorkerProfile;
