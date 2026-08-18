// Legacy class-string tokens used by the consumer screens.
//
// New UI should compose the primitives in components/ui instead; this remains
// for the pages that still build markup by hand.

export const THEME = {
  heroBg:      "bg-[linear-gradient(135deg,#312E81_0%,#4F46E5_30%,#7C3AED_60%,#06B6D4_100%)]",
  card:        "rounded-2xl border border-gray-100 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
  cardHover:   "rounded-2xl border border-gray-100 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]",
  glassCard:   "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md",
  glassChip:   "rounded-full border border-white/20 bg-white/10 backdrop-blur-md",
  input:       "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100",
  primaryBtn:  "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-60",
  secondaryBtn:"inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 active:scale-95 disabled:opacity-60",
  outlineBtn:  "inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 active:scale-95",
  ratingBadge: "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700",
  locationTag: "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600",
  priceTag:    "inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700",
  errorAlert:  "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600",
  successAlert:"rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700",
};
