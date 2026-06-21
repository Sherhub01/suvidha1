export default function ProgressCard({ title, value, max = 100, color = "#F43F5E", subtitle }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      className="rounded-2xl border border-white/20 p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.18]"
      style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-white">{title}</span>
        <span className="text-[13px] font-bold text-white">{pct}%</span>
      </div>
      {subtitle && <div className="text-[11px] text-white/50 mb-2">{subtitle}</div>}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
