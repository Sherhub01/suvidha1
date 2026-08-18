import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserCheck, CalendarCheck, CheckCircle,
  IndianRupee, XCircle, Clock, RefreshCw, Loader2,
} from "lucide-react";
import { StatCard, Card, Table, TR, TD, Badge, Btn, Avatar, SectionHeader } from "../components/ui";
import { assetUrl } from "../../shared/config";
import { adminApi, adminStaffApi } from "../../shared/services/http";
import { Alert } from "../../shared/ui";
import useApiData from "../../shared/hooks/useApiData";



// The dashboard pulls from two route groups, so pick the matching client and
// strip its base path before delegating.
async function apiFetch(path) {
  const client = path.startsWith("/api/staff") ? adminStaffApi : adminApi;
  const { data } = await client.get(path.replace(/^\/api\/(admin|staff)/, ""));
  return data;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    const [s, b, st, c] = await Promise.all([
      apiFetch("/api/admin/stats"),
      apiFetch("/api/admin/bookings?limit=5"),
      apiFetch("/api/staff/admin/list?status=pending"),
      apiFetch("/api/admin/consumers?limit=5"),
    ]);
    return {
      stats: s.success ? s.stats : null,
      bookings: b.success ? b.bookings || [] : [],
      staff: st.success ? st.profiles || [] : [],
      consumers: c.success ? c.consumers || [] : [],
    };
  }, []);

  const { data, loading, error, reload: load } = useApiData(fetchDashboard, {
    initial: { stats: null, bookings: [], staff: [], consumers: [] },
  });

  const { stats, bookings, staff, consumers } = data;

  const STAT_CARDS = stats ? [
    { icon: Users,         label: "Total Consumers",   value: stats.totalConsumers?.toLocaleString() || "0",       color: "blue",  to: "/admin/consumers"      },
    { icon: UserCheck,     label: "Total Staff",        value: stats.totalStaff?.toLocaleString() || "0",          color: "teal",  to: "/admin/staff"          },
    { icon: Clock,         label: "Pending Approvals",  value: String(stats.pendingApprovals || 0),                color: "amber", to: "/admin/staff-approval" },
    { icon: CalendarCheck, label: "Total Bookings",     value: stats.totalBookings?.toLocaleString() || "0",       color: "blue",  to: "/admin/bookings"       },
    { icon: CheckCircle,   label: "Completed Services", value: stats.completedBookings?.toLocaleString() || "0",   color: "green", to: "/admin/bookings"       },
    { icon: IndianRupee,   label: "Total Revenue",      value: `₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`, color: "green", to: "/admin/payments"       },
    { icon: XCircle,       label: "Cancelled Bookings", value: String(stats.cancelledBookings || 0),               color: "red",   to: "/admin/bookings"       },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Dashboard" subtitle="Real-time platform overview" />
        <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {loading && !stats ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400 dark:text-slate-500" /></div>
      ) : (
        <>
          {/* Clickable Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_CARDS.map(s => (
              <button key={s.label} onClick={() => navigate(s.to)}
                className="text-left w-full transition hover:-translate-y-0.5 hover:shadow-md rounded-2xl">
                <StatCard {...s} />
              </button>
            ))}
          </div>

          {/* Recent tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Bookings */}
            <Card>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="text-sm font-bold text-gray-800 dark:text-slate-100">Recent Bookings</div>
                <Btn variant="ghost" size="xs" onClick={() => navigate("/admin/bookings")}>View all →</Btn>
              </div>
              {bookings.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center dark:text-slate-500">No bookings yet.</p>
              ) : (
                <Table headers={["Consumer", "Service", "Status", "Date"]}>
                  {bookings.slice(0, 5).map(b => {
                    const c = b.consumer || {};
                    return (
                      <TR key={b._id} onClick={() => navigate("/admin/bookings")}>
                        <TD className="font-medium">{`${c.firstName || ""} ${c.lastName || ""}`.trim() || "—"}</TD>
                        <TD className="text-gray-500 dark:text-slate-400">{b.service}</TD>
                        <TD><Badge status={b.status?.toLowerCase()} /></TD>
                        <TD className="text-gray-400 text-[12px] dark:text-slate-500">{b.date}</TD>
                      </TR>
                    );
                  })}
                </Table>
              )}
            </Card>

            {/* Pending Staff */}
            <Card>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="text-sm font-bold text-gray-800 dark:text-slate-100">Pending Staff Approvals</div>
                <Btn variant="ghost" size="xs" onClick={() => navigate("/admin/staff-approval")}>View all →</Btn>
              </div>
              {staff.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center dark:text-slate-500">No pending approvals.</p>
              ) : (
                <Table headers={["Staff", "Category", "City", "Status"]}>
                  {staff.slice(0, 5).map(s => {
                    const name = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim() || "—";
                    return (
                      <TR key={s._id} onClick={() => navigate("/admin/staff-approval")}>
                        <TD>
                          <div className="flex items-center gap-2">
                            <Avatar name={name} size="sm" />
                            <span className="font-medium">{name}</span>
                          </div>
                        </TD>
                        <TD className="text-gray-500 dark:text-slate-400">{s.category || "—"}</TD>
                        <TD className="text-gray-500 dark:text-slate-400">{s.city || s.serviceCity || "—"}</TD>
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
              <div className="text-sm font-bold text-gray-800 dark:text-slate-100">Latest Consumer Registrations</div>
              <Btn variant="ghost" size="xs" onClick={() => navigate("/admin/consumers")}>View all →</Btn>
            </div>
            {consumers.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center dark:text-slate-500">No consumers yet.</p>
            ) : (
              <Table headers={["Photo", "Name", "Email", "Phone", "Verified", "Joined"]}>
                {consumers.slice(0, 5).map(c => {
                  const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—";
                  return (
                    <TR key={c._id} onClick={() => navigate("/admin/consumers")}>
                      <TD>
                        {c.avatar
                          ? <img src={assetUrl(c.avatar)} alt={name} className="h-8 w-8 rounded-full object-cover" />
                          : <Avatar name={name} size="sm" />}
                      </TD>
                      <TD className="font-medium">{name}</TD>
                      <TD className="text-gray-500 dark:text-slate-400">{c.email}</TD>
                      <TD className="text-gray-500 dark:text-slate-400">{c.phone || "—"}</TD>
                      <TD>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {c.isVerified ? "✓ Yes" : "Pending"}
                        </span>
                      </TD>
                      <TD className="text-gray-400 text-[12px] dark:text-slate-500">
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
