import { Link } from "react-router-dom";
import { cx, SURFACE, STATUS_TONE, TONE_ACCENT, FOCUS_RING } from "./tokens";

/** Base panel. `as="section"`/`interactive` cover the common variations. */
export function Card({ children, className = "", padded = true, interactive = false, as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={cx("rounded-2xl", interactive ? SURFACE.cardHover : SURFACE.card, padded && "p-5", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Status pill. Unknown values fall back to a neutral tone rather than vanishing. */
export function Badge({ children, status, tone, className = "" }) {
  const key = (status ?? tone ?? "neutral").toString().toLowerCase();
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset",
        STATUS_TONE[key] ?? STATUS_TONE.neutral,
        className
      )}
    >
      {children ?? status}
    </span>
  );
}

/** Page/section title with an optional right-hand action. */
export function SectionHeader({ title, subtitle, action, className = "", as: Tag = "h2" }) {
  return (
    <div className={cx("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <Tag className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{title}</Tag>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Metric tile used on all three dashboards. */
export function StatCard({ icon: Icon, label, value, change, hint, tone = "indigo", className = "" }) {
  const accent = TONE_ACCENT[tone] ?? TONE_ACCENT.indigo;
  const positive = typeof change === "number" && change >= 0;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        {Icon && (
          <span className={cx("flex h-10 w-10 items-center justify-center rounded-xl", accent.bg)}>
            <Icon size={20} className={accent.fg} aria-hidden="true" />
          </span>
        )}
        {typeof change === "number" && (
          <span
            className={cx(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}
          >
            {positive ? "+" : ""}
            {change}%
          </span>
        )}
      </div>

      <div className="mt-3 text-2xl font-bold text-slate-900">
        {value ?? <Skeleton className="h-7 w-24" />}
      </div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-400">{hint}</div>}
    </Card>
  );
}

/** Circular avatar that falls back to initials when the image is missing. */
export function Avatar({ src, name = "", size = 40, className = "" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      style={{ width: size, height: size }}
      className={cx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xs font-bold text-indigo-700",
        className
      )}
    >
      {src ? (
        <img src={src} alt={name ? `${name}'s profile photo` : ""} className="h-full w-full object-cover" />
      ) : (
        initials || "?"
      )}
    </span>
  );
}

/** Grey placeholder block for loading states. */
export function Skeleton({ className = "" }) {
  return <span className={cx("block animate-pulse rounded-lg bg-slate-200", className)} aria-hidden="true" />;
}

/** Centred spinner. `label` is announced to screen readers. */
export function Spinner({ size = 24, className = "", label = "Loading" }) {
  return (
    <span role="status" aria-live="polite" className={cx("inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin text-indigo-500"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Full-panel loading state. */
export function LoadingState({ label = "Loading…", className = "" }) {
  return (
    <div className={cx("flex flex-col items-center justify-center gap-3 py-16", className)}>
      <Spinner size={28} label={label} />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

/** "Nothing here yet" panel with an optional call to action. */
export function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={cx("flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", className)}>
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Icon size={24} className="text-slate-400" aria-hidden="true" />
        </span>
      )}
      <div>
        <p className="text-base font-semibold text-slate-800">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const ALERT_TONE = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

/** Inline message block. Errors are announced immediately. */
export function Alert({ tone = "info", title, children, icon: Icon, className = "" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx("flex gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium", ALERT_TONE[tone] ?? ALERT_TONE.info, className)}
    >
      {Icon && <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/** Small clickable chip, optionally a router link. */
export function Chip({ children, icon: Icon, to, onClick, active = false, className = "" }) {
  const classes = cx(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
    active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
    (to || onClick) && FOCUS_RING,
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {Icon && <Icon size={12} aria-hidden="true" />}
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} aria-pressed={active}>
        {Icon && <Icon size={12} aria-hidden="true" />}
        {children}
      </button>
    );
  }

  return (
    <span className={classes}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}
