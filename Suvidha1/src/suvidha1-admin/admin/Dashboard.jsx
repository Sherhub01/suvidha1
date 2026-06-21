import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserCheck, CalendarCheck, CheckCircle,
  IndianRupee, XCircle, Clock, RefreshCw, Loader2,
} from "lucide-react";
import { StatCard, Card, Table, TR, TD, Badge, Btn, Avatar, SectionHeader } from "./ui";

const BACKEND = "http://localhost:5000";

function authHeaders() {
  const t = localStorage.getItem("admin_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function apiFetch(path) {
  const res = await fetch(`${BACKEND}${path}`, { headers: authHeaders() });
  return res.json();
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,     setStats]     = useState(null);
  const [bookings,  setBookings]  = useState([]);
  const [staff,     setStaff]     = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b, st, c] = await Promise.all([
        apiFetch("/api/admin/stats"),
        apiFetch("/api/admin/bookings?limit=5"),
        apiFetch("/api/staff/admin/list?status=pending"),
        apiFetch("/api/admin/consumers?limit=5"),
      ]);
      if (s.success)  setStats(s.stats);
      if (b.success)  setBookings(b.bookings || []);
      if (st.success) setStaff(st.profiles || []);
      if (c.success)  setConsumers(c.consumers || []);
    } catch { /* network error */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const STAT_CARDS = stats ? [
    { icon: Users,         label: "Total Consumers",    value: stats.totalConsumers?.toLocaleString() || "0",  color: "blue"   },
    { icon: UserCheck,     label: "Total Staff",         value: stats.totalStaff?.toLocaleString() || "0",     color: "teal"   },
    { icon: Clock,         label: "Pending Approvals",   value: String(stats.pendingApprovals || 0),            color: "amber"  },
    { icon: CalendarCheck, label: "Total Bookings",      value: stats.totalBookings?.toLocaleString() || "0",  color: "blue"   },
    { icon: CheckCircle,   label: "Completed Services",  value: stats.completedBookings?.toLocaleString() || "0", color: "green" },
    { icon: IndianRupee,   label: "Total Revenue",       value: `₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`, color: "green" },
    { icon: XCircle,       label: "Pending Approvals",   value: String(stats.pendingApprovals || 0),            color: "red"    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Dashboard" subtitle="Real-time platform overview" />
        <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading && !stats ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_CARDS.slice(0, 8).map(s => <StatCard key={s.label + s.color} {...s} />)}
          </div>

          {/* Recent tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Bookings */}
            <Card>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="text-sm font-bold text-gray-800">Recent Bookings</div>
                <Btn variant="ghost" size="xs" onClick={() => navigate("/admin/bookings")}>View all →</Btn>
              </div>
              {bookings.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">No bookings yet.</p>
              ) : (
                <Table headers={["Consumer", "Service", "Status", "Date"]}>
                  {bookings.slice(0, 5).map(b => {
                    const c = b.consumer || {};
                    return (
                      <TR key={b._id}>
                        <TD className="font-medium">{`${c.firstName || ""} ${c.lastName || ""}`.trim() || "—"}</TD>
                        <TD className="text-gray-500">{b.service}</TD>
                        <TD><Badge status={b.status?.toLowerCase()} /></TD>
                        <TD className="text-gray-400 text-[12px]">{b.date}</TD>
                      </TR>
                    );
                  })}
                </Table>
              )}
            </Card>

            {/* Pending Staff */}
            <Card>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="text-sm font-bold text-gray-800">Pending Staff Approvals</div>
                <Btn variant="ghost" size="xs" onClick={() => navigate("/admin/staff-approval")}>View all →</Btn>
              </div>
              {staff.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">No pending approvals.</p>
              ) : (
                <Table headers={["Staff", "Category", "City", "Status"]}>
                  {staff.slice(0, 5).map(s => {
                    const name = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim() || "—";
                    return (
                      <TR key={s._id}>
                        <TD>
                          <div className="flex items-center gap-2">
                            <Avatar name={name} size="sm" />
                            <span className="font-medium">{name}</span>
                          </div>
                        </TD>
                        <TD className="text-gray-500">{s.category || "—"}</TD>
                        <TD className="text-gray-500">{s.city || s.serviceCity || "—"}</TD>
                        <TD><Badge status={s.status} /></TD>
                      </TR>
                    );
                  })}
                </Table>
              )}
            </Card>
          </div>

          {/* Latest Consumers */}
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="text-sm font-bold text-gray-800">Latest Consumer Registrations</div>
              <Btn variant="ghost" size="xs" onClick={() => navigate("/admin/consumers")}>View all →</Btn>
            </div>
            {consumers.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No consumers yet.</p>
            ) : (
              <Table headers={["Photo", "Name", "Email", "Phone", "Verified", "Joined"]}>
                {consumers.slice(0, 5).map(c => {
                  const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—";
                  return (
                    <TR key={c._id}>
                      <TD>
                        {c.avatar
                          ? <img src={`${BACKEND}${c.avatar}`} alt={name} className="h-8 w-8 rounded-full object-cover" />
                          : <Avatar name={name} size="sm" />}
                      </TD>
                      <TD className="font-medium">{name}</TD>
                      <TD className="text-gray-500">{c.email}</TD>
                      <TD className="text-gray-500">{c.phone || "—"}</TD>
                      <TD>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {c.isVerified ? "✓ Yes" : "Pending"}
                        </span>
                      </TD>
                      <TD className="text-gray-400 text-[12px]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </TD>
                    </TR>
                  );
                })}
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
