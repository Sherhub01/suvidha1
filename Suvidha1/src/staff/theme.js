export const T = {
  // Backgrounds
  pageBg:    "#0F172A",
  pageBg2:   "#1E1B4B",
  cardBg:    "rgba(255,255,255,0.08)",
  cardBorder:"rgba(255,255,255,0.12)",
  inputBg:   "rgba(255,255,255,0.07)",

  // Brand / accent
  primary:   "#EC4899",
  secondary: "#8B5CF6",
  success:   "#22C55E",
  warning:   "#F59E0B",
  danger:    "#EF4444",
  info:      "#3B82F6",

  // Text
  heading:   "#FFFFFF",
  text:      "#CBD5E1",
  subText:   "#94A3B8",
  muted:     "#64748B",

  // Chrome
  sidebar:   "#111827",
  header:    "rgba(15,23,42,0.90)",
  iconActive:"#EC4899",
};

// Reusable inline-style helpers
export const card   = { background: T.cardBg,   border: `1px solid ${T.cardBorder}`, borderRadius: 16, backdropFilter: "blur(20px)" };
export const card24 = { background: T.cardBg,   border: `1px solid ${T.cardBorder}`, borderRadius: 24, backdropFilter: "blur(20px)" };
export const input  = { background: T.inputBg,  border: `1px solid ${T.cardBorder}`, borderRadius: 12, color: T.heading, outline: "none" };
