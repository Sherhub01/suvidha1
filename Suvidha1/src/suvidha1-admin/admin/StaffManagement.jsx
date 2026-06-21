import { useState, useEffect, useCallback } from "react";
import { Eye, RefreshCw, Loader2, Trash2 } from "lucide-react";
import { Card, Table, TR, TD, Badge, Btn, Modal, Avatar, SearchBar, SectionHeader, Pagination } from "./ui";
import api from "./services/api";
import Swal from "sweetalert2";

const swal = {
  background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const BACKEND = "http://localhost:5000";

function DocLink({ label, path }) {
  if (!path) return <span className="text-gray-400 text-xs">Not uploaded</span>;
  return (
    <a href={`${BACKEND}${path}`} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-1 text-[12px] font-medium text-green-700 hover:bg-green-100 transition">
      📄 {label}
    </a>
  );
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

export default function StaffManagement() {
  const [staff,   setStaff]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [detail,  setDetail]  = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const PER_PAGE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({ search, page, limit: PER_PAGE });
      const res = await fetch(`${BACKEND}/api/admin/staff?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { setStaff(data.staff); setTotal(data.total); }
    } catch {
      await Swal.fire({ ...swal, icon: "error", title: "Load Failed", text: "Could not load staff list." });
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (s) => {
    setDetailLoading(true);
    setDetail({ profile: s, bookings: [] });
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BACKEND}/api/admin/staff/${s._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDetail({ profile: data.profile, bookings: data.bookings || [] });
    } catch { /* keep partial data */ }
    finally { setDetailLoading(false); }
  };

  const handleDelete = async (s) => {
    const u    = s.user || {};
    const name = s.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim();
    const r = await Swal.fire({
      background: "linear-gradient(135deg,#0f172a,#1e3a5f)", color: "#fff",
      customClass: { popup: "!rounded-2xl !border !border-white/10" },
      icon: "warning", title: `Delete ${name}?`,
      html: `<p style="color:rgba(255,255,255,0.6);font-size:13px">This permanently deletes the staff account and all profile data. This cannot be undone.</p>`,
      showCancelButton: true, confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
    });
    if (!r.isConfirmed) return;
    try {
      await api.delete(`/admin/staff/${s._id}`);
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
      <SectionHeader title="Staff Management" subtitle={`${total} staff members`} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex-1 max-w-xs">
            <SearchBar value={search} onChange={setSearch} placeholder="Search name, email or category…" />
          </div>
          <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
        ) : (
          <Table headers={["Photo", "Name", "Email", "Phone", "Category", "City", "Exp.", "Status", "Actions"]}
            empty={staff.length === 0 ? "No staff found." : undefined}>
            {staff.map(s => {
              const u    = s.user || {};
              const name = s.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "—";
              return (
                <TR key={s._id}>
                  <TD>
                    {s.photo || u.avatar
                      ? <img src={`${BACKEND}${s.photo || u.avatar}`} alt={name} className="h-8 w-8 rounded-full object-cover" />
                      : <Avatar name={name} size="sm" />}
                  </TD>
                  <TD className="font-medium">{name}</TD>
                  <TD className="text-gray-500">{u.email || "—"}</TD>
                  <TD className="text-gray-500">{s.phone || u.phone || "—"}</TD>
                  <TD>{s.category || "—"}</TD>
                  <TD className="text-gray-500">{s.serviceCity || s.city || "—"}</TD>
                  <TD>{s.experience ? `${s.experience} yrs` : "—"}</TD>
                  <TD><Badge status={s.status} /></TD>
                  <TD>
                    <div className="flex items-center gap-1">
                      <Btn variant="outline" size="xs" onClick={() => openDetail(s)}><Eye size={11} /> View</Btn>
                      <Btn variant="ghost" size="xs" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(s)}><Trash2 size={11} /></Btn>
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
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Staff Full Profile" width="max-w-3xl">
        {detail && (() => {
          const s = detail.profile;
          const u = s.user || {};
          const name = s.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "—";
          return (
            <div className="space-y-5 text-[13px]">
              {detailLoading && (
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={13} className="animate-spin" /> Loading full details…
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                {s.photo || u.avatar
                  ? <img src={`${BACKEND}${s.photo || u.avatar}`} alt={name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-gray-100" />
                  : <Avatar name={name} size="lg" />
                }
                <div>
                  <div className="font-bold text-gray-900 text-base">{name}</div>
                  <div className="text-gray-500 text-sm">{s.category} {s.subCategory ? `· ${s.subCategory}` : ""}</div>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    <Badge status={s.status} />
                    {u.isVerified && <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">✓ Email Verified</span>}
                  </div>
                </div>
              </div>

              {/* Personal & Contact */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Personal & Contact</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Row label="Full Name"   value={name} />
                  <Row label="Email"       value={u.email} />
                  <Row label="Phone"       value={s.phone || u.phone} />
                  <Row label="Gender"      value={s.gender} />
                  <Row label="Date of Birth" value={s.dob} />
                  <Row label="Address"     value={[s.street, s.city, s.state, s.pinCode].filter(Boolean).join(", ")} />
                  <Row label="Landmark"    value={s.landmark} />
                </div>
              </div>

              {/* Identity */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Identity Documents</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Row label="Aadhaar No" value={s.aadhaarNo ? `****${s.aadhaarNo.slice(-4)}` : null} />
                  <Row label="PAN No"     value={s.panNo} />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <DocLink label="Aadhaar Card" path={s.aadhaarDoc} />
                  <DocLink label="PAN Card"     path={s.panDoc} />
                  <DocLink label="Certificate"  path={s.certDoc} />
                </div>
              </div>

              {/* Professional */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Professional Info</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Row label="Category"    value={s.category} />
                  <Row label="Sub-Category" value={s.subCategory} />
                  <Row label="Experience"  value={s.experience ? `${s.experience} yrs` : null} />
                  <Row label="Service City" value={s.serviceCity} />
                  <Row label="Service Radius" value={s.serviceRadius ? `${s.serviceRadius} km` : null} />
                </div>
                {s.skills?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.skills.map(sk => (
                        <span key={sk} className="rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[12px] font-medium text-blue-700">{sk}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bank */}
              {s.bankName && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Bank Details</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Row label="Bank Name"   value={s.bankName} />
                    <Row label="Account No"  value={s.accountNumber ? `****${s.accountNumber.slice(-4)}` : null} />
                    <Row label="IFSC"        value={s.ifscCode} />
                    <Row label="Payout"      value={s.payoutMethod} />
                    <Row label="UPI ID"      value={s.upiId} />
                  </div>
                </div>
              )}

              {/* Emergency */}
              {s.emergencyName && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Emergency Contact</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Row label="Name"       value={s.emergencyName} />
                    <Row label="Relation"   value={s.emergencyRelation} />
                    <Row label="Phone"      value={s.emergencyPhone} />
                  </div>
                </div>
              )}

              {/* Bookings */}
              {detail.bookings?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Booking History ({detail.bookings.length})</p>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    {detail.bookings.slice(0, 8).map((b, i) => (
                      <div key={b._id} className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <span className="font-medium text-gray-800">{b.service}</span>
                        <span className="text-gray-400">{b.date}</span>
                        <Badge status={b.status?.toLowerCase()} />
                        <span className="font-semibold text-gray-700">{b.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {s.rejectionReason && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{s.rejectionReason}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Btn variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDelete(detail.profile)}>
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
