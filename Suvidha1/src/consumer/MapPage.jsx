import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Compass, Loader2, Navigation } from "lucide-react";
import WorkerMap from "./components/WorkerMap";
import ErrorBoundary from "../components/ErrorBoundary";
import { MOCK_WORKERS, fetchNearbyWorkers } from "../api";

export default function MapPage() {
  const routeState = useLocation().state;
  const [workers, setWorkers] = useState(MOCK_WORKERS);
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState(
    routeState?.userLat && routeState?.userLng
      ? { lat: routeState.userLat, lng: routeState.userLng }
      : null
  );

  // If navigated from Settings with GPS coords, auto-locate
  useEffect(() => {
    if (routeState?.userLat && routeState?.userLng) {
      setLocating(true);
      fetchNearbyWorkers().then((data) => {
        setWorkers(data);
        setLocating(false);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        fetchNearbyWorkers().then((data) => {
          setWorkers(data);
          setLocating(false);
        });
      },
      () => {
        fetchNearbyWorkers().then((data) => { setWorkers(data); setLocating(false); });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Navigate to professional via Google Maps
  const handleNavigate = (worker) => {
    const [lng, lat] = worker.location?.coordinates || [];
    if (!lat || !lng) return;
    const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : "";
    const dest = `${lat},${lng}`;
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const mapCenter = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [28.6139, 77.209];

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nearby Professionals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tap any pin to view availability, pricing and book instantly.
          </p>
          {userCoords && (
            <p className="mt-0.5 text-xs text-emerald-600 font-medium">
              📍 Showing professionals near your location
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleLocate}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700 active:scale-95"
          >
            {locating
              ? <><Loader2 size={15} className="animate-spin" /> Locating…</>
              : <><Compass size={15} /> Use my location</>}
          </button>
          {workers.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600">
                <Navigation size={15} /> Navigate to…
              </button>
              {/* Dropdown list of workers to navigate to */}
              <div className="absolute right-0 top-full mt-1 z-30 hidden group-hover:block w-60 rounded-2xl border border-slate-100 bg-white shadow-xl py-1">
                {workers.slice(0, 6).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleNavigate(w)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition text-left"
                  >
                    <img src={w.profilePhoto} alt={w.name}
                      className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
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

      <ErrorBoundary>
        <WorkerMap
          workers={workers}
          center={mapCenter}
          height="calc(100vh - 220px)"
          showSearch
          onSelect={(worker) => {
            // On marker popup click, offer navigation
          }}
        />
      </ErrorBoundary>
    </div>
  );
}
