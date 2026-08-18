import { useState, useCallback } from "react";
import { Eye, RefreshCw, Loader2, Trash2 } from "lucide-react";
import { Card, Table, TR, TD, Badge, Btn, Modal, Avatar, SearchBar, SectionHeader, Pagination } from "../components/ui";
import api from "../services/api";
import Swal from "sweetalert2";
import { assetUrl } from "../../shared/config";
import { adminApi } from "../../shared/services/http";
import { Alert } from "../../shared/ui";
import useApiData from "../../shared/hooks/useApiData";


function Row({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5 dark:text-slate-500">{label}</div>
      <div className="text-gray-800 font-medium text-[13px] dark:text-slate-100">{value}</div>
    </div>
  );
}

const STATUS_BADGE = {
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  Confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function ConsumerManagement() {
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [detail,    setDetail]    = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const PER_PAGE = 15;

  const fetchConsumers = useCallback(async ({ signal }) => {
    const params = new URLSearchParams({ search, page, limit: PER_PAGE });
    const { data } = await adminApi.get(`/consumers?${params}`, { signal });
    return { consumers: data.consumers || [], total: data.total || 0 };
  }, [search, page]);

  const { data, loading, error, reload: load } = useApiData(fetchConsumers, {
    initial: { consumers: [], total: 0 },
  });

  const { consumers, total } = data;

  const openDetail = async (c) => {
    setDetailLoading(true);
    setDetail({ consumer: c, bookings: [] });
    try {
      const { data } = await adminApi.get(`/consumers/${c._id}`);
      if (data.success) setDetail({ consumer: data.consumer, bookings: data.bookings || [] });
    } catch { /* keep partial */ }
    finally { setDetailLoading(false); }
  };

  const handleDelete = async (c) => {
    const name = `${c.firstName || ""} ${c.lastName || ""}`.trim();
    const r = await Swal.fire({
      background: "linear-gradient(135deg,#0f172a,#1e3a5f)", color: "#fff",
      customClass: { popup: "!rounded-2xl !border !border-white/10" },
      icon: "warning", title: `Delete ${name}?`,
      html: `<p style="color:rgba(255,255,255,0.6);font-size:13px">This permanently deletes the consumer account. This cannot be undone.</p>`,
      showCancelButton: true, confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
    });
    if (!r.isConfirmed) return;
    try {
      await api.delete(`/admin/consumers/${c._id}`);
      await Swal.fire({ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", color: "#fff", customClass: { popup: "!rounded-2xl" }, icon: "success", title: "Deleted", text: `${name} has been removed.`, timer: 1500, showConfirmButton: false });
      setDetail(null);
      load();
    } catch (err) {
      await Swal.fire({ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", color: "#fff", customClass: { popup: "!rounded-2xl" }, icon: "error", title: "Failed", text: err.response?.data?.message || "Could not delete." });
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <SectionHeader title="Consumer Management" subtitle={`${total} registered consumers`} />

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <Card>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex-1 max-w-xs">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
          </div>
          <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400 dark:text-slate-500" /></div>
        ) : (
          <Table headers={["Photo", "Name", "Email", "Phone", "Address", "Verified", "Joined", "Actions"]}
            empty={consumers.length === 0 ? "No consumers found." : undefined}>
            {consumers.map(c => {
              const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—";
              return (
                <TR key={c._id}>
                  <TD>
                    {c.avatar
                      ? <img src={assetUrl(c.avatar)} alt={name} className="h-8 w-8 rounded-full object-cover" />
                      : <Avatar name={name} size="sm" />}
                  </TD>
                  <TD className="font-medium">{name}</TD>
                  <TD className="text-gray-500 dark:text-slate-400">{c.email}</TD>
                  <TD className="text-gray-500 dark:text-slate-400">{c.phone || "—"}</TD>
                  <TD className="text-gray-400 text-[12px] dark:text-slate-500">{c.address || "—"}</TD>
                  <TD>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {c.isVerified ? "✓ Yes" : "Pending"}
                    </span>
                  </TD>
                  <TD className="text-gray-400 text-[12px] dark:text-slate-500">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </TD>
                  <TD>
                    <div className="flex items-center gap-1">
                      <Btn variant="outline" size="xs" onClick={() => openDetail(c)}><Eye size={11} /> View</Btn>
                      <Btn variant="ghost" size="xs" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(c)}><Trash2 size={11} /></Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </Table>
        )}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </Card>

      {/* Full Profile Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Consumer Full Profile" width="max-w-2xl">
        {detail && (() => {
          const c    = detail.consumer;
          const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—";
          return (
            <div className="space-y-5 text-[13px]">
              {detailLoading && (
                <div className="flex items-center gap-2 text-gray-400 text-xs dark:text-slate-500">
                  <Loader2 size={13} className="animate-spin" /> Loading details…
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                {c.avatar
                  ? <img src={assetUrl(c.avatar)} alt={name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-gray-100" />
                  : <Avatar name={name} size="lg" />
                }
                <div>
                  <div className="font-bold text-gray-900 text-base dark:text-slate-50">{name}</div>
                  <div className="text-gray-500 text-sm dark:text-slate-400">{c.email}</div>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${c.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                      {c.isVerified ? "✓ Email Verified" : "Email Unverified"}
                    </span>
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200">Consumer</span>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 dark:text-slate-500">Personal Information</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Row label="First Name"  value={c.firstName} />
                  <Row label="Last Name"   value={c.lastName} />
                  <Row label="Username"    value={c.userName} />
                  <Row label="Phone"       value={c.phone} />
                  <Row label="Address"     value={c.address} />
                  <Row label="Member Since" value={c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null} />
                </div>
                {c.bio && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1 dark:text-slate-500">Bio</div>
                    <p className="text-gray-700 text-sm leading-relaxed dark:text-slate-200">{c.bio}</p>
                  </div>
                )}
              </div>

              {/* Location */}
              {c.location?.coordinates?.[0] !== 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 dark:text-slate-500">Last Known Location</p>
                  <a href={`https://www.google.com/maps?q=${c.location.coordinates[1]},${c.location.coordinates[0]}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-medium text-indigo-700 hover:bg-indigo-100 transition">
                    📍 View on Google Maps ({c.location.coordinates[1].toFixed(4)}, {c.location.coordinates[0].toFixed(4)})
                  </a>
                </div>
              )}

              {/* Bookings */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 dark:text-slate-500">
                  Booking History ({detail.bookings.length})
                </p>
                {detail.bookings.length === 0 ? (
                  <p className="text-gray-400 text-sm dark:text-slate-500">No bookings yet.</p>
                ) : (
                  <div className="rounded-xl border border-gray-100 overflow-hidden dark:border-slate-800">
                    {detail.bookings.slice(0, 10).map((b, i) => (
                      <div key={b._id} className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <span className="font-medium text-gray-800 dark:text-slate-100">{b.service}</span>
                        <span className="text-gray-400 text-[12px] dark:text-slate-500">{b.workerName || "—"}</span>
                        <span className="text-gray-400 text-[12px] dark:text-slate-500">{b.date}</span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[b.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {b.status}
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-slate-200">{b.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                <Btn variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDelete(detail.consumer)}>
                  <Trash2 size={13} /> Delete Account
                </Btn>
                <Btn variant="outline" onClick={() => setDetail(null)}>Close</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
