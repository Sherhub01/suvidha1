import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import ServiceCard from "../components/dashboard/ServiceCard";
import { services } from "../data/mockData";

const CATEGORIES = ["All", "Repair", "Cleaning", "Beauty", "Education", "Moving"];

export default function Services() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState("All");

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl pb-16">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Services</h1>
        <p className="mt-1 text-sm text-slate-500">Browse every specialisation and find a verified professional near you.</p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                category === cat
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="mb-4 text-xs text-slate-400">{filtered.length} service{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 text-sm font-semibold text-slate-800">No services found</p>
          <p className="mt-1 text-xs text-slate-500">Try a different keyword or clear the search</p>
          <button onClick={() => setQuery("")} className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
