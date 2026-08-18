// ────────────────────────────────────────────────────────────
// Design tokens
//
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
  card: "border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
  cardHover:
    "border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 " +
    "hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
  muted: "border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50",
  glass: "border border-white/20 bg-white/10 backdrop-blur-md",
};

/** Visible keyboard focus — applied by every interactive primitive. */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

// ── Form fields ────────────────────────────────────────────
// Two tones: `light` for the app shell, `dark` for the glassmorphism auth and
// admin sign-in screens. Both go through the same components so every field
// keeps its label association and error wiring.

const FIELD_SHELL =
  "w-full rounded-xl border text-sm transition focus:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const FIELD_TONE = {
  light: {
    base:
      `${FIELD_SHELL} bg-slate-50 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 ` +
      "focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 " +
      "dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800",
    normal:
      "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 " +
      "dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20",
    error: "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100",
    label: "text-slate-600 dark:text-slate-300",
    hint: "text-slate-400 dark:text-slate-500",
    icon: "text-slate-400",
    toggle: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
  },
  dark: {
    base:
      `${FIELD_SHELL} bg-white/8 px-4 py-3 text-white placeholder:text-white/35`,
    normal: "border-white/15 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/60",
    error: "border-rose-400/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/50",
    label: "text-white/60",
    hint: "text-white/40",
    icon: "text-white/40",
    toggle: "text-white/40 hover:text-white/80",
  },
};

// Kept for the screens that still compose field markup by hand.
export const FIELD_BASE = FIELD_TONE.light.base;
export const FIELD_STATE = { normal: FIELD_TONE.light.normal, error: FIELD_TONE.light.error };

/** Shared status vocabulary — bookings, staff approval and payments. */
export const STATUS_TONE = {
  scheduled: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300",
  confirmed: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/15 dark:text-indigo-300",
  inprogress: "bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-500/15 dark:text-cyan-300",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300",
  incomplete: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300",
  refunded: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/15 dark:text-purple-300",
  failed: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300",
  suspended: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300",
  disabled: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300",
};

export const TONE_ACCENT = {
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/15", fg: "text-indigo-600 dark:text-indigo-400", ring: "ring-indigo-600/20" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/15", fg: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-600/20" },
  amber: { bg: "bg-amber-50 dark:bg-amber-500/15", fg: "text-amber-600 dark:text-amber-400", ring: "ring-amber-600/20" },
  rose: { bg: "bg-rose-50 dark:bg-rose-500/15", fg: "text-rose-600 dark:text-rose-400", ring: "ring-rose-600/20" },
  blue: { bg: "bg-blue-50 dark:bg-blue-500/15", fg: "text-blue-600 dark:text-blue-400", ring: "ring-blue-600/20" },
  purple: { bg: "bg-purple-50 dark:bg-purple-500/15", fg: "text-purple-600 dark:text-purple-400", ring: "ring-purple-600/20" },
  slate: { bg: "bg-slate-100 dark:bg-slate-700", fg: "text-slate-600 dark:text-slate-300", ring: "ring-slate-500/20" },
};

/** Page/body text colours, for screens that set their own background. */
export const TEXT = {
  heading: "text-slate-900 dark:text-slate-50",
  body: "text-slate-600 dark:text-slate-300",
  muted: "text-slate-400 dark:text-slate-500",
};
