import { useState } from "react";
import { Search } from "lucide-react";
import ServiceCard from "./components/ServiceCard";
import { THEME, SERVICES } from "../api";

/**
 * Lists every service category as a clickable card. Each card
 * navigates to /services/:slug (ServiceDetails). Includes a local
 * filter input (separate from the global Navbar search) so people
 * can quickly narrow down the grid.
 */
const Services = () => {
  const [query, setQuery] = useState("");

  const filtered = SERVICES.filter((s) =>
    `${s.name} ${s.description}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All services</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse every specialization Suvidha1 offers and find a verified professional near you.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter categories (e.g. AC, painter, tutor)..."
          className={`${THEME.input} pl-10`}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
          No services match "{query}".
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
