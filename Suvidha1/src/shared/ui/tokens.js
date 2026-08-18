// ────────────────────────────────────────────────────────────
// Design tokens
// Single source of truth for the class strings the UI primitives share.
// Change a value here and every Button / Input / Card follows.
// ────────────────────────────────────────────────────────────

/** Joins class names, dropping falsy entries. */
export const cx = (...parts) => parts.filter(Boolean).join(" ");

export const RADIUS = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export const SURFACE = {
  card: "border border-slate-100 bg-white shadow-sm",
  cardHover:
    "border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
  muted: "border border-slate-100 bg-slate-50",
  glass: "border border-white/20 bg-white/10 backdrop-blur-md",
};

/** Visible keyboard focus — applied by every interactive primitive. */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export const FIELD_BASE =
  "w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 " +
  "placeholder:text-slate-400 transition focus:bg-white focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

export const FIELD_STATE = {
  normal: "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
  error: "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100",
};

/** Shared status vocabulary — bookings, staff approval and payments. */
export const STATUS_TONE = {
  scheduled: "bg-blue-50 text-blue-700 ring-blue-600/20",
  confirmed: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
  incomplete: "bg-slate-100 text-slate-600 ring-slate-500/20",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  refunded: "bg-purple-50 text-purple-700 ring-purple-600/20",
  suspended: "bg-rose-50 text-rose-700 ring-rose-600/20",
  disabled: "bg-slate-100 text-slate-600 ring-slate-500/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const TONE_ACCENT = {
  indigo: { bg: "bg-indigo-50", fg: "text-indigo-600", ring: "ring-indigo-600/20" },
  emerald: { bg: "bg-emerald-50", fg: "text-emerald-600", ring: "ring-emerald-600/20" },
  amber: { bg: "bg-amber-50", fg: "text-amber-600", ring: "ring-amber-600/20" },
  rose: { bg: "bg-rose-50", fg: "text-rose-600", ring: "ring-rose-600/20" },
  blue: { bg: "bg-blue-50", fg: "text-blue-600", ring: "ring-blue-600/20" },
  purple: { bg: "bg-purple-50", fg: "text-purple-600", ring: "ring-purple-600/20" },
  slate: { bg: "bg-slate-100", fg: "text-slate-600", ring: "ring-slate-500/20" },
};
