import {
  LayoutDashboard, CalendarCheck, Map, Wallet, FileBadge,
  Bell, UserCircle, Settings, LogOut, Home, Edit, ShieldCheck
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { id: "bookings",     label: "Bookings",     icon: CalendarCheck, badge: 3 },
  { id: "map",          label: "Map",          icon: Map },
  { id: "earnings",     label: "Earnings",     icon: Wallet },
  { id: "documents",    label: "Documents",    icon: FileBadge },
  { id: "notifications",label: "Notifications",icon: Bell, badge: 3 },
  { id: "profile",      label: "Profile",      icon: UserCircle },
  { id: "settings",     label: "Settings",     icon: Settings },
];

const MORE_ITEMS = [
  { id: "welcome",       label: "Welcome",       icon: Home },
  { id: "createprofile", label: "Create Profile", icon: Edit },
  { id: "verification",  label: "Verification",  icon: ShieldCheck },
];

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-all mx-1.5
        ${active
          ? "bg-[#F43F5E] text-white shadow-[0_4px_12px_rgba(244,63,94,0.4)]"
          : "text-white/70 hover:bg-white/15 hover:text-white"}`}
      style={{ width: "calc(100% - 12px)" }}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F43F5E] text-[9px] font-bold text-white">
          {item.badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="relative z-10 flex w-[200px] shrink-0 flex-col border-r border-white/20"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(20px)" }}>
      {/* Logo */}
      <div className="border-b border-white/20 px-4 py-4">
        <div className="text-lg font-bold text-white tracking-tight">Suvidha1</div>
        <div className="text-[10px] uppercase tracking-widest text-white/50 mt-0.5">Staff Portal</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} onClick={onNavigate} />
        ))}

        <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-white/30">More</div>

        {MORE_ITEMS.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} onClick={onNavigate} />
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/20 p-2">
        <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-rose-400 transition hover:bg-white/10">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
