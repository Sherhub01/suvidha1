import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, IndianRupee, Search } from "lucide-react";
import WorkerCard from "./components/WorkerCard";
import { THEME, getCategoryBySlug, fetchServiceDetails, fetchWorkers } from "../api";

/**
 * Shows an overview of a single service category (icon, description,
 * starting price) along with a preview of top-rated professionals.
 * Visiting /services/all (e.g. from a global search fallback) shows
 * a generic "search results" view instead.
 */
const ServiceDetails = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const category = getCategoryBySlug(categoryId);
  const [workers, setWorkers] = useState(null);

  useEffect(() => {
    setWorkers(null);
    if (category) {
      fetchServiceDetails(categoryId).then((data) => setWorkers(data.workers.slice(0, 4)));
    } else {
      fetchWorkers({ search: searchTerm }).then((data) => setWorkers(data.slice(0, 8)));
    }
  }, [categoryId, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!category) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#312E81_0%,#4F46E5_30%,#7C3AED_60%,#06B6D4_100%)] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-white/80">
            <Search size={18} />
            <span className="text-sm font-medium">Search results</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
            {searchTerm ? `Results for "${searchTerm}"` : "All professionals"}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/75">
            Browse verified professionals across every category on Suvidha1.
          </p>
        </div>

        {!workers ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${THEME.card} h-48 animate-pulse`} />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
            No professionals found{searchTerm ? ` for "${searchTerm}"` : ""}.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Category header */}
      <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#312E81_0%,#4F46E5_30%,#7C3AED_60%,#06B6D4_100%)] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
              <Icon size={28} />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{category.name}</h1>
              <p className="mt-1 max-w-xl text-sm text-white/75">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-md">
            <IndianRupee size={16} />
            <span className="text-sm font-semibold">
              Starts at ₹{category.startingPrice}{category.priceType === "hourly" ? "/hr" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Top professionals preview */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Top-rated professionals</h2>
            <p className="mt-0.5 text-sm text-gray-500">Verified {category.name.toLowerCase()}s near you</p>
          </div>
          <Link
            to={`/services/${category.slug}/workers`}
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {!workers ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${THEME.card} h-48 animate-pulse`} />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
            No professionals available in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </section>

      <Link
        to={`/services/${category.slug}/workers`}
        className={`${THEME.primaryBtn} self-start`}
      >
        View all {category.name.toLowerCase()}s <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default ServiceDetails;
