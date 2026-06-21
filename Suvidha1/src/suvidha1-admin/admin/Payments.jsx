import { useEffect, useState, useCallback } from "react";
import { IndianRupee, CheckCircle, Clock, TrendingUp, RefreshCw, Loader2, Eye } from "lucide-react";
import { Card, StatCard, Table, TR, TD, Badge, Btn, SearchBar, FilterSelect, SectionHeader, Pagination, Modal, Avatar } from "./ui";

const BACKEND = "http://localhost:5000";
function authHeaders() {
  const t = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${t}` };
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{label}</div>
      <div className="text-gray-800 font-medium text-[13px]">{value}</div>
    </div>
  );
}

const STATUS_OPTS = [
  { value: "Scheduled",  label: "Scheduled"  },
  { value: "Confirmed",  label: "Confirmed"  },
  { value: "Completed",  label: "Completed"  },
  { value: "Cancelled",  label: "Cancelled"  },
];

export default function Payments() {
  const [bookings, setBookings] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [stFilter, setStFilter] = useState("");
  const [page,     setPage]     = useState(1);
  const [detail,   setDetail]   = useState(null);
  const PER_PAGE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE, ...(stFilter ? { status: stFilter } : {}) });
      const [b, s] = await Promise.all([
        fetch(`${BACKEND}/api/admin/bookings?${params}`,  { headers: authHeaders() }).then(r => r.json()),
        fetch(`${BACKEND}/api/admin/stats`,               { headers: authHeaders() }).then(r => r.json()),
      ]);
      if (b.success) { setBookings(b.bookings || []); setTotal(b.total || 0); }
      if (s.success) setStats(s.stats);
    } catch { /* network */ }
    finally { setLoading(false); }
  }, [page, stFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter(b => {
    const q   = search.toLowerCase();
    const con = `${b.consumer?.firstName || ""} ${b.consumer?.lastName || ""}`.toLowerCase();
    const stf = `${b.staff?.firstName || ""} ${b.staff?.lastName || ""}`.toLowerCase();
    return !q || con.includes(q) || stf.includes(q) || b.service?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / PER_PAGE);

  // Compute revenue from completed bookings with numeric price
  const revenue = bookings
    .filter(b => b.status === "Completed")
    .reduce((sum, b) => {
      const n = parseFloat((b.price || "").replace(/[^\d.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="Payments & Transactions" subtitle="All booking payments in real-time" />
        <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={IndianRupee} label="Total Revenue"       value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}      color="green"  />
        <StatCard icon={TrendingUp}  label="Total Bookings"      value={String(stats?.totalBookings || 0)}                       color="blue"   />
        <StatCard icon={CheckCircle} label="Completed"           value={String(stats?.completedBookings || 0)}                   color="teal"   />
        <StatCard icon={Clock}       label="Pending Approvals"   value={String(stats?.pendingApprovals || 0)}                    color="amber"  />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <SearchBar value={search} onChange={setSearch} placeholder="Search consumer, staff, service…" />
          </div>
          <FilterSelect value={stFilter} onChange={setStFilter} options={STATUS_OPTS} placeholder="All Statuses" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
        ) : (
          <Table
            headers={["Consumer", "Professional", "Service", "Date", "Price", "Method", "Payment Status", "Status", "Actions"]}
            empty={filtered.length === 0 ? "No payment records found." : undefined}>
            {filtered.map(b => {
              const con = b.consumer || {};
              const stf = b.staff    || {};
              const conName = `${con.firstName || ""} ${con.lastName || ""}`.trim() || "—";
              const stfName = `${stf.firstName || ""} ${stf.lastName || ""}`.trim() || "—";
              return (
                <TR key={b._id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      {con.avatar
                        ? <img src={`${BACKEND}${con.avatar}`} alt={conName} className="h-7 w-7 rounded-full object-cover" />
                        : <Avatar name={conName} size="xs" />}
                      <span className="font-medium text-[13px]">{conName}</span>
                    </div>
                  </TD>
                  <TD className="text-gray-500">{stfName}</TD>
                  <TD className="font-medium">{b.service}</TD>
                  <TD className="text-gray-400 text-[12px]">{b.date}</TD>
                  <TD className="font-semibold text-gray-800">{b.price || "—"}</TD>
                  <TD className="text-gray-500">{b.paymentMethod || "Cash"}</TD>
                  <TD><Badge status={b.paymentStatus?.toLowerCase() || "pending"} /></TD>
                  <TD><Badge status={b.status?.toLowerCase()} /></TD>
                  <TD>
                    <Btn variant="outline" size="xs" onClick={() => setDetail(b)}>
                      <Eye size={11} /> View
                    </Btn>
                  </TD>
                </TR>
              );
            })}
          </Table>
        )}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Payment Detail" width="max-w-md">
        {detail && (() => {
          const con = detail.consumer || {};
          const stf = detail.staff    || {};
          return (
            <div className="space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <Row label="Service"        value={detail.service} />
                <Row label="Category"       value={detail.category} />
                <Row label="Date"           value={detail.date} />
                <Row label="Time"           value={detail.time} />
                <Row label="Price"          value={detail.price} />
                <Row label="Payment Method" value={detail.paymentMethod} />
                <Row label="Payment Status" value={detail.paymentStatus} />
                <Row label="Booking Status" value={detail.status} />
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Consumer</p>
                <div className="grid grid-cols-2 gap-2">
                  <Row label="Name"  value={`${con.firstName || ""} ${con.lastName || ""}`.trim()} />
                  <Row label="Email" value={con.email} />
                  <Row label="Phone" value={con.phone} />
                </div>
              </div>
              {stf.firstName && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Professional</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Row label="Name"  value={`${stf.firstName || ""} ${stf.lastName || ""}`.trim()} />
                    <Row label="Email" value={stf.email} />
                    <Row label="Phone" value={stf.phone} />
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Btn variant="outline" onClick={() => setDetail(null)}>Close</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
