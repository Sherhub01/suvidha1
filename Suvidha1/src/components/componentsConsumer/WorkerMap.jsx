import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react";
import { MOCK_WORKERS, getCategoryBySlug } from "../../api";

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

const DOT_COLOR = {
  available_now : "#10B981",
  today         : "#F59E0B",
  this_week     : "#6B7280",
  unavailable   : "#EF4444",
};

const ensureLeafletCSS = () => {
  if (document.querySelector(`link[href="${LEAFLET_CSS}"]`)) return;
  const link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);
};

const loadLeaflet = () =>
  new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });

const makeIcon = (L, worker) => {
  const color = DOT_COLOR[worker.availability] || "#6B7280";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
    </svg>`;
  return L.divIcon({ html: svg, iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -44], className: "" });
};

const popupHTML = (worker, category) => `
  <div style="width:220px;font-family:sans-serif;">
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
      <img src="${worker.profilePhoto}" alt="${worker.name}"
           style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #eee;"/>
      <div>
        <p style="margin:0;font-weight:700;color:#111827;font-size:14px;">${worker.name}</p>
        <p style="margin:0;color:#6B7280;font-size:12px;">${category?.name || worker.category}</p>
      </div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
      <span style="background:#EEF2FF;color:#4F46E5;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">⭐ ${worker.rating.toFixed(1)}</span>
      <span style="background:#DCFCE7;color:#166534;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">₹${worker.price}${worker.priceType === "hourly" ? "/hr" : ""}</span>
      <span style="background:#ECFEFF;color:#0891B2;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">📍 ${worker.distance}</span>
    </div>
    <p style="margin:0 0 8px;color:#374151;font-size:12px;">${worker.address}</p>
    <a href="/workers/${worker.id}"
       style="display:block;background:linear-gradient(to right,#1E40AF,#0EA5E9);color:#fff;text-align:center;
              padding:7px 12px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;">
      View profile →
    </a>
  </div>`;

const LegendDot = ({ color, label }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#374151" }}>
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
    {label}
  </span>
);

const WorkerMap = ({
  workers    = MOCK_WORKERS,
  center     = [28.6139, 77.2090],
  zoom       = 12,
  height     = "420px",
  onSelect,
  showSearch = true,
}) => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  const touchRef     = useRef({ lastDist: null, lastMid: null });
  const [ready, setReady]         = useState(false);
  const [cityInput, setCityInput] = useState("");

  /* ── Bootstrap Leaflet ── */
  useEffect(() => {
    ensureLeafletCSS();
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { center, zoom, zoomControl: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Drop pins ── */
  useEffect(() => {
    const L = window.L; const map = mapRef.current;
    if (!ready || !L || !map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    workers.forEach((worker) => {
      const [lng, lat] = worker.location?.coordinates || [77.2090, 28.6139];
      if (!lat || !lng) return;
      const category = getCategoryBySlug(worker.category);
      const marker = L.marker([lat, lng], { icon: makeIcon(L, worker) })
        .bindPopup(popupHTML(worker, category), { maxWidth: 240, minWidth: 240 })
        .addTo(map);
      if (onSelect) marker.on("popupopen", () => onSelect(worker));
      markersRef.current.push(marker);
    });
    if (markersRef.current.length > 1) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [ready, workers, onSelect]);

  /* ── Touch: two-finger drag + pinch zoom ── */
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const [t1, t2] = [e.touches[0], e.touches[1]];
      touchRef.current.lastDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchRef.current.lastMid  = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
      mapRef.current?.dragging.disable();
    } else {
      mapRef.current?.dragging.enable();
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length !== 2 || !mapRef.current) return;
    e.preventDefault();
    const map = mapRef.current;
    const [t1, t2] = [e.touches[0], e.touches[1]];
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const mid  = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    const prev = touchRef.current;

    // Pinch zoom: split fingers = zoom in, combine = zoom out
    if (prev.lastDist !== null && Math.abs(dist - prev.lastDist) > 0.5) {
      const scale = dist / prev.lastDist;
      map.setZoom(map.getZoom() + Math.log2(scale), { animate: false });
    }

    // Two-finger drag
    if (prev.lastMid !== null) {
      const dx = mid.x - prev.lastMid.x;
      const dy = mid.y - prev.lastMid.y;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        const cp = map.latLngToContainerPoint(map.getCenter());
        map.panTo(map.containerPointToLatLng([cp.x - dx, cp.y - dy]), { animate: false });
      }
    }

    prev.lastDist = dist;
    prev.lastMid  = mid;
  };

  const handleTouchEnd = () => {
    touchRef.current.lastDist = null;
    touchRef.current.lastMid  = null;
    mapRef.current?.dragging.enable();
  };

  /* ── Zoom buttons ── */
  const zoomIn  = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  /* ── City jump ── */
  const jumpToCity = (e) => {
    e.preventDefault();
    const q = cityInput.trim().toLowerCase();
    const map = mapRef.current;
    if (!q || !map || !window.L) return;
    const match = workers.find((w) => w.city.toLowerCase().includes(q));
    if (match) {
      const [lng, lat] = match.location?.coordinates || [77.2090, 28.6139];
      map.flyTo([lat, lng], 14, { duration: 1.2 });
    } else {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}&limit=1`)
        .then((r) => r.json())
        .then((data) => { if (data[0]) map.flyTo([+data[0].lat, +data[0].lon], 13, { duration: 1.2 }); })
        .catch(() => {});
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      style={{ height }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Map container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Loading skeleton */}
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-linear-to-br from-indigo-50 to-cyan-50">
          <div className="flex flex-col items-center gap-3 text-amber-400">
            <MapPin size={28} className="animate-bounce" />
            <p className="text-sm font-semibold">Loading map…</p>
          </div>
        </div>
      )}

      {/* City search (top-left) */}
      {showSearch && (
        <form
          onSubmit={jumpToCity}
          className="absolute left-3 top-3 z-20 flex gap-2"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
        >
          <input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Jump to city…"
            className="w-40 rounded-xl border-0 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-52"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-800"
          >
            <Navigation size={13} /> Go
          </button>
        </form>
      )}

      {/* Zoom controls (top-right) */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}>
        <button onClick={zoomIn}  title="Zoom in (or spread two fingers)" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow hover:bg-blue-50 hover:text-blue-700">
          <ZoomIn size={16} />
        </button>
        <button onClick={zoomOut} title="Zoom out (or pinch two fingers)" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow hover:bg-blue-50 hover:text-blue-700">
          <ZoomOut size={16} />
        </button>
      </div>

      {/* Touch hint badge */}
      {ready && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm pointer-events-none select-none"
          style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.3))" }}
        >
          2 fingers: drag · pinch: zoom
        </div>
      )}

      {/* Legend (bottom-left) */}
      <div
        className="absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 rounded-xl border border-white/60 bg-white/90 p-3 text-xs backdrop-blur-md"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))" }}
      >
        <p className="mb-0.5 font-bold text-gray-700">Availability</p>
        <LegendDot color={DOT_COLOR.available_now} label="Available now" />
        <LegendDot color={DOT_COLOR.today}         label="Free today" />
        <LegendDot color={DOT_COLOR.this_week}     label="Free this week" />
        <LegendDot color={DOT_COLOR.unavailable}   label="Unavailable" />
      </div>

      {/* Count badge (bottom-right) */}
      <div className="absolute bottom-3 right-3 z-20 rounded-full bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow">
        {workers.length} professional{workers.length !== 1 ? "s" : ""} on map
      </div>
    </div>
  );
};

export default WorkerMap;
