import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Search, Star, BadgeCheck, X, Layers } from "lucide-react";
import API from "../api";
import { nearbyProfessionals, popularWorkers } from "../data/mockData";

// Fix default leaflet icon path broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const makeIcon = (color, size = 36) => L.divIcon({
  className: "",
  html: `<div style="
    width:${size}px;height:${size}px;
    background:${color};
    border:3px solid #fff;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size],
  popupAnchor: [0, -size],
});

const USER_ICON   = makeIcon("#3b82f6", 38);
const WORKER_ICON = makeIcon("#f59e0b", 32);
const NEARBY_ICON = makeIcon("#10b981", 30);

const ALL_WORKERS = [
  ...popularWorkers.map((w, i) => ({
    ...w, lat: 28.6139 + (i * 0.008) - 0.02, lng: 77.2090 + (i * 0.006) - 0.015,
  })),
  ...nearbyProfessionals.map((w, i) => ({
    ...w, lat: 28.6139 + (i * 0.005) + 0.01, lng: 77.2090 - (i * 0.007) + 0.01,
  })),
];

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 14, { animate: true }); }, [lat, lng, map]);
  return null;
}

const TILES = {
  street: {
    label: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  dark: {
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
  },
};

export default function MapPage() {
  const navigate = useNavigate();
  const [userPos, setUserPos] = useState({ lat: 28.6139, lng: 77.2090 });
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [tileKey, setTileKey] = useState("street");
  const [tileOpen, setTileOpen] = useState(false);
  const [accuracy, setAccuracy] = useState(null);

  const tile = TILES[tileKey];

  const filtered = ALL_WORKERS.filter((w) =>
    w.name.toLowerCase().includes(query.toLowerCase()) ||
    w.profession.toLowerCase().includes(query.toLowerCase())
  );

  const locateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setUserPos({ lat, lng });
        setAccuracy(Math.round(acc));
        setLocating(false);
        try {
          await API.patch("/location", { latitude: lat, longitude: lng });
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          stored.location = { type: "Point", coordinates: [lng, lat] };
          localStorage.setItem("user", JSON.stringify(stored));
        } catch {/* silent */ }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { locateMe(); }, []);

  return (
    <div className="relative flex flex-col h-[calc(100vh-64px)] rounded-2xl overflow-hidden shadow-xl">

      {/* Top controls bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white shadow-xl border border-slate-200 px-4 py-2.5">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search professionals or services…"
            className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          )}
        </div>

        {query && filtered.length > 0 && (
          <div className="mt-1 rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden max-h-56 overflow-y-auto">
            {filtered.map((w) => (
              <button
                key={w.id}
                onClick={() => { setSelected(w); setQuery(""); setUserPos({ lat: w.lat, lng: w.lng }); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-slate-50 text-left transition"
              >
                <img src={w.photo} alt={w.name} className="h-8 w-8 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{w.name}</p>
                  <p className="text-xs text-slate-500">{w.profession} · {w.distance}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-amber-500 font-semibold">
                  <Star size={12} className="fill-amber-400" /> {w.rating}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={[userPos.lat, userPos.lng]}
        zoom={14}
        className="flex-1 w-full h-full"
        zoomControl={false}
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />
        <RecenterMap lat={userPos.lat} lng={userPos.lng} />

        {accuracy && (
          <Circle
            center={[userPos.lat, userPos.lng]}
            radius={accuracy}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08, weight: 1 }}
          />
        )}

        <Marker position={[userPos.lat, userPos.lng]} icon={USER_ICON}>
          <Popup>
            <div className="text-center px-1 py-0.5">
              <p className="font-bold text-blue-600 text-sm">📍 You are here</p>
              {accuracy && <p className="text-xs text-slate-500 mt-0.5">Accuracy: ~{accuracy}m</p>}
            </div>
          </Popup>
        </Marker>

        {filtered.map((w) => (
          <Marker
            key={w.id}
            position={[w.lat, w.lng]}
            icon={nearbyProfessionals.find((n) => n.id === w.id) ? NEARBY_ICON : WORKER_ICON}
            eventHandlers={{ click: () => setSelected(w) }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <img src={w.photo} alt={w.name} className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm leading-tight">{w.name}</p>
                    <p className="text-xs text-slate-500">{w.profession}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                    <Star size={11} className="fill-amber-400" /> {w.rating}
                  </span>
                  <span>· {w.distance}</span>
                  <span className={`ml-auto font-semibold ${w.available ? "text-emerald-500" : "text-rose-500"}`}>
                    {w.available ? "Available" : "Busy"}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/workers/${w.id}`)}
                  className="w-full rounded-lg bg-amber-400 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-500 transition"
                >
                  View Profile →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Bottom control buttons */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setTileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Change map style"
          >
            <Layers size={18} />
          </button>
          {tileOpen && (
            <div className="absolute bottom-12 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden w-32">
              {Object.entries(TILES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => { setTileKey(key); setTileOpen(false); }}
                  className={`w-full px-4 py-2.5 text-sm text-left transition ${
                    tileKey === key ? "bg-amber-50 text-amber-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={locateMe}
          disabled={locating}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg text-white hover:bg-blue-600 transition disabled:opacity-60"
          title="My location"
        >
          {locating
            ? <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Navigation size={18} />
          }
        </button>
      </div>

      {/* Selected worker side card */}
      {selected && (
        <div className="absolute bottom-4 left-4 z-[1000] w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            <X size={13} />
          </button>
          <img src={selected.photo} alt={selected.name} className="h-28 w-full object-cover" />
          <div className="p-3">
            <div className="flex items-start justify-between gap-1">
              <div>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  {selected.name} <BadgeCheck size={14} className="text-emerald-500" />
                </p>
                <p className="text-xs text-slate-500">{selected.profession}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                selected.available ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"
              }`}>
                {selected.available ? "Available" : "Busy"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star size={12} className="fill-amber-400" /> {selected.rating}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {selected.distance}
              </span>
              {selected.price && <span className="font-semibold text-slate-700">{selected.price}</span>}
            </div>
            <button
              onClick={() => navigate(`/workers/${selected.id}`)}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-2 text-sm font-bold text-slate-900 hover:from-amber-300 hover:to-orange-400 transition"
            >
              View Full Profile →
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-slate-200 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" /> You</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-400 border-2 border-white shadow-sm" /> Popular</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" /> Nearby</span>
      </div>
    </div>
  );
}
