import { Search, Bell } from "lucide-react";

export default function Header({ online, onToggleOnline }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/20 px-4"
      style={{ background: "rgba(0,0,0,0.15)", backdropFilter: "blur(10px)" }}>

      {/* Search */}
      <div className="flex flex-1 max-w-[280px] items-center gap-2 rounded-full border border-white/20 px-3 py-1.5"
        style={{ background: "rgba(255,255,255,0.1)" }}>
        <Search size={14} className="text-white/60 shrink-0" />
        <input
          type="text"
          placeholder="Search jobs, customers…"
          className="flex-1 bg-transparent text-[13px] text-white placeholder-white/50 outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Online toggle */}
        <button
          onClick={onToggleOnline}
          className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div className={`relative h-4 w-7 rounded-full transition-colors ${online ? "bg-green-500" : "bg-white/30"}`}>
            <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${online ? "right-0.5" : "left-0.5"}`} />
          </div>
          <span className="text-[11px] text-white/70">{online ? "Online" : "Offline"}</span>
        </button>

        {/* Notifications */}
        <button className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:bg-white/15 hover:text-white"
          style={{ background: "rgba(255,255,255,0.1)" }}>
          <Bell size={16} />
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F43F5E] text-[9px] font-bold text-white">3</span>
        </button>

        {/* Avatar */}
        <div className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-2 border-white/30 text-[12px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #F43F5E, #F97316)" }}>
          RS
        </div>
      </div>
    </header>
  );
}
