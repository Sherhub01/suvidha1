import { useEffect, useState, useCallback } from "react";
import { Users, TrendingUp, IndianRupee, CalendarCheck, CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Card, StatCard, SectionHeader } from "./ui";

const BACKEND = "http://localhost:5000";
function authHeaders() {
  const t = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${t}` };
}

export default function Analytics() {
  const [stats,    setStats]    = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([
        fetch(`${BACKEND}/api/admin/stats`,         { headers: authHeaders() }).then(r => r.json()),
        fetch(`${BACKEND}/api/admin/bookings?limit=100`, { headers: authHeaders() }).then(r => r.json()),
      ]);
      if (s.success) setStats(s.stats);
      if (b.success) setBookings(b.bookings || []);
    } catch { /* network */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Compute service counts from real bookings
  const serviceCounts = bookings.reduce((acc, b) => {
    const s = b.service || "Other";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxSvc = topServices[0]?.[1] || 1;

  // Status breakdown
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="Analytics" subtitle="Real platform performance metrics" />
        <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading && !stats ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard icon={Users}         label="Total Consumers"    value={stats?.totalConsumers?.toLocaleString() || "0"}    color="blue"   />
            <StatCard icon={Users}         label="Total Professionals" value={stats?.totalStaff?.toLocaleString() || "0"}       color="teal"   />
            <StatCard icon={CalendarCheck} label="Total Bookings"      value={stats?.totalBookings?.toLocaleString() || "0"}    color="indigo" />
            <StatCard icon={CheckCircle}   label="Completed"           value={stats?.completedBookings?.toLocaleString() || "0"} color="green" />
            <StatCard icon={XCircle}       label="Pending Approvals"   value={String(stats?.pendingApprovals || 0)}             color="amber"  />
            <StatCard icon={IndianRupee}   label="Total Revenue"       value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`} color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Booking Status Breakdown */}
            <Card className="p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Booking Status Breakdown</div>
              {bookings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No booking data yet.</p>
              ) : (
                <div className="space-y-3">
                  {[["Scheduled","bg-blue-500"],["Confirmed","bg-indigo-500"],["Completed","bg-emerald-500"],["Cancelled","bg-rose-500"]].map(([status, color]) => {
                    const count = statusCounts[status] || 0;
                    const pct   = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-[13px] mb-1">
                          <span className="font-medium text-gray-700">{status}</span>
                          <span className="text-gray-500">{count} · {pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Top Services */}
            <Card className="p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Most Booked Services</div>
              {topServices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No booking data yet.</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map(([name, count]) => {
                    const pct = Math.round((count / maxSvc) * 100);
                    return (
                      <div key={name}>
                        <div className="flex justify-between text-[13px] mb-1">
                          <span className="font-medium text-gray-700">{name}</span>
                          <span className="text-gray-500">{count} bookings</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
