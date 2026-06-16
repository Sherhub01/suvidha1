import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Wrench, Info, Settings,
  Zap, LogOut, Bell, CalendarCheck,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationsContext";

const NAV_ITEMS = [
  { to: "/dashboard",     label: "Dashboard",    icon: LayoutGrid },
  { to: "/services",      label: "Services",     icon: Wrench },
  { to: "/bookings",      label: "Bookings",     icon: CalendarCheck },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/about",         label: "About",         icon: Info },
  { to: "/settings",      label: "Settings",      icon: Settings },
];

const BACKEND = "http://localhost:5000";

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "U";
  const avatarSrc = user.avatar ? `${BACKEND}${user.avatar}` : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col
        bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900
        border-r border-white/[0.08] shadow-2xl
        transition-all duration-300 ease-in-out
        ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-[72px]" : "translate-x-0 w-64"}`}
    >
      {/* Brand — clicking this toggles open/close */}
      <button
        onClick={onToggle}
        className={`flex items-center border-b border-white/[0.08] w-full cursor-pointer
          hover:bg-white/[0.04] transition
          ${collapsed ? "justify-center px-0 py-5" : "gap-3 px-5 py-5"}`}
        title={collapsed ? "Open menu" : "Close menu"}
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
          <Zap size={17} strokeWidth={2.5} className="text-slate-900" />
        </div>
        {!collapsed && (
          <div className="text-left">
            <span className="block text-base font-bold text-white tracking-tight leading-none">
              Suvidha<span className="text-amber-400">1</span>
            </span>
            <span className="text-[10px] text-white/40 tracking-widest uppercase">Pro Services</span>
          </div>
        )}
      </button>

      {/* Nav */}
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
                : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors
                  ${isActive ? "bg-amber-400/20" : "bg-white/[0.05] group-hover:bg-white/[0.10]"}`}>
                  <Icon size={16} strokeWidth={2} />
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{label}</span>
                    {to === "/notifications" && unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </>
                )}
                {collapsed && to === "/notifications" && unreadCount > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card + Logout */}
      <div className="border-t border-white/[0.08] px-2 py-4 space-y-2">
        <div className={`flex items-center gap-3 rounded-xl bg-white/[0.05] ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}`}>
          <div className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-amber-400/30">
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 text-xs font-bold">
                {initials}
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-white/40">{user.email || "user@suvidha.app"}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={`flex w-full items-center gap-2.5 rounded-xl text-sm font-medium text-white/55 transition hover:bg-rose-500/15 hover:text-rose-400
            ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}`}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}
