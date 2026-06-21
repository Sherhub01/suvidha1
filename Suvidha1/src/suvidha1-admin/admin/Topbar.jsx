import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";

export default function Topbar({ onMenuClick, title = "Dashboard" }) {
  const navigate  = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef();

  const admin = JSON.parse(localStorage.getItem("admin_user") || "{}");

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
      color: "#fff",
      customClass: { popup: "!rounded-2xl !border !border-white/10" },
      icon: "question",
      title: "Sign Out?",
      text: "You will be logged out of the admin panel.",
      showCancelButton: true,
      confirmButtonText: "Sign Out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/6 bg-gradient-to-r from-slate-900/95 via-blue-950/95 to-slate-900/95 backdrop-blur-md px-4 lg:px-6 shadow-lg">

      <button onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition lg:hidden">
        <Menu size={20} />
      </button>

      <h1 className="text-sm font-semibold text-white hidden sm:block">{title}</h1>

      {/* Search */}
      <form className="ml-auto hidden sm:block max-w-xs flex-1">
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input placeholder="Search anything…"
            className="w-full rounded-xl border border-white/12 py-1.5 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition"
            style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>
      </form>

      {/* Profile dropdown */}
      <div ref={dropRef} className="relative ml-auto sm:ml-2">
        <button onClick={() => setDropOpen(v => !v)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/10 transition">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck size={14} />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[12px] font-semibold text-white leading-none">{admin.name || "Admin"}</div>
            <div className="text-[10px] text-white/40 mt-0.5">Super Admin</div>
          </div>
          <ChevronDown size={14} className={`text-white/40 transition-transform hidden sm:block ${dropOpen ? "rotate-180" : ""}`} />
        </button>

        {dropOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 shadow-2xl py-2 z-50"
            style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(16px)" }}>
            <div className="px-4 py-3 border-b border-white/8">
              <p className="text-xs font-semibold text-white truncate">{admin.name || "Admin"}</p>
              <p className="text-[11px] text-white/40 truncate">{admin.email || ""}</p>
            </div>
            <button onClick={() => { setDropOpen(false); navigate("/admin/settings"); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-white/70 hover:bg-white/6 hover:text-white transition">
              <Settings size={13} /> Settings
            </button>
            <div className="border-t border-white/8 mt-1 pt-1">
              <button onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400/80 hover:bg-rose-500/15 hover:text-rose-300 transition">
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
