import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wrench, Info, Settings as SettingsIcon, X, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/services", label: "Services", icon: Wrench },
  { to: "/about", label: "About", icon: Info },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const NavItems = ({ onNavigate }) => (
  <nav className="flex flex-1 flex-col gap-1.5 px-3">
    {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
            isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30" : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={20} className={isActive ? "text-cyan-400" : "text-gray-400"} />
            {label}
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

const Brand = () => (
  <div className="mb-8 flex items-center gap-2 px-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600">
      <Sparkles size={20} className="text-white" />
    </div>
    <div>
      <p className="text-lg font-extrabold leading-tight text-white">Suvidha1</p>
      <p className="text-[11px] uppercase tracking-wider text-gray-400">Help, on demand</p>
    </div>
  </div>
);

/**
 * Dashboard sidebar. Renders as a fixed column on large screens and
 * as a slide-in drawer (controlled by `mobileOpen` / `onClose`) on
 * smaller screens.
 */
const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-gray-900 py-6 lg:flex">
        <Brand />
        <NavItems />
        <div className="mx-3 mt-auto rounded-2xl bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Need urgent help?</p>
          <p className="mt-1 text-xs text-gray-400">
            Search any service and book a verified pro in minutes.
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[80%] transform flex-col bg-gray-900 py-6 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-3 top-3 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20"
          >
            <X size={18} />
          </button>
          <Brand />
          <NavItems onNavigate={onClose} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
