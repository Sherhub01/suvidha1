import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, TrendingUp, User, Settings, LogOut, Zap, ChevronDown, Map } from "lucide-react";
import { T } from "../theme";

const NAV_ITEMS = [
  { to: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/staff/bookings",  label: "Bookings",  icon: CalendarCheck },
  { to: "/staff/map",       label: "Map",        icon: Map },
  { to: "/staff/earnings",  label: "Earnings",   icon: TrendingUp },
  { to: "/staff/profile",   label: "Profile",    icon: User },
  { to: "/staff/settings",  label: "Settings",   icon: Settings },
];

const BACKEND = "http://localhost:5000";

export default function StaffSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const initials  = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "P";
  const avatarSrc = user.avatar ? `${BACKEND}${user.avatar}` : null;
  const fullName  = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Professional";

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => {
    ["token","user","userRole"].forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem("selectedRole");
    navigate("/", { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out
        ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"}`}
      style={{ background: T.sidebar, borderRight: `1px solid ${T.cardBorder}` }}
    >
      {/* Brand */}
      <button
        onClick={onToggle}
        className={`flex h-16 items-center w-full cursor-pointer transition-colors hover:bg-white/5
          ${collapsed ? "justify-center px-0" : "gap-3 px-5"}`}
        style={{ borderBottom: `1px solid ${T.cardBorder}` }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})` }}>
          <Zap size={18} strokeWidth={2.5} color="#fff" />
        </div>
        {!collapsed && (
          <div className="text-left">
            <span className="block text-base font-bold leading-none tracking-tight" style={{ color: T.heading }}>
              Suvidha<span style={{ color: T.primary }}>1</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase" style={{ color: T.muted }}>Professional</span>
          </div>
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={`relative flex items-center gap-3 rounded-xl transition-all duration-200 group
              ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}`}
            style={({ isActive }) => ({
              background: isActive ? `${T.primary}20` : "transparent",
              color: isActive ? T.primary : T.subText,
            })}
          >
            {({ isActive }) => (
              <>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                  style={{ background: isActive ? `${T.primary}25` : "rgba(255,255,255,0.05)" }}>
                  <Icon size={16} strokeWidth={2} />
                </span>
                {!collapsed && <span className="flex-1 text-sm font-medium">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile section — clickable dropdown like TopBar */}
      <div className="px-2 py-4 space-y-2" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen(v => !v)}
            title={collapsed ? fullName : undefined}
            className={`flex w-full items-center gap-3 rounded-xl transition hover:bg-white/10 cursor-pointer
              ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}`}
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden ring-2"
              style={{ ringColor: `${T.primary}50` }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
                : <div className="h-full w-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `linear-gradient(135deg,${T.primary},${T.secondary})`, color: "#fff" }}>
                    {initials}
                  </div>
              }
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-xs font-semibold" style={{ color: T.heading }}>{user.firstName}</p>
                  <p className="truncate text-[10px]" style={{ color: T.muted }}>{user.email || "professional"}</p>
                </div>
                <ChevronDown size={14} className={`transition-transform shrink-0 ${dropOpen ? "rotate-180" : ""}`} style={{ color: T.muted }} />
              </>
            )}
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div
              className={`absolute z-50 w-52 rounded-2xl py-2 shadow-2xl
                ${collapsed ? "left-full ml-2 bottom-0" : "bottom-full mb-2 left-0 right-0"}`}
              style={{ background: "#0F172A", border: `1px solid ${T.cardBorder}` }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                <p className="text-xs font-semibold truncate" style={{ color: T.heading }}>{fullName}</p>
                <p className="text-[11px] truncate" style={{ color: T.muted }}>{user.email || ""}</p>
              </div>

              <button onClick={() => { setDropOpen(false); navigate("/staff/profile"); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs transition hover:bg-white/8"
                style={{ color: T.text }}>
                <User size={13} /> View Profile
              </button>
              <button onClick={() => { setDropOpen(false); navigate("/staff/settings"); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs transition hover:bg-white/8"
                style={{ color: T.text }}>
                <Settings size={13} /> Settings
              </button>

              <div className="mt-1 pt-1" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                <button onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs transition hover:bg-white/8"
                  style={{ color: T.danger }}>
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
