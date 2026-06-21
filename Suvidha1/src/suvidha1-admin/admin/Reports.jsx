import { useState, useEffect, useCallback } from "react";
import { FileDown, FileSpreadsheet, RefreshCw, Loader2, TrendingUp, Users, UserCheck, IndianRupee, Calendar, CheckCircle } from "lucide-react";
import { Card, Btn, SectionHeader } from "./ui";
import api from "./services/api";
import Swal from "sweetalert2";

const swal = {
  background: "linear-gradient(135deg,#0f172a,#1e3a5f)", color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const RANGES = [
  { label: "Last 7 days",   value: "7" },
  { label: "Last 30 days",  value: "30" },
  { label: "Last 3 months", value: "90" },
  { label: "Last year",     value: "365" },
];

function fmt(n) {
  if (n >= 1000000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)    return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

function MiniBar({ data = [] }) {
  if (!data.length) return (
    <div className="h-32 flex items-center justify-center text-sm text-gray-400">No booking data in this range</div>
  );
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-32 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full rounded-t transition-all"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: 4, background: "#2563EB", opacity: 0.75 }} />
          {data.length <= 14 && (
            <span className="text-[9px] text-gray-400 rotate-45 origin-left whitespace-nowrap">
              {d._id?.slice(5)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [range, setRange]   = useState("30");
  const [stats, setStats]   = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/reports?range=${range}`);
      if (data.success) { setStats(data.stats); setCharts(data.charts); }
    } catch {
      await Swal.fire({ ...swal, icon: "error", title: "Load Failed", text: "Could not load report data." });
    } finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  /* ── Export PDF ── */
  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { data } = await api.get(`/admin/reports/export?range=${range}`);
      if (!data.success) throw new Error("Export failed");

      // Dynamically load jsPDF
      const { jsPDF } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").catch(() => {
        throw new Error("jsPDF not available. Install: npm i jspdf");
      }).catch(async () => {
        // Fallback: create CSV-style text and download
        const lines = [
          "SUVIDHA1 PLATFORM REPORT",
          `Generated: ${new Date(data.generatedAt).toLocaleString("en-IN")}`,
          `Range: Last ${range} days`,
          "",
          "=== SUMMARY ===",
          `Total Consumers: ${stats?.totalConsumers}`,
          `New Consumers: ${stats?.newConsumers}`,
          `Total Staff: ${stats?.totalStaff}`,
          `New Staff: ${stats?.newStaff}`,
          `Total Bookings: ${stats?.totalBookings}`,
          `New Bookings: ${stats?.newBookings}`,
          `Completed: ${stats?.completedBookings}`,
          `Cancelled: ${stats?.cancelledBookings}`,
          `Total Revenue: ₹${stats?.totalRevenue?.toFixed(2)}`,
          "",
          "=== NEW CONSUMERS ===",
          "Name,Email,Phone,Verified,Joined",
          ...data.consumers.map(c => `${c.firstName} ${c.lastName},${c.email},${c.phone || ""},${c.isVerified ? "Yes" : "No"},${new Date(c.createdAt).toLocaleDateString("en-IN")}`),
          "",
          "=== NEW STAFF ===",
          "Name,Category,City,Status,Joined",
          ...data.staff.map(s => `${s.user?.firstName || ""} ${s.user?.lastName || ""},${s.category || ""},${s.city || ""},${s.status},${new Date(s.createdAt).toLocaleDateString("en-IN")}`),
          "",
          "=== BOOKINGS ===",
          "Service,Date,Status,Price",
          ...data.bookings.map(b => `${b.service || ""},${b.date || ""},${b.status},₹${b.price || "0"}`),
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement("a"), { href: url, download: `suvidha1-report-${range}d.txt` });
        a.click(); URL.revokeObjectURL(url);
        return null;
      });
      if (!jsPDF) return; // fallback already handled

    } catch (err) {
      // Final fallback — plain text download
      const { data } = await api.get(`/admin/reports/export?range=${range}`);
      const lines = [
        "SUVIDHA1 PLATFORM REPORT",
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        `Range: Last ${range} days`,
        "",
        `Consumers: ${stats?.totalConsumers} total, ${stats?.newConsumers} new`,
        `Staff: ${stats?.totalStaff} total, ${stats?.newStaff} new`,
        `Bookings: ${stats?.totalBookings} total, ${stats?.newBookings} new`,
        `Revenue: ₹${stats?.totalRevenue?.toFixed(2) || "0"}`,
      ];
      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), { href: url, download: `suvidha1-report-${range}d.txt` });
      a.click(); URL.revokeObjectURL(url);
    } finally { setExporting(""); }
  };

  /* ── Export Excel (CSV fallback) ── */
  const exportExcel = async () => {
    setExporting("xlsx");
    try {
      const { data } = await api.get(`/admin/reports/export?range=${range}`);
      if (!data.success) throw new Error();

      const rows = [
        ["Suvidha1 Platform Report"],
        [`Generated: ${new Date(data.generatedAt).toLocaleString("en-IN")}`],
        [`Range: Last ${range} days`],
        [],
        ["Summary"],
        ["Metric", "Value"],
        ["Total Consumers", stats?.totalConsumers],
        ["New Consumers", stats?.newConsumers],
        ["Total Staff", stats?.totalStaff],
        ["New Staff", stats?.newStaff],
        ["Total Bookings", stats?.totalBookings],
        ["New Bookings", stats?.newBookings],
        ["Completed Bookings", stats?.completedBookings],
        ["Cancelled Bookings", stats?.cancelledBookings],
        ["Total Revenue (₹)", stats?.totalRevenue?.toFixed(2)],
        ["Period Revenue (₹)", stats?.newRevenue?.toFixed(2)],
        [],
        ["New Consumers"],
        ["Name", "Email", "Phone", "Verified", "Joined"],
        ...data.consumers.map(c => [
          `${c.firstName} ${c.lastName}`, c.email, c.phone || "",
          c.isVerified ? "Yes" : "No",
          new Date(c.createdAt).toLocaleDateString("en-IN"),
        ]),
        [],
        ["New Staff"],
        ["Name", "Category", "City", "Status", "Joined"],
        ...data.staff.map(s => [
          `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim(),
          s.category || "", s.city || s.serviceCity || "", s.status,
          new Date(s.createdAt).toLocaleDateString("en-IN"),
        ]),
        [],
        ["Bookings"],
        ["Service", "Date", "Status", "Price"],
        ...data.bookings.map(b => [b.service || "", b.date || "", b.status, `₹${b.price || "0"}`]),
      ];

      const csv = rows.map(r => r.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), { href: url, download: `suvidha1-report-${range}d.csv` });
      a.click(); URL.revokeObjectURL(url);
    } catch {
      await Swal.fire({ ...swal, icon: "error", title: "Export Failed", text: "Could not generate Excel file." });
    } finally { setExporting(""); }
  };

  const STAT_CARDS = stats ? [
    { icon: Users,       label: "Total Consumers",   value: stats.totalConsumers,   sub: `+${stats.newConsumers} new`,   color: "text-blue-600",   bg: "bg-blue-50" },
    { icon: UserCheck,   label: "Total Staff",        value: stats.totalStaff,       sub: `+${stats.newStaff} new`,       color: "text-teal-600",   bg: "bg-teal-50" },
    { icon: Calendar,    label: "Total Bookings",     value: stats.totalBookings,    sub: `+${stats.newBookings} new`,    color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: CheckCircle, label: "Completed Bookings", value: stats.completedBookings,sub: `${stats.cancelledBookings} cancelled`, color: "text-emerald-600",bg: "bg-emerald-50" },
    { icon: IndianRupee, label: "Total Revenue",      value: fmt(stats.totalRevenue),sub: `${fmt(stats.newRevenue)} this period`, color: "text-amber-600", bg: "bg-amber-50" },
    { icon: TrendingUp,  label: "Period Revenue",     value: fmt(stats.newRevenue),  sub: `Last ${range} days`,          color: "text-rose-600",   bg: "bg-rose-50" },
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">Reports</h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time platform performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <Btn variant="danger" size="sm" onClick={exportPDF} disabled={!!exporting || loading}>
            {exporting === "pdf" ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
            {exporting === "pdf" ? "Generating…" : "Export PDF"}
          </Btn>
          <Btn variant="success" size="sm" onClick={exportExcel} disabled={!!exporting || loading}>
            {exporting === "xlsx" ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
            {exporting === "xlsx" ? "Generating…" : "Export Excel"}
          </Btn>
        </div>
      </div>

      {/* Range selector */}
      <Card className="mb-4 p-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-gray-700 mr-1">Date Range:</span>
        {RANGES.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition
              ${range === r.value ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {r.label}
          </button>
        ))}
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {STAT_CARDS.map(({ icon: Icon, label, value, sub, color, bg }) => (
              <Card key={label} className="p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl mb-2 ${bg}`}>
                  <Icon size={17} className={color} />
                </div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-[11px] font-medium text-gray-600 mt-0.5">{label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
              </Card>
            ))}
          </div>

          {/* Bookings chart */}
          <Card className="p-5">
            <div className="mb-3">
              <div className="text-sm font-bold text-gray-800">Bookings Over Time</div>
              <div className="text-xs text-gray-400">Daily booking counts for the last {range} days</div>
            </div>
            <MiniBar data={charts?.bookingsByDay || []} />
          </Card>
        </>
      )}
    </div>
  );
}
