import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, LogOut, User, Settings, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useNotifications } from "../../context/NotificationsContext";

const BACKEND = "http://localhost:5000";

export default function TopBar({ user, collapsed, onToggle, onSearch }) {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef();
  const { unreadCount } = useNotifications();

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "U";
  const avatarSrc = user.avatar ? `${BACKEND}${user.avatar}` : null;

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.08] bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-md px-4 sm:px-6 shadow-lg">

      {/* Sidebar toggle — works on all screen sizes */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-9 w-9 rounded-xl text-white/60 transition hover:bg-white/[0.10] hover:text-white flex-shrink-0"
        title={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
      </button>

      {/* Brand — visible when sidebar is collapsed */}
      {collapsed && (
        <span className="hidden lg:block font-bold text-white text-lg tracking-tight flex-shrink-0">
          Suvidha<span className="text-amber-400">1</span>
        </span>
      )}
      <span className="font-bold text-white text-lg tracking-tight flex-shrink-0 lg:hidden">
        Suvidha<span className="text-amber-400">1</span>
      </span>

      {/* Search */}
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); onSearch?.(e.target.elements.q.value); }}
        className="flex-1 max-w-sm hidden sm:block"
      >
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            name="q"
            type="search"
            placeholder="Search services, professionals…"
            className="w-full rounded-xl border border-white/[0.12] py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
        </div>
      </form>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">

        {/* Notification bell */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative flex items-center justify-center h-9 w-9 rounded-xl text-white/60 transition hover:bg-white/[0.10] hover:text-white"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 ring-2 ring-slate-900 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.12] px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.10]"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-400/40">
              {avatarSrc ? (
                <img src={avatarSrc} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 text-xs font-bold">
                  {initials}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{fullName}</p>
              <p className="text-[10px] text-white/40 leading-tight">Online</p>
            </div>
            <ChevronDown size={14} className={`text-white/40 transition-transform hidden sm:block ${dropOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/[0.10] shadow-2xl py-2 z-50"
              style={{ background: "rgba(15,23,42,0.97)", backdropFilter: "blur(16px)" }}>
              <div className="px-4 py-3 border-b border-white/[0.08]">
                <p className="text-sm font-semibold text-white truncate">{fullName}</p>
                <p className="text-xs text-white/40 truncate">{user.email || ""}</p>
              </div>
              <button
                onClick={() => { setDropOpen(false); navigate("/settings"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition"
              >
                <User size={15} /> My Profile
              </button>
              <button
                onClick={() => { setDropOpen(false); navigate("/settings"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition"
              >
                <Settings size={15} /> Settings
              </button>
              <div className="border-t border-white/[0.08] mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
