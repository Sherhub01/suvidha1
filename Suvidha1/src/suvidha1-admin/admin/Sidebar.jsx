import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UserCheck, Users, UserSquare2,
  CalendarCheck, Wrench, CreditCard, BarChart3,
  PieChart, Bell, Settings, LogOut, X, ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";

const NAV = [
  { to: "dashboard",      icon: LayoutDashboard, label: "Dashboard" },
  { to: "staff-approval", icon: UserCheck,       label: "Staff Approval", badge: "pending" },
  { to: "staff",          icon: Users,           label: "Staff Management" },
  { to: "consumers",      icon: UserSquare2,     label: "Consumers" },
  { to: "bookings",       icon: CalendarCheck,   label: "Bookings" },
  { to: "services",       icon: Wrench,          label: "Services" },
  { to: "payments",       icon: CreditCard,      label: "Payments" },
  { to: "reports",        icon: BarChart3,       label: "Reports" },
  { to: "analytics",      icon: PieChart,        label: "Analytics" },
  { to: "notifications",  icon: Bell,            label: "Notifications" },
  { to: "settings",       icon: Settings,        label: "Settings" },
];

export default function Sidebar({ open, onClose, pendingCount = 0 }) {
  const navigate = useNavigate();

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
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 z-30 h-full w-60 flex flex-col
        bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900
        border-r border-white/6 shadow-2xl
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">
                Suvidha<span className="text-blue-400">1</span>
              </div>
              <div className="text-[10px] text-white/40 tracking-widest uppercase">Admin</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all group
                ${isActive
                  ? "bg-blue-500/20 text-blue-300 border border-blue-400/20"
                  : "text-white/55 hover:bg-white/6 hover:text-white"}`
              }
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <Icon size={15} />
              </span>
              <span className="flex-1">{label}</span>
              {badge === "pending" && pendingCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/6 p-3">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/55 transition hover:bg-rose-500/15 hover:text-rose-400">
            <LogOut size={15} className="shrink-0" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
