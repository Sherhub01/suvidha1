import { useEffect, useRef, useState, useCallback } from "react";
import { Navigation, ZoomIn, ZoomOut, Loader2, MapPin } from "lucide-react";
import { T } from "./theme";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

const ensureCSS = () => {
  if (document.querySelector(`link[href="${LEAFLET_CSS}"]`)) return;
  document.head.appendChild(Object.assign(document.createElement("link"), { rel: "stylesheet", href: LEAFLET_CSS }));
};

const loadLeaflet = () => new Promise(resolve => {
  if (window.L) { resolve(window.L); return; }
  const s = Object.assign(document.createElement("script"), { src: LEAFLET_JS });
  s.onload = () => resolve(window.L);
  document.head.appendChild(s);
});

const pinSvg = (color, w = 34, h = 44) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  `<path d="M${w/2} 0C${w/5} 0 0 ${h/4} 0 ${h/2.75}c0 ${h/2.5} ${w/2} ${h/2} ${w/2} ${h/2}S${w} ${h/1.5} ${w} ${h/2.75}C${w} ${h/4} ${w*4/5} 0 ${w/2} 0z"` +
  ` fill="${color}" stroke="white" stroke-width="2"/>` +
  `<circle cx="${w/2}" cy="${h/3}" r="${w/5}" fill="white" opacity=".9"/></svg>`;

export default function Map() {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  const [ready,    setReady]    = useState(false);
  const [locating, setLocating] = useState(false);
  const [userPos,  setUserPos]  = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    API.get("/bookings/staff")
      .then(r => r.data.success && setBookings(r.data.bookings))
      .catch(() => {});
  }, []);

  useEffect(() => {
    ensureCSS();
    let cancelled = false;
    loadLeaflet().then(L => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { center: [20.5937, 78.9629], zoom: 5, zoomControl: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Add booking markers when bookings load
  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L || !ready) return;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    bookings.forEach(b => {
      // Try to get coordinates from consumer location
      const c = b.consumer || {};
      const coords = c.location?.coordinates;
      if (!coords || !coords[0] || !coords[1]) return;
      const [lng, lat] = coords;
      const color = b.status === "Confirmed" ? T.success : b.status === "Completed" ? "#6b7280" : T.warning;
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({ html: pinSvg(color, 30, 40), iconSize:[30,40], iconAnchor:[15,40], popupAnchor:[0,-42], className:"" })
      }).bindPopup(
        `<div style="font-family:sans-serif;min-width:160px">` +
        `<b style="color:#111">${c.firstName || ""} ${c.lastName || ""}</b><br/>` +
        `<span style="color:#6b7280;font-size:12px">${b.service}</span><br/>` +
        `<span style="font-size:11px">${b.date} · ${b.time}</span></div>`,
        { maxWidth: 220 }
      ).addTo(map);
      markersRef.current.push(marker);
    });
  }, [bookings, ready]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        setLocating(false);
        const map = mapRef.current;
        const L   = window.L;
        if (!map || !L) return;
        map.flyTo([lat, lng], 14, { duration: 1.2 });
        L.marker([lat, lng], {
          icon: L.divIcon({ html: pinSvg(T.primary), iconSize:[34,44], iconAnchor:[17,44], popupAnchor:[0,-46], className:"" })
        }).bindPopup(`<b style="color:#EC4899">📍 You are here</b>`, { maxWidth: 160 })
          .addTo(map).openPopup();

        // Save location to backend
        try {
          await API.patch("/auth/location", { latitude: lat, longitude: lng });
        } catch { /* offline */ }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const navigateToCustomer = (b) => {
    const c = b.consumer || {};
    const coords = c.location?.coordinates;
    const dest = coords ? `${coords[1]},${coords[0]}` : encodeURIComponent(b.address);
    const origin = userPos ? `${userPos.lat},${userPos.lng}` : "";
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const activeJobs = bookings.filter(b => b.status === "Scheduled" || b.status === "Confirmed");

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: T.heading }}>Job Map</h1>
        <p className="text-sm mt-0.5" style={{ color: T.subText }}>Your location and active customer locations</p>
      </div>

      {/* Map */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: 420, border: `1px solid ${T.cardBorder}` }}>
        <div ref={containerRef} className="absolute inset-0 z-0" />
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: T.pageBg }}>
            <div className="flex flex-col items-center gap-2">
              <Navigation size={24} className="animate-bounce" style={{ color: T.primary }} />
              <p className="text-sm font-semibold" style={{ color: T.text }}>Loading map…</p>
            </div>
          </div>
        )}

        {/* My location button */}
        <button onClick={handleLocate} disabled={locating}
          className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow transition hover:opacity-90 disabled:opacity-60"
          style={{ background: T.primary, color: "#fff" }}>
          {locating ? <><Loader2 size={13} className="animate-spin" /> Locating…</> : <><Navigation size={13} /> My Location</>}
        </button>

        {/* Zoom */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
          <button onClick={() => mapRef.current?.zoomIn()}  className="flex h-8 w-8 items-center justify-center rounded-xl shadow" style={{ background: "#1E293B", color: T.text }}><ZoomIn  size={14} /></button>
          <button onClick={() => mapRef.current?.zoomOut()} className="flex h-8 w-8 items-center justify-center rounded-xl shadow" style={{ background: "#1E293B", color: T.text }}><ZoomOut size={14} /></button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1 rounded-xl p-2.5 text-xs backdrop-blur-sm"
          style={{ background: "rgba(15,23,42,0.85)", border: `1px solid ${T.cardBorder}` }}>
          {[["You", T.primary], ["Confirmed", T.success], ["Scheduled", T.warning], ["Completed", "#6b7280"]].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1.5" style={{ color: T.text }}>
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* Active jobs list */}
      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: T.heading }}>Active Jobs ({activeJobs.length})</h2>
        {activeJobs.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ border: `1px solid ${T.cardBorder}`, background: T.cardBg }}>
            <MapPin size={32} className="mx-auto mb-2 opacity-30" style={{ color: T.muted }} />
            <p className="text-sm" style={{ color: T.subText }}>No active jobs to display on map.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeJobs.map(b => {
              const c = b.consumer || {};
              return (
                <div key={b._id} className="flex items-center gap-3 rounded-2xl p-4"
                  style={{ border: `1px solid ${T.cardBorder}`, background: T.cardBg }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "#1E3A5F" }}>
                    <span className="text-lg">🔧</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: T.heading }}>{b.service}</p>
                    <p className="text-xs truncate" style={{ color: T.subText }}>
                      {`${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer"} · {b.date} {b.time}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: T.muted }}>{b.address}</p>
                  </div>
                  <button onClick={() => navigateToCustomer(b)}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition hover:opacity-90"
                    style={{ background: T.primary, color: "#fff" }}>
                    <Navigation size={12} /> Navigate
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
