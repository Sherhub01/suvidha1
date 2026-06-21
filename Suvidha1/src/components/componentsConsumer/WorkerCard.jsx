import { Link } from "react-router-dom";
import { Star, MapPin, IndianRupee, Briefcase } from "lucide-react";
import { THEME, getCategoryBySlug } from "../../api";

const AVAILABILITY_STYLES = {
  available_now: { label: "Available now", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  today: { label: "Free today", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  this_week: { label: "Free this week", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100" },
  unavailable: { label: "Unavailable", dot: "bg-rose-400", text: "text-rose-600", bg: "bg-rose-50" },
};

/**
 * Worker / professional summary card used on the Dashboard
 * ("Popular Workers", "Nearby Professionals") and the WorkerList page.
 */
const WorkerCard = ({ worker }) => {
  const availability = AVAILABILITY_STYLES[worker.availability] || AVAILABILITY_STYLES.unavailable;
  const category = getCategoryBySlug(worker.category);

  return (
    <div className={`${THEME.cardHover} flex flex-col p-4`}>
      <div className="flex items-start gap-3">
        <img
          src={worker.profilePhoto}
          alt={worker.name}
          className="h-14 w-14 rounded-full border border-gray-100 object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">{worker.name}</h3>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <Briefcase size={12} />
            {category?.name || worker.category} · {worker.experience} yrs exp
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={THEME.ratingBadge}>
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {worker.rating.toFixed(1)}
              <span className="font-normal text-gray-400">({worker.reviewsCount})</span>
            </span>
            <span className={THEME.locationTag}>
              <MapPin size={11} />
              {worker.distance}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${availability.bg} ${availability.text}`}>
          <span className={`h-2 w-2 rounded-full ${availability.dot}`} />
          {availability.label}
        </span>
        <span className={THEME.priceTag}>
          <IndianRupee size={11} />
          {worker.price}
          {worker.priceType === "hourly" ? "/hr" : ""}
        </span>
      </div>

      <Link
        to={`/workers/${worker.id}`}
        className="mt-4 block rounded-xl border border-indigo-600 py-2 text-center text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
      >
        View Details
      </Link>
    </div>
  );
};

export default WorkerCard;
