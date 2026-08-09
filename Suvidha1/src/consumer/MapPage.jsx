import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Compass, Loader2, Navigation, MapPin } from "lucide-react";
import axios from "axios";
import { API_URL, BACKEND_URL } from "../config";

const BAPI = axios.create({ baseURL: API_URL });
BAPI.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

const DOT_COLOR = {
  available_now: "#10B981",
  today:         "#F59E0B",
  this_week:     "#6B7280",
  unavailable:   "#EF4444",
};

function ensureCSS() {
  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = LEAFLET_CSS;
    document.head.appendChild(l);
  }
}

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }
    const s = document.createElement("script"); s.src = LEAFLET_JS;
    s.onload = () => resolve(window.L); document.head.appendChild(s);
  });
}

function makeProIcon(L, availability) {
  const color = DOT_COLOR[availability] || "#6B7280";
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
    </svg>`,
    iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -44], className: "",
  });
}

function makeUserIcon(L) {
  return L.divIcon({
    html: `<div style="
      width:20px;height:20px;background:#4F46E5;border:3px solid white;
      border-radius:50%;box-shadow:0 2px 8px rgba(79,70,229,0.5);
      animation:pulse 2s infinite;
    "></div>
    <style>@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(79,70,229,0.4)}50%{box-shadow:0 0 0 8px rgba(79,70,229,0)}}</style>`,
    iconSize: [20, 20], iconAnchor: [10, 10], className: "",
  });
}

export default function MapPage() {
  const routeState = useLocation().state;
  const mapRef     = useRef(null);
  const containerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const proMarkersRef = useRef([]);

  const [mapReady,   setMapReady]   = useState(false);
  const [locating,   setLocating]   = useState(false);
  const [userCoords, setUserCoords] = useState(
    routeState?.userLat && routeState?.userLng
      ? { lat: routeState.userLat, lng: routeState.userLng }
      : null
  );
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load real staff from backend
  useEffect(() => {
    BAPI.get("/staff/approved")
      .then(({ data }) => {
        const list = (data.profiles || []).map((sp) => {
          const u   = sp.user || {};
          const loc = sp.location || u.location;
          return {
            id:           sp._id,
            name:         sp.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
            category:     sp.category || "",
            profilePhoto: sp.photo ? `${BACKEND_URL}${sp.photo}` : u.avatar ? `${BACKEND_URL}${u.avatar}` : null,
            rating:       sp.rating || 4.5,
            price:        sp.price  || 0,
            priceType:    sp.priceType || "fixed",
            availability: "available_now",
            distance:     "",
            address:      sp.serviceCity || sp.city || "",
            location:     loc,
          };
        }).filter(w => w.location?.coordinates);
        setWorkers(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Init map
  useEffect(() => {
    ensureCSS();
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const center = userCoords ? [userCoords.lat, userCoords.lng] : [28.6139, 77.209];
      const map    = L.map(containerRef.current, { center, zoom: 12, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap", maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      setMapReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Drop professional pins when map + workers ready
  useEffect(() => {
    const L = window.L; const map = mapRef.current;
    if (!mapReady || !L || !map) return;
    proMarkersRef.current.forEach(m => m.remove());
    proMarkersRef.current = [];
    workers.forEach((w) => {
      const [lng, lat] = w.location.coordinates;
      if (!lat || !lng) return;
      const photo = w.profilePhoto
        ? `<img src="${w.profilePhoto}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #eee;"/>`
        : `<div style="width:44px;height:44px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;font-weight:700;color:#4F46E5;font-size:18px;">${w.name?.[0] || "P"}</div>`;
      const popup = `
        <div style="width:220px;font-family:sans-serif;">
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
            ${photo}
            <div>
              <p style="margin:0;font-weight:700;color:#111827;font-size:14px;">${w.name}</p>
              <p style="margin:0;color:#6B7280;font-size:12px;text-transform:capitalize;">${w.category}</p>
            </div>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <span style="background:#EEF2FF;color:#4F46E5;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">⭐ ${w.rating.toFixed(1)}</span>
            <span style="background:#DCFCE7;color:#166534;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">₹${w.price}${w.priceType === "hourly" ? "/hr" : ""}</span>
          </div>
          <p style="margin:0 0 8px;color:#374151;font-size:12px;">📍 ${w.address}</p>
          <a href="/workers/${w.id}"
             style="display:block;background:linear-gradient(to right,#4F46E5,#0EA5E9);color:#fff;text-align:center;
                    padding:7px 12px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;">
            View Profile &amp; Book →
          </a>
        </div>`;
      const marker = L.marker([lat, lng], { icon: makeProIcon(L, w.availability) })
        .bindPopup(popup, { maxWidth: 240 })
        .addTo(map);
      proMarkersRef.current.push(marker);
    });
  }, [mapReady, workers]);

  // Update user marker when coords change
  useEffect(() => {
    const L = window.L; const map = mapRef.current;
    if (!mapReady || !L || !map || !userCoords) return;
    if (userMarkerRef.current) { userMarkerRef.current.remove(); }
    const marker = L.marker([userCoords.lat, userCoords.lng], { icon: makeUserIcon(L), zIndexOffset: 1000 })
      .bindPopup("<b style='font-size:13px'>📍 Your Location</b>")
      .addTo(map);
    userMarkerRef.current = marker;
    map.flyTo([userCoords.lat, userCoords.lng], 13, { duration: 1.2 });
  }, [mapReady, userCoords]);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleNavigateTo = (w) => {
    const [lng, lat] = w.location.coordinates;
    const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : "";
    const dest   = `${lat},${lng}`;
    const url    = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nearby Professionals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tap any pin to view profile, pricing and book instantly.
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" /> Professional (available)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-3 w-3 rounded-full bg-indigo-600 inline-block" /> You
            </span>
            {userCoords && workers.length > 0 && (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live tracking active
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={handleLocate} disabled={locating}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700 active:scale-95 disabled:opacity-60">
            {locating
              ? <><Loader2 size={15} className="animate-spin" /> Locating…</>
              : <><Compass size={15} /> Use My Location</>}
          </button>

          {workers.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600">
                <Navigation size={15} /> Navigate to…
              </button>
              <div className="absolute right-0 top-full mt-1 z-30 hidden group-hover:block w-64 rounded-2xl border border-slate-100 bg-white shadow-xl py-1 max-h-72 overflow-y-auto">
                {workers.map((w) => (
                  <button key={w.id} onClick={() => handleNavigateTo(w)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition text-left">
                    {w.profilePhoto
                      ? <img src={w.profilePhoto} alt={w.name} className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                      : <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">{w.name?.[0]}</div>
                    }
                    <div className="min-w-0">
                      <p className="truncate font-medium text-xs">{w.name}</p>
                      <p className="truncate text-[10px] text-slate-400 capitalize">{w.category}</p>
                    </div>
                    <Navigation size={12} className="shrink-0 text-slate-300 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg" style={{ height: "calc(100vh - 260px)", minHeight: 400 }}>
        <div ref={containerRef} className="absolute inset-0 z-0" />

        {/* Loading */}
        {(!mapReady || loading) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3 text-indigo-500">
              <MapPin size={28} className="animate-bounce" />
              <p className="text-sm font-semibold">Loading map…</p>
            </div>
          </div>
        )}

        {/* Stats badge */}
        {mapReady && (
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            <div className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
              {workers.length} professional{workers.length !== 1 ? "s" : ""} on map
            </div>
            {userCoords && (
              <div className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
                📍 Your location active
              </div>
            )}
          </div>
        )}
      </div>

      {/* No location prompt */}
      {!userCoords && mapReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3 text-sm text-amber-800">
          <Compass size={16} className="shrink-0 text-amber-600" />
          <span>Click <strong>"Use My Location"</strong> to see professionals near you and enable live tracking.</span>
        </div>
      )}
    </div>
  );
}
