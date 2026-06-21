export default function StatsCard({ icon: Icon, value, label, change, changeColor = "text-green-400", iconBg = "bg-blue-500/20", iconColor = "text-blue-400" }) {
  return (
    <div className="rounded-2xl border border-white/20 p-3.5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.18]"
      style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
      <div className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="text-[22px] font-bold text-white">{value}</div>
      <div className="mt-0.5 text-[11px] text-white/70">{label}</div>
      {change && <div className={`mt-1 text-[11px] ${changeColor}`}>{change}</div>}
    </div>
  );
}
