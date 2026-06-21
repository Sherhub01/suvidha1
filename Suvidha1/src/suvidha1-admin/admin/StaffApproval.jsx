import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, Check, X, RefreshCw, Loader2, Trash2, Clock } from "lucide-react";
import { Card, Table, TR, TD, Badge, Btn, Modal, Avatar, Textarea, SearchBar, SectionHeader } from "./ui";
import { adminStaffAPI } from "../../staff/staffAPI";
import api from "./services/api";
import Swal from "sweetalert2";

const swal = {
  background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const BACKEND = "http://localhost:5000";
const POLL_MS = 15000; // refresh every 15 seconds

function DocLink({ label, path }) {
  if (!path) return <span className="text-gray-400 text-xs">Not uploaded</span>;
  return (
    <a href={`${BACKEND}${path}`} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-1 text-[12px] font-medium text-green-700 hover:bg-green-100 transition">
      ✓ {label}
    </a>
  );
}

export default function StaffApproval() {
  const [filter, setFilter]         = useState("pending");
  const [search, setSearch]         = useState("");
  const [staffList, setStaffList]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selected, setSelected]     = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason]         = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await adminStaffAPI.get(`/admin/list?status=${filter}`);
      setStaffList(data.profiles || []);
      setLastRefresh(new Date());
    } catch (err) {
      if (!silent) await Swal.fire({ ...swal, icon: "error", title: "Load Failed", text: err.response?.data?.message || "Could not load staff list." });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filter]);

  // Initial load + polling
  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const filtered = staffList.filter(s => {
    const name = `${s.user?.firstName} ${s.user?.lastName}`.toLowerCase();
    const q    = search.toLowerCase();
    return !q || name.includes(q) || (s.category || "").toLowerCase().includes(q);
  });

  const handleApprove = async (profileId, name) => {
    const r = await Swal.fire({
      ...swal, icon: "question", title: `Approve ${name}?`,
      text: "They will receive dashboard access immediately.",
      showCancelButton: true, confirmButtonText: "Approve",
      confirmButtonColor: "#22c55e", cancelButtonColor: "#6b7280",
    });
    if (!r.isConfirmed) return;
    setActionLoading(true);
    try {
      await adminStaffAPI.patch(`/admin/approve/${profileId}`);
      await Swal.fire({ ...swal, icon: "success", title: "Approved!", text: `${name} can now access the dashboard.`, timer: 1800, showConfirmButton: false });
      setDetailOpen(false);
      load();
    } catch (err) {
      await Swal.fire({ ...swal, icon: "error", title: "Failed", text: err.response?.data?.message || "Could not approve." });
    } finally { setActionLoading(false); }
  };

  const openReject = (s) => { setRejectTarget(s); setReason(""); setRejectOpen(true); };

  const handleReject = async () => {
    if (!reason.trim()) return;
    const name = `${rejectTarget.user?.firstName} ${rejectTarget.user?.lastName}`;
    setActionLoading(true);
    try {
      await adminStaffAPI.patch(`/admin/reject/${rejectTarget._id}`, { reason });
      await Swal.fire({ ...swal, icon: "info", title: "Rejected", text: `${name}'s application has been rejected.`, timer: 1800, showConfirmButton: false });
      setRejectOpen(false); setDetailOpen(false);
      load();
    } catch (err) {
      await Swal.fire({ ...swal, icon: "error", title: "Failed", text: err.response?.data?.message || "Could not reject." });
    } finally { setActionLoading(false); }
  };

  const handleDelete = async (s) => {
    const name = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim();
    const r = await Swal.fire({
      ...swal, icon: "warning", title: `Delete ${name}?`,
      html: `<p style="color:rgba(255,255,255,0.6);font-size:13px">This will permanently delete the staff account and all their data. This cannot be undone.</p>`,
      showCancelButton: true, confirmButtonText: "Delete Permanently",
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
    });
    if (!r.isConfirmed) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/staff/${s._id}`);
      await Swal.fire({ ...swal, icon: "success", title: "Deleted", text: `${name} has been removed.`, timer: 1500, showConfirmButton: false });
      setDetailOpen(false);
      load();
    } catch (err) {
      await Swal.fire({ ...swal, icon: "error", title: "Failed", text: err.response?.data?.message || "Could not delete." });
    } finally { setActionLoading(false); }
  };

  const openDetail = async (s) => {
    try {
      const { data } = await adminStaffAPI.get(`/admin/detail/${s._id}`);
      setSelected(data.profile);
    } catch { setSelected(s); }
    setDetailOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">Staff Approval</h2>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
            {filtered.length} {filter} application{filtered.length !== 1 ? "s" : ""}
            {lastRefresh && (
              <span className="flex items-center gap-1 text-gray-300">
                <Clock size={10} /> Live · refreshes every 15s
              </span>
            )}
          </p>
        </div>
        <button onClick={() => load()} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {["pending", "approved", "rejected"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition
                  ${filter === f ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-xs">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or category…" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
        ) : (
          <Table headers={["Photo", "Name", "Email", "Phone", "Category", "City", "Exp.", "Status", "Actions"]}
            empty={filtered.length === 0 ? `No ${filter} staff applications.` : undefined}>
            {filtered.map(s => {
              const name = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim();
              return (
                <TR key={s._id}>
                  <TD><Avatar name={name || "?"} size="sm" /></TD>
                  <TD className="font-medium">{name || "—"}</TD>
                  <TD className="text-gray-500">{s.user?.email || "—"}</TD>
                  <TD className="text-gray-500">{s.phone || s.user?.phone || "—"}</TD>
                  <TD>{s.category || "—"}</TD>
                  <TD className="text-gray-500">{s.city || s.serviceCity || "—"}</TD>
                  <TD>{s.experience ? `${s.experience} yrs` : "—"}</TD>
                  <TD><Badge status={s.status} /></TD>
                  <TD>
                    <div className="flex items-center gap-1">
                      <Btn variant="outline" size="xs" onClick={() => openDetail(s)}><Eye size={11} /> View</Btn>
                      {s.status === "pending" && (
                        <>
                          <Btn variant="success" size="xs" onClick={() => handleApprove(s._id, name)} disabled={actionLoading}><Check size={11} /> Approve</Btn>
                          <Btn variant="danger"  size="xs" onClick={() => openReject(s)}><X size={11} /> Reject</Btn>
                        </>
                      )}
                      <Btn variant="ghost" size="xs" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(s)} disabled={actionLoading}>
                        <Trash2 size={11} />
                      </Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </Table>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Staff Application Details" width="max-w-2xl">
        {selected && (() => {
          const name = `${selected.user?.firstName || ""} ${selected.user?.lastName || ""}`.trim();
          return (
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div className="col-span-2 flex items-center gap-4 pb-4 border-b border-gray-100">
                <Avatar name={name || "?"} size="lg" />
                <div>
                  <div className="font-bold text-gray-900 text-base">{name || "—"}</div>
                  <div className="text-gray-500">{selected.category} · {selected.city || selected.serviceCity}</div>
                  <Badge status={selected.status} />
                </div>
              </div>
              {[
                ["Email",      selected.user?.email],
                ["Phone",      selected.phone || selected.user?.phone],
                ["Address",    [selected.street, selected.city, selected.state].filter(Boolean).join(", ")],
                ["Experience", selected.experience ? `${selected.experience} yrs` : null],
                ["Aadhaar No", selected.aadhaarNo ? `****${selected.aadhaarNo.slice(-4)}` : null],
                ["PAN No",     selected.panNo],
                ["Bank",       selected.bankName ? `${selected.bankName} ****${(selected.accountNumber || "").slice(-4)}` : null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{k}</div>
                  <div className="text-gray-800 font-medium">{v}</div>
                </div>
              ))}
              <div className="col-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Documents</div>
                <div className="flex flex-wrap gap-2">
                  <DocLink label="Aadhaar Card" path={selected.aadhaarDoc} />
                  <DocLink label="PAN Card"     path={selected.panDoc} />
                  <DocLink label="Certificate"  path={selected.certDoc} />
                </div>
              </div>
              <div className="col-span-2 flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
                {selected.status === "pending" && (
                  <>
                    <Btn variant="success" disabled={actionLoading} onClick={() => handleApprove(selected._id, name)}>
                      {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve
                    </Btn>
                    <Btn variant="danger" disabled={actionLoading} onClick={() => { setDetailOpen(false); openReject(selected); }}>
                      <X size={13} /> Reject
                    </Btn>
                  </>
                )}
                <Btn variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" disabled={actionLoading} onClick={() => handleDelete(selected)}>
                  <Trash2 size={13} /> Delete Account
                </Btn>
                <Btn variant="outline" onClick={() => setDetailOpen(false)}>Close</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Application">
        <p className="text-sm text-gray-600 mb-3">
          Rejecting <strong>{`${rejectTarget?.user?.firstName} ${rejectTarget?.user?.lastName}`}</strong>. Please provide a reason.
        </p>
        <Textarea label="Rejection Reason" rows={4} value={reason} onChange={e => setReason(e.target.value)}
          placeholder="e.g. Documents unclear, incomplete profile…" />
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleReject} disabled={!reason.trim() || actionLoading}>
            {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Send Rejection
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
