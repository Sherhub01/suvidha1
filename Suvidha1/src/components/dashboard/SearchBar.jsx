import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { services } from "../../data/mockData";

const QUICK_CHIPS = [
  "Electrician",
  "Plumber",
  "AC Repair",
  "Home Tutor",
  "Beautician",
  "Pest Control",
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/services?q=${encodeURIComponent(query.trim())}`);
  };

  const handleChip = (label) => {
    const match = services.find(
      (s) => s.name.toLowerCase() === label.toLowerCase()
    );
    navigate(match ? `/services/${match.id}` : `/services?q=${encodeURIComponent(label)}`);
  };

  return (
    <section className="-mt-6 px-1 sm:-mt-7">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-900/5 sm:p-2.5"
      >
        <Search size={18} className="ml-2 shrink-0 text-slate-400" />
        <label htmlFor="dashboard-search" className="sr-only">
          Search for any service
        </label>
        <input
          id="dashboard-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need help with today? e.g. “fan repair”"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400/70 focus:outline-none"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Search
          <ArrowRight size={15} />
        </button>
      </form>

      {/* Quick chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_CHIPS.map((label) => (
          <button
            key={label}
            onClick={() => handleChip(label)}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-amber-400 hover:text-slate-900"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
