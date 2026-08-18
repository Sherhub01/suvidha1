import { useId, useState } from "react";
import { Star } from "lucide-react";
import { cx, FOCUS_RING } from "../ui";

/** Read-only star row. */
export function Stars({ value = 0, size = 14, className = "" }) {
  const rounded = Math.round(value);
  return (
    <span className={cx("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          aria-hidden="true"
          className={n <= rounded ? "fill-amber-400 text-amber-400" : "text-slate-200"}
        />
      ))}
    </span>
  );
}

/**
 * Interactive star input.
 *
 * Implemented as a radio group so it is reachable and operable by keyboard,
 * which a row of click-only icons is not.
 */
export default function StarRating({ value, onChange, label = "Rating", size = 26, required = false }) {
  const [hover, setHover] = useState(0);
  const name = useId();
  const shown = hover || value || 0;

  const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>}
      </legend>

      <div className="flex items-center gap-2" onMouseLeave={() => setHover(0)}>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              onMouseEnter={() => setHover(n)}
              className={cx("cursor-pointer rounded p-0.5", FOCUS_RING)}
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="sr-only"
              />
              <span className="sr-only">{`${n} star${n > 1 ? "s" : ""}`}</span>
              <Star
                size={size}
                aria-hidden="true"
                className={cx(
                  "transition",
                  n <= shown ? "fill-amber-400 text-amber-400" : "text-slate-200 hover:text-amber-200"
                )}
              />
            </label>
          ))}
        </div>

        {shown > 0 && <span className="text-xs font-medium text-slate-500">{LABELS[shown]}</span>}
      </div>
    </fieldset>
  );
}
