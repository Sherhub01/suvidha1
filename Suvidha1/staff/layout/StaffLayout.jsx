import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Bell, Menu, ChevronDown, Settings, LogOut, Search } from "lucide-react";
import Swal from "sweetalert2";
import { T } from "../theme";
import StaffChatBot from "../components/ChatBot";
import { session } from "../../shared/session";
import { API_AUTH, API_URL, BACKEND_URL } from "../../shared/config";
import { authApi } from "../../shared/services/http";
import { ScrimOverlay, ThemeToggle } from "../../shared/ui";


export default function StaffLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const [liveUser,  setLiveUser]  = useState(null);
  const [unread,    setUnread]    = useState(0);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef();
  const stored    = session.getUser() || {};

  const protectedPaths = ["/staff/dashboard", "/staff/bookings", "/staff/earnings", "/staff/profile", "/staff/map"];
  useEffect(() => {
    if (protectedPaths.some(p => location.pathname.startsWith(p)) && !stored.profileCompleted) {
      navigate("/staff/pending", { replace: true });
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    authApi.get("/me").then(r => setLiveUser(r.data.user)).catch(() => {});
  }, []);

  // Poll unread alert count every 15s
  useEffect(() => {
    const fetchCount = () => {
      const t = session.getToken();
      if (!t) return;
      fetch(`${API_URL}/bookings/alerts/unread-count`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then(r => r.json())
        .then(d => { if (d.success) setUnread(d.count); })
        .catch(() => {});
    };
    fetchCount();
    const id = setInterval(fetchCount, 15000);
    return () => clearInterval(id);
  }, [location.pathname]);

  const user      = liveUser || stored;
  const initials  = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "P";
  const avatarSrc = user.avatar ? `${BACKEND_URL}${user.avatar}` : null;
  const fullName  = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Professional";

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = async () => {
    const res = await Swal.fire({
      background: T.pageBg, color: T.heading,
      customClass: { popup: "!rounded-2xl !border !border-white/10" },
      icon: "question", title: "Sign Out?",
      text: "You will be logged out of the professional portal.",
      showCancelButton: true,
      confirmButtonText: "Sign Out", cancelButtonText: "Cancel",
      confirmButtonColor: T.danger, cancelButtonColor: T.muted,
    });
    if (!res.isConfirmed) return;
    // Clear tab-isolated session
    session.clear();
    // Also clear localStorage
    session.clear();
    sessionStorage.removeItem("selectedRole");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen" style={{ background: T.pageBg }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      {!collapsed && (
        <ScrimOverlay
          onClose={() => setCollapsed(true)}
          label="Close navigation"
          className="lg:hidden"
        />
      )}

      <div className={`flex flex-1 flex-col min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>

        {/* ── Topbar — identical structure to consumer TopBar ── */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/6 bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-md px-4 sm:px-6 shadow-lg">

          {/* Mobile menu toggle */}
          <button onClick={() => setCollapsed(v => !v)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition">
            <Menu size={20} />
          </button>

          {/* Logo — only when sidebar collapsed on desktop */}
          {collapsed && (
            <button onClick={() => setCollapsed(false)}
              className="hidden lg:flex items-center gap-2 shrink-0 group cursor-pointer select-none">
              <span className="font-bold text-white text-2xl tracking-tight group-hover:text-pink-400 transition-colors">
                Suvidha<span style={{ color: T.primary }}>1</span>
              </span>
            </button>
          )}
          {collapsed && <div className="hidden lg:block h-8 w-px bg-white/10" />}

          {/* Search bar */}
          <div className="flex-1 hidden sm:block max-w-md">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="search" placeholder="Search bookings, earnings…"
                className="w-full rounded-xl border border-white/12 py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 transition focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
            </div>
          </div>

          {/* Right: Bell + Profile — no duplicate icons from sidebar */}
          <div className="ml-auto flex items-center gap-2">

            <ThemeToggle className="text-white/60 hover:bg-white/10 hover:text-white" />

            <button onClick={() => navigate("/staff/notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition"
              title="Notifications">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            <div ref={dropRef} className="relative">
              <button onClick={() => setDropOpen(v => !v)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/10">
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 ring-2 ring-pink-400/40">
                  {avatarSrc
                    ? <img src={avatarSrc} alt={fullName} className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center text-xs font-bold"
                        style={{ background: `linear-gradient(135deg,${T.primary},${T.secondary})`, color: "#fff" }}>
                        {initials}
                      </div>
                  }
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user.firstName || "Professional"}</p>
                  <p className="text-[10px] text-white/40 leading-tight">Online</p>
                </div>
                <ChevronDown size={14} className={`hidden sm:block text-white/40 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 shadow-2xl py-2 z-50"
                  style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(16px)" }}>
                  <div className="px-4 py-3 border-b border-white/8">
                    <p className="text-xs font-semibold text-white truncate">{fullName}</p>
                    <p className="text-[11px] text-white/40 truncate">{user.email || ""}</p>
                  </div>
                  <button onClick={() => { setDropOpen(false); navigate("/staff/profile"); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:bg-white/6 hover:text-white transition">
                    <Settings size={13} /> Profile
                  </button>
                  <button onClick={() => { setDropOpen(false); navigate("/staff/settings"); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:bg-white/6 hover:text-white transition">
                    <Settings size={13} /> Settings
                  </button>
                  <div className="border-t border-white/8 mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-rose-400/80 hover:bg-rose-500/15 hover:text-rose-300 transition">
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <footer className="px-6 py-8" style={{ borderTop: `1px solid ${T.cardBorder}`, background: T.sidebar }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-extrabold" style={{ color: T.heading }}>Suvidha<span style={{ color: T.primary }}>1</span></span>
                  <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: `${T.primary}20`, color: T.primary }}>Pro Portal</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: T.muted }}>Empowering professionals with seamless job management and earnings tracking.</p>
              </div>
              {/* Quick links */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: T.muted }}>Quick Links</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Dashboard",    to: "/staff/dashboard" },
                    { label: "My Bookings",  to: "/staff/bookings" },
                    { label: "Earnings",     to: "/staff/earnings" },
                    { label: "Notifications",to: "/staff/notifications" },
                  ].map(({ label, to }) => (
                    <button key={to} onClick={() => navigate(to)}
                      className="text-xs text-left transition hover:opacity-80" style={{ color: T.subText }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Support */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: T.muted }}>Support</p>
                <div className="flex flex-col gap-2">
                  <a href="mailto:support@suvidha1.app" className="text-xs transition hover:opacity-80" style={{ color: T.subText }}>support@suvidha1.app</a>
                  <a href="tel:+911140000000" className="text-xs transition hover:opacity-80" style={{ color: T.subText }}>+91 11 4000 0000</a>
                  <button onClick={() => navigate("/staff/settings")} className="text-xs text-left transition hover:opacity-80" style={{ color: T.subText }}>Settings</button>
                  <button onClick={() => navigate("/staff/profile")} className="text-xs text-left transition hover:opacity-80" style={{ color: T.subText }}>My Profile</button>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs" style={{ color: T.muted }}>© {new Date().getFullYear()} Suvidha1 Technologies Pvt. Ltd. All rights reserved.</p>
              <div className="flex gap-4 text-xs" style={{ color: T.muted }}>
                <span>Professional Portal v2.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* AI Chatbot */}
      <StaffChatBot />
    </div>
  );
}
