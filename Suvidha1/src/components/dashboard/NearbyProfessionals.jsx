import React from "react";
import { Link } from "react-router-dom";
import { LocateFixed, Star, MapPin, AlertCircle } from "lucide-react";
import useGeolocation from "../../hooks/useGeolocation";
import { nearbyProfessionals } from "../../data/mockData";

export default function NearbyProfessionals() {
  const { coords, loading, error } = useGeolocation();

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Nearby professionals</h2>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <LocateFixed size={14} />
          {loading
            ? "Locating you…"
            : error
            ? "Location unavailable"
            : "Using your saved location"}
        </span>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-500">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>We couldn't access your location ({error}). Showing results for your saved address instead — update it anytime in{" "}
            <Link to="/settings" className="font-semibold underline">Settings</Link>.
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {nearbyProfessionals.map((pro) => (
          <Link
            key={pro.id}
            to={`/workers/${pro.id}`}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-md ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <img
              src={pro.photo}
              alt={pro.name}
              className="h-12 w-12 rounded-full object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{pro.name}</p>
              <p className="truncate text-xs text-slate-500">{pro.profession}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-0.5">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {pro.rating}
                </span>
                <span className="flex items-center gap-0.5">
                  <MapPin size={12} />
                  {pro.distance}
                </span>
              </div>
            </div>
            <span className={`h-2 w-2 shrink-0 rounded-full ${pro.available ? "bg-emerald-500" : "bg-rose-500"}`}
              title={pro.available ? "Available" : "Busy"}
            />
          </Link>
        ))}
      </div>

      {coords && (
        <p className="mt-2 text-xs text-slate-400">
          Showing professionals around {coords.latitude.toFixed(3)},{" "}
          {coords.longitude.toFixed(3)}
        </p>
      )}
    </section>
  );
}
