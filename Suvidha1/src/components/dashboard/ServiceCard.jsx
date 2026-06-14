import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ServiceCard({ service, compact = false }) {
  const Icon = service.icon;

  return (
    <Link
      to={`/services/${service.id}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        compact ? "w-44 shrink-0 sm:w-52" : "h-full"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-white">
          <Icon size={20} strokeWidth={2} />
        </span>
        <ArrowUpRight size={18} className="text-slate-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="mt-4">
        <h3 className="text-base font-semibold text-slate-800">{service.name}</h3>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{service.description}</p>
        )}
        <p className="mt-2 text-sm font-semibold text-rose-500">
          From ₹{service.startingPrice}{service.unit ?? ""}
        </p>
      </div>
    </Link>
  );
}
