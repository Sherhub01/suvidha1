import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import WorkerCard from "./components/WorkerCard";
import { THEME, getCategoryBySlug, fetchWorkers, MOCK_WORKERS } from "../api";
import WorkerMap from "./components/WorkerMap";

const PAGE_SIZE = 8;
const CITIES = [...new Set(MOCK_WORKERS.map((w) => w.city))].sort();

const SORT_OPTIONS = [
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "experience", label: "Most experienced" },
];

/**
 * Full professional listing for a category (or "all" for every
 * category). Supports text search, city/rating/experience filters,
 * sorting and client-side pagination.
 */
const WorkerList = () => {
  const { categoryId } = useParams();
  const category = getCategoryBySlug(categoryId);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [sort, setSort] = useState("rating");
  const [page, setPage] = useState(1);

  const [workers, setWorkers] = useState(null);

  useEffect(() => {
    setWorkers(null);
    fetchWorkers({ category: categoryId, search, city, minRating, minExperience, sort }).then(
      (data) => {
        setWorkers(data);
        setPage(1);
      }
    );
  }, [categoryId, search, city, minRating, minExperience, sort]);

  const paginated = useMemo(() => {
    if (!workers) return [];
    const start = (page - 1) * PAGE_SIZE;
    return workers.slice(start, start + PAGE_SIZE);
  }, [workers, page]);

  const totalPages = workers ? Math.max(1, Math.ceil(workers.length / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {category ? `${category.name}s near you` : "All professionals"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {category
            ? `Search, filter and book a verified ${category.name.toLowerCase()}.`
            : "Search and filter across every Suvidha1 service category."}
        </p>
      </div>

      {/* Filters */}
      <div className={`${THEME.card} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:flex-wrap`}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or skill..."
            className={`${THEME.input} pl-10`}
          />
        </div>

        <select value={city} onChange={(e) => setCity(e.target.value)} className={`${THEME.input} sm:w-40`}>
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className={`${THEME.input} sm:w-40`}>
          <option value="">Any rating</option>
          <option value="4.5">4.5+ stars</option>
          <option value="4">4.0+ stars</option>
          <option value="3.5">3.5+ stars</option>
        </select>

        <select value={minExperience} onChange={(e) => setMinExperience(e.target.value)} className={`${THEME.input} sm:w-44`}>
          <option value="">Any experience</option>
          <option value="2">2+ years</option>
          <option value="5">5+ years</option>
          <option value="10">10+ years</option>
        </select>

        <div className="flex items-center gap-2 sm:w-52">
          <SlidersHorizontal size={16} className="shrink-0 text-gray-400" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={THEME.input}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive map — all matching workers pinned */}
      <WorkerMap
        workers={workers || MOCK_WORKERS.filter((w) => !categoryId || w.category === categoryId)}
        height="360px"
        showSearch={true}
      />

      {/* Results */}
      {!workers ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`${THEME.card} h-48 animate-pulse`} />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-900">No professionals match your filters</p>
          <p className="mt-1 text-sm text-gray-500">Try widening your search or clearing some filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{workers.length} professionals found</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paginated.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {category && (
        <Link to={`/services/${category.slug}`} className="text-sm font-semibold text-indigo-600 hover:underline">
          ← Back to {category.name}
        </Link>
      )}
    </div>
  );
};

export default WorkerList;
