import { Info } from "lucide-react";
import { Skeleton, cx } from "../../../shared/ui/index";
import { formatINR } from "./format";

function Row({ label, value, hint, bold = false, muted = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span
        className={cx(
          "flex items-center gap-1 text-sm",
          bold ? "font-semibold text-slate-900" : muted ? "text-slate-400" : "text-slate-600"
        )}
      >
        {label}
        {hint && (
          <span title={hint} className="cursor-help text-slate-300">
            <Info size={12} aria-hidden="true" />
            <span className="sr-only">{hint}</span>
          </span>
        )}
      </span>
      <span
        className={cx(
          "tabular-nums",
          bold ? "text-base font-bold text-slate-900" : "text-sm text-slate-700"
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Itemised total for a booking.
 *
 * The figures come from the server's quote — the browser no longer computes or
 * sends a price, so what is shown here is exactly what will be charged.
 */
export default function PriceBreakdown({ quote, loading = false, className = "" }) {
  if (loading) {
    return (
      <div className={cx("rounded-xl border border-slate-100 bg-slate-50 p-4", className)}>
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    );
  }

  if (!quote) return null;

  const hourly = quote.priceType === "hourly";

  return (
    <div className={cx("rounded-xl border border-slate-100 bg-slate-50 p-4", className)}>
      <Row
        label={hourly ? `Service (${quote.quantity} hr${quote.quantity > 1 ? "s" : ""})` : "Service charge"}
        value={formatINR(quote.servicePrice)}
      />

      {quote.visitFee > 0 && (
        <Row
          label="Visit fee"
          value={formatINR(quote.visitFee)}
          hint="Covers the professional's travel to your address."
        />
      )}

      {quote.taxPercent > 0 && (
        <Row label={`GST (${quote.taxPercent}%)`} value={formatINR(quote.tax)} muted />
      )}

      <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-700" />

      <Row label="Total payable" value={formatINR(quote.total)} bold />

      <p className="mt-2 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        Final price confirmed by Suvidha1. Free cancellation up to 12 hours before your slot.
      </p>
    </div>
  );
}
