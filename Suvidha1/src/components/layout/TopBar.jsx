import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, Settings, ChevronDown, Menu, Zap } from "lucide-react";
import { useNotifications } from "../../context/NotificationsContext";
import API from "../../api";

const BACKEND = "http://localhost:5000";

export default function TopBar({ user: userProp, collapsed, onToggle, onSearch }) {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [liveUser, setLiveUser] = useState(null);
  const dropRef = useRef();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    API.get("/me")
      .then((r) => setLiveUser(r.data.user))
      .catch(() => {});
  }, []);

  const user = liveUser || userProp;
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
    localStorage.removeItem("userRole");
    sessionStorage.removeItem("selectedRole");
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/6 bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-md px-4 sm:px-6 shadow-lg">
      
      {/* Mobile menu toggle */}
      <button
        onClick={onToggle}
        title="Toggle menu"
        className="flex lg:hidden items-center justify-center h-10 w-10 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition"
      >
        <Menu size={20} />
      </button>

      {/* Suvidha1 Logo - Only visible when sidebar is collapsed on large screens */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center gap-2 shrink-0 group cursor-pointer select-none"
          title="Open sidebar"
        >
          {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
            <Zap size={17} strokeWidth={2.5} className="text-slate-900" />
          </div> */}
          <span className="font-bold text-white text-2xl tracking-tight group-hover:text-amber-400 transition-colors">
            Suvidha<span className="text-amber-400">1</span>
          </span>
        </button>
      )}

      {/* Spacing divider when logo is shown */}
      {collapsed && (
        <div className="hidden lg:block h-8 w-px bg-white/10" />
      )}

      {/* Center: Search */}
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); onSearch?.(e.target.elements.q.value); }}
        className="flex-1 hidden sm:block max-w-md"
      >
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            name="q"
            type="search"
            placeholder="Search services, professionals…"
            className="w-full rounded-xl border border-white/12 py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
        </div>
      </form>

      {/* Right section: Notifications + Profile */}
      <div className="ml-auto flex items-center gap-2">
        
        {/* Notification bell */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative flex items-center justify-center h-10 w-10 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/10"
          >
            <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 ring-2 ring-amber-400/40">
              {avatarSrc ? (
                <img src={avatarSrc} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 text-xs font-bold">
                  {initials}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user.firstName}</p>
              <p className="text-[10px] text-white/40 leading-tight">Online</p>
            </div>
            <ChevronDown size={14} className={`text-white/40 transition-transform hidden sm:block ${dropOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown menu */}
          {dropOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 shadow-2xl py-2 z-50"
              style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(16px)" }}
            >
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-xs font-semibold text-white truncate">{fullName}</p>
                <p className="text-[11px] text-white/40 truncate">{user.email || ""}</p>
              </div>

              <button
                onClick={() => { setDropOpen(false); navigate("/settings"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:bg-white/6 hover:text-white transition"
              >
                <Settings size={14} /> Settings
              </button>

              <div className="border-t border-white/8 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-rose-400/80 hover:bg-rose-500/15 hover:text-rose-300 transition"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
