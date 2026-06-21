import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Wrench, Info, Settings,
  Zap, LogOut, CalendarCheck, Map, Bell, ChevronDown,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/services",  label: "Services",  icon: Wrench },
  { to: "/bookings",  label: "Bookings",  icon: CalendarCheck },
  { to: "/map",       label: "Map",       icon: Map },
  { to: "/about",     label: "About",     icon: Info },
  { to: "/settings",  label: "Settings",  icon: Settings },
];

const BACKEND = "http://localhost:5000";

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "U";
  const avatarSrc = user.avatar ? `${BACKEND}${user.avatar}` : null;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";

  // Close dropdown on outside click
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
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col
        bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900
        border-r border-white/6 shadow-2xl
        transition-all duration-300 ease-in-out
        ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"}`}
    >
      {/* Brand Header */}
      <button
        onClick={onToggle}
        className={`flex h-16 items-center border-b border-white/6 w-full cursor-pointer hover:bg-white/5 transition-colors
        ${collapsed ? "justify-center px-0" : "gap-3 px-5"}`}
        title={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow">
          <Zap size={18} strokeWidth={2.5} className="text-slate-900" />
        </div>
        {!collapsed && (
          <div className="text-left">
            <span className="block text-lg font-bold text-white tracking-tight leading-none">
              Suvidha<span className="text-amber-400">1</span>
            </span>
            <span className="text-[10px] text-white/40 tracking-widest uppercase">Pro Services</span>
          </div>
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl transition-all duration-200 group
              ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
              ${isActive
                ? "bg-amber-400/15 text-amber-400"
                : "text-white/55 hover:bg-white/6 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors
                  ${isActive ? "bg-amber-400/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                  <Icon size={16} strokeWidth={2} />
                </span>
                {!collapsed && (
                  <span className="flex-1 text-sm font-medium">{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section — clicking opens dropdown like TopBar */}
      <div className="border-t border-white/6 px-2 py-4 space-y-2">
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen((v) => !v)}
            title={collapsed ? fullName : undefined}
            className={`flex w-full items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer
              ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}`}
          >
            <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden ring-2 ring-amber-400/30">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 text-xs font-bold">
                  {initials}
                </div>
              )}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-xs font-semibold text-white">{user.firstName}</p>
                  <p className="truncate text-[10px] text-white/40">{user.email || "user@suvidha"}</p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-white/40 transition-transform shrink-0 ${dropOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {/* Dropdown — same style as TopBar */}
          {dropOpen && (
            <div
              className={`absolute z-50 w-52 rounded-2xl border border-white/10 shadow-2xl py-2
                ${collapsed ? "left-full ml-2 bottom-0" : "bottom-full mb-2 left-0 right-0"}`}
              style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(16px)" }}
            >
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-xs font-semibold text-white truncate">{fullName}</p>
                <p className="text-[11px] text-white/40 truncate">{user.email || ""}</p>
              </div>

              <button
                onClick={() => { setDropOpen(false); navigate("/notifications"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:bg-white/6 hover:text-white transition"
              >
                <Bell size={14} /> Notifications
              </button>

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
    </aside>
  );
}
