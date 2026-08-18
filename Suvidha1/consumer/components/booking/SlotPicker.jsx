import { useCallback, useMemo } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { bookingsApi } from "../../../shared/services/api";
import useApiData from "../../../shared/hooks/useApiData";
import { Input, Alert, Skeleton, cx, FOCUS_RING } from "../../../shared/ui/index";

/** YYYY-MM-DD for a Date, in the browser's own timezone. */
const toDateInput = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const MAX_ADVANCE_DAYS = 90;

/**
 * Date field plus the professional's free hours for that day.
 *
 * Availability comes from the server, which knows about every existing booking
 * — so a slot that is already taken can no longer be double-booked from the UI.
 */
export default function SlotPicker({ staffId, date, time, onDateChange, onTimeChange, error }) {
  const today = useMemo(() => new Date(), []);
  const minDate = toDateInput(today);
  const maxDate = useMemo(
    () => toDateInput(new Date(today.getTime() + MAX_ADVANCE_DAYS * 86400000)),
    [today]
  );

  const fetchSlots = useCallback(
    ({ signal }) => bookingsApi.availability(staffId, date, { signal }),
    [staffId, date]
  );

  const { data, loading, error: loadError } = useApiData(fetchSlots, {
    enabled: Boolean(staffId && date),
    initial: null,
  });

  const slots = data?.slots || [];
  const free = slots.filter((s) => s.available);

  return (
    <div className="space-y-3">
      <Input
        label="Date"
        type="date"
        icon={CalendarDays}
        value={date}
        min={minDate}
        max={maxDate}
        onChange={(e) => {
          onDateChange(e.target.value);
          onTimeChange("");
        }}
        required
      />

      <div>
        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Clock size={12} aria-hidden="true" />
          Available time
        </span>

        {!date ? (
          <p className="text-xs text-slate-400">Pick a date to see open slots.</p>
        ) : loading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : loadError ? (
          <Alert tone="error">{loadError}</Alert>
        ) : free.length === 0 ? (
          <Alert tone="warning">
            This professional is fully booked on that day. Please choose another date.
          </Alert>
        ) : (
          <div role="radiogroup" aria-label="Available time slots" className="grid grid-cols-4 gap-2">
            {slots.map((slot) => {
              const selected = slot.time === time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!slot.available}
                  onClick={() => onTimeChange(slot.time)}
                  className={cx(
                    "rounded-xl border px-2 py-2 text-xs font-semibold transition",
                    FOCUS_RING,
                    selected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : slot.available
                        ? "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
                        : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                  )}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
