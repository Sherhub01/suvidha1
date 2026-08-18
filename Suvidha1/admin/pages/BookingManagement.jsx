import { useState, useCallback } from "react";
import { RefreshCw, Loader2, Eye, X } from "lucide-react";
import { Card, Table, TR, TD, Badge, Btn, Modal, SearchBar, FilterSelect, SectionHeader, Pagination, Avatar } from "../components/ui";
import { adminApi } from "../../shared/services/http";
import { assetUrl } from "../../shared/config";
import { Alert } from "../../shared/ui";
import useApiData from "../../shared/hooks/useApiData";

const STATUS_OPTS = ["Scheduled","Confirmed","Completed","Cancelled"].map(v => ({ value: v, label: v }));

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5 dark:text-slate-500">{label}</div>
      <div className="text-gray-800 font-medium text-[13px] dark:text-slate-100">{value}</div>
    </div>
  );
}

export default function BookingManagement() {
  const [search,   setSearch]   = useState("");
  const [stFilter, setStFilter] = useState("");
  const [page,     setPage]     = useState(1);
  const [detail,   setDetail]   = useState(null);
  const PER_PAGE = 15;

  const fetchBookings = useCallback(async ({ signal }) => {
    const params = new URLSearchParams({ page, limit: PER_PAGE, ...(stFilter ? { status: stFilter } : {}) });
    const { data } = await adminApi.get(`/bookings?${params}`, { signal });
    return { bookings: data.bookings || [], total: data.total || 0 };
  }, [page, stFilter]);

  const { data, loading, error, reload: load } = useApiData(fetchBookings, {
    initial: { bookings: [], total: 0 },
  });

  const { bookings, total } = data;

  const filtered = bookings.filter(b => {
    const q   = search.toLowerCase();
    const con = `${b.consumer?.firstName || ""} ${b.consumer?.lastName || ""}`.toLowerCase();
    const stf = `${b.staff?.firstName || ""} ${b.staff?.lastName || ""}`.toLowerCase();
    const wName = (b.workerName || "").toLowerCase();
    return !q || con.includes(q) || stf.includes(q) || wName.includes(q) || b.service?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <SectionHeader title="Booking Management" subtitle={`${total} total bookings`} />

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <Card>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <SearchBar value={search} onChange={setSearch} placeholder="Search consumer, staff, service…" />
          </div>
          <FilterSelect value={stFilter} onChange={setStFilter} options={STATUS_OPTS} placeholder="All Statuses" />
          <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400 dark:text-slate-500" /></div>
        ) : (
          <Table
            headers={["Consumer", "Staff", "Service", "Date", "Time", "Address", "Price", "Status", "Actions"]}
            empty={filtered.length === 0 ? "No bookings found." : undefined}>
            {filtered.map(b => {
              const con = b.consumer || {};
              const stf = b.staff    || {};
              const conName = `${con.firstName || ""} ${con.lastName || ""}`.trim() || "—";
              const stfName = `${stf.firstName || ""} ${stf.lastName || ""}`.trim() || b.workerName || "—";
              return (
                <TR key={b._id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      {con.avatar
                        ? <img src={assetUrl(con.avatar)} alt={conName} className="h-7 w-7 rounded-full object-cover" />
                        : <Avatar name={conName} size="xs" />}
                      <span className="font-medium text-[13px]">{conName}</span>
                    </div>
                  </TD>
                  <TD className="text-gray-500 dark:text-slate-400">{stfName}</TD>
                  <TD className="font-medium">{b.service}</TD>
                  <TD className="text-gray-400 text-[12px] dark:text-slate-500">{b.date}</TD>
                  <TD className="text-gray-400 text-[12px] dark:text-slate-500">{b.time || "—"}</TD>
                  <TD className="text-gray-400 text-[12px] max-w-[160px] truncate dark:text-slate-500">{b.address || "—"}</TD>
                  <TD className="font-semibold text-gray-700 dark:text-slate-200">{b.price || "—"}</TD>
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

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Booking Details" width="max-w-xl">
        {detail && (() => {
          const con = detail.consumer || {};
          const stf = detail.staff    || {};
          const conName = `${con.firstName || ""} ${con.lastName || ""}`.trim() || "—";
          const stfName = `${stf.firstName || ""} ${stf.lastName || ""}`.trim() || detail.workerName || "—";
          return (
            <div className="space-y-4 text-[13px]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <p className="font-bold text-gray-900 text-base dark:text-slate-50">{detail.service}</p>
                  <p className="text-gray-400 text-xs mt-0.5 dark:text-slate-500">ID: {detail._id}</p>
                </div>
                <Badge status={detail.status?.toLowerCase()} />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 dark:text-slate-500">Consumer</p>
                <div className="grid grid-cols-2 gap-2">
                  <Row label="Name"    value={conName} />
                  <Row label="Email"   value={con.email} />
                  <Row label="Phone"   value={con.phone} />
                  <Row label="Address" value={con.address} />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 dark:text-slate-500">Professional</p>
                <div className="grid grid-cols-2 gap-2">
                  <Row label="Name"    value={stfName} />
                  <Row label="Email"   value={stf.email} />
                  <Row label="Phone"   value={stf.phone || detail.workerPhone} />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 dark:text-slate-500">Booking Info</p>
                <div className="grid grid-cols-2 gap-2">
                  <Row label="Service"        value={detail.service} />
                  <Row label="Category"       value={detail.category} />
                  <Row label="Date"           value={detail.date} />
                  <Row label="Time"           value={detail.time} />
                  <Row label="Address"        value={detail.address} />
                  <Row label="Price"          value={detail.price} />
                  <Row label="Payment Method" value={detail.paymentMethod} />
                  <Row label="Payment Status" value={detail.paymentStatus} />
                  {detail.rating && <Row label="Rating" value={`${detail.rating} ★`} />}
                </div>
                {detail.description && (
                  <div className="mt-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1 dark:text-slate-500">Description</div>
                    <p className="text-gray-700 dark:text-slate-200">{detail.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-slate-800">
                <Btn variant="outline" onClick={() => setDetail(null)}>Close</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
