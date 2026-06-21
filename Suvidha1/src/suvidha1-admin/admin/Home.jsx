import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar  from "./Topbar";
import api from "./services/api";

const PAGE_TITLES = {
  dashboard:       "Dashboard",
  "staff-approval":"Staff Approval",
  staff:           "Staff Management",
  consumers:       "Consumer Management",
  bookings:        "Booking Management",
  services:        "Services Management",
  payments:        "Payments",
  reports:         "Reports",
  analytics:       "Analytics",
  notifications:   "Notifications",
  settings:        "Settings",
  profile:         "My Profile",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const seg   = location.pathname.split("/").filter(Boolean).pop() || "dashboard";
  const title = PAGE_TITLES[seg] || "Admin";

  // Fetch real pending staff count and keep it live
  useEffect(() => {
    const fetchPending = () => {
      api.get("/staff/admin/list?status=pending")
        .then(({ data }) => setPendingCount((data.profiles || []).length))
        .catch(() => {});
    };
    fetchPending();
    const id = setInterval(fetchPending, 20000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-900/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
