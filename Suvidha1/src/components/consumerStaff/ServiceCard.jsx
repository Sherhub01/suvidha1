export default function ServiceCard({ icon: Icon, title, description, iconBg = "bg-blue-500/20", iconColor = "text-blue-400", onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-white/20 p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.18] active:scale-95"
      style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="text-[13px] font-semibold text-white">{title}</div>
      {description && <div className="mt-1 text-[11px] text-white/60">{description}</div>}
    </button>
  );
}
