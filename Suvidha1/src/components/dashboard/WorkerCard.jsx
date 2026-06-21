import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, BadgeCheck } from "lucide-react";

export default function WorkerCard({ worker }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <img
          src={worker.photo}
          alt={worker.name}
          className="h-40 w-full object-cover"
          loading="lazy"
        />

        {/* Rating stamp */}
        <div className="absolute -right-3 -top-3 grid h-16 w-16 -rotate-12 place-items-center rounded-full border-2 border-dashed border-white bg-slate-900/90 text-white shadow-lg">
          <div className="flex flex-col items-center leading-none">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="mt-0.5 text-xs font-bold">{worker.rating}</span>
          </div>
        </div>

        {/* Availability pill */}
        <span className={`absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          worker.available ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${worker.available ? "bg-emerald-500" : "bg-rose-500"}`} />
          {worker.available ? "Available today" : "Busy"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-800">{worker.name}</h3>
            <p className="text-sm text-slate-500">{worker.profession}</p>
          </div>
          <BadgeCheck size={18} className="mt-0.5 shrink-0 text-emerald-500" />
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-800">{worker.experience}</span>
            <span>experience</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={13} />
            <span>{worker.distance} away</span>
          </div>
          <div className="col-span-2 flex items-center gap-1">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-800">{worker.rating}</span>
            <span>({worker.reviews} reviews)</span>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-800">{worker.price}</span>
          <Link
            to={`/workers/${worker.id}`}
            className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-amber-500"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
