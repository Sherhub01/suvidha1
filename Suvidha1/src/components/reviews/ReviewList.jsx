import { useCallback } from "react";
import { MessageSquare, Star } from "lucide-react";
import { Avatar, Alert, EmptyState, LoadingState, Skeleton, cx } from "../ui";
import { Stars } from "./StarRating";
import { reviewsApi } from "../../services/api";
import useApiData from "../../hooks/useApiData";

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/** Rating average plus the 5→1 star distribution. */
function RatingSummary({ average, total, breakdown }) {
  const max = Math.max(1, ...breakdown.map((b) => b.count));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-32">
        <span className="text-3xl font-bold text-slate-900">{Number(average || 0).toFixed(1)}</span>
        <Stars value={average} size={15} />
        <span className="text-xs text-slate-500">
          {total} review{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        {breakdown.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="flex w-8 items-center gap-0.5 text-[11px] text-slate-500">
              {star}
              <Star size={9} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right text-[11px] tabular-nums text-slate-400">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Real reviews for a professional.
 *
 * Replaces the SAMPLE_REVIEWS constant that rendered the same three invented
 * testimonials on every profile in the app.
 */
export default function ReviewList({ profileId, limit = 10, className = "" }) {
  const fetchReviews = useCallback(
    ({ signal }) => reviewsApi.forProfile(profileId, { limit }, { signal }),
    [profileId, limit]
  );

  const { data, loading, error } = useApiData(fetchReviews, {
    enabled: Boolean(profileId),
    initial: null,
  });

  if (loading) {
    return (
      <div className={cx("space-y-3", className)}>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (error) return <Alert tone="error" className={className}>{error}</Alert>;

  const reviews = data?.reviews || [];

  if (!reviews.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="This professional hasn't been reviewed yet. Be the first once your job is done."
        className={className}
      />
    );
  }

  return (
    <div className={cx("space-y-4", className)}>
      <RatingSummary average={data.average} total={data.total} breakdown={data.breakdown || []} />

      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review._id} className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-start gap-3">
              <Avatar src={review.consumer?.avatar} name={review.consumer?.firstName} size={36} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {review.consumer?.firstName || "Customer"}
                  </span>
                  <Stars value={review.rating} size={12} />
                  <span className="text-[11px] text-slate-400">{formatDate(review.createdAt)}</span>
                </div>

                {review.comment && (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                )}

                {review.reply && (
                  <div className="mt-2.5 rounded-lg border-l-2 border-indigo-200 bg-indigo-50/50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-indigo-700">Response from the professional</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{review.reply}</p>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
