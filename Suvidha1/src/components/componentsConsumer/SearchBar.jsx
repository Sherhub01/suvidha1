import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { SERVICES } from "../../api";

/**
 * Global search field used in the Navbar. Typing filters the list of
 * service categories; selecting a suggestion (or pressing Enter)
 * navigates to /services/:category. If nothing matches, it falls
 * back to a generic search results route.
 */
const SearchBar = ({ className = "", placeholder = "Search electricians, plumbers, AC repair..." }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const matches =
    query.trim().length > 0
      ? SERVICES.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
      : SERVICES.slice(0, 6);

  const goTo = (slug) => {
    setOpen(false);
    setQuery("");
    navigate(`/services/${slug}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (matches.length > 0) {
      goTo(matches[0].slug);
      return;
    }

    setOpen(false);
    setQuery("");
    navigate(`/services/all?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            aria-label="Search for a service"
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          {!query && (
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Popular services
            </p>
          )}
          {matches.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-gray-500">
              No matching service. Press Enter to search everywhere.
            </p>
          ) : (
            matches.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.slug}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goTo(service.slug)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-indigo-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={16} />
                  </span>
                  <span>
                    <span className="block font-medium text-gray-900">{service.name}</span>
                    <span className="block text-xs text-gray-500">{service.description}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
