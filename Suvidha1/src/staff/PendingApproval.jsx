import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, XCircle, RefreshCw, LogOut, FileEdit, Zap } from "lucide-react";
import Swal from "sweetalert2";
import staffAPI from "./staffAPI";
import { T } from "./theme";

const swal = {
  background: T.pageBg, color: T.heading,
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

export default function PendingApproval() {
  const navigate = useNavigate();
  const [status,   setStatus]   = useState("pending");
  const [reason,   setReason]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [checking, setChecking] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const checkStatus = async (showLoader = false) => {
    if (showLoader) setChecking(true);
    try {
      const { data } = await staffAPI.get("/status");
      setStatus(data.status || "incomplete");
      setReason(data.rejectionReason || "");
      if (data.status === "approved") {
        const stored = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({ ...stored, profileCompleted: true }));
        await Swal.fire({
          ...swal, icon: "success", title: "Approved! 🎉",
          html: `<p style='color:${T.subText};font-size:14px'>Your application has been approved.<br/>Welcome to Suvidha1 Professional!</p>`,
          timer: 2500, timerProgressBar: true, showConfirmButton: false,
        });
        navigate("/staff/dashboard", { replace: true });
      }
    } catch { /* silent */ }
    finally { setLoading(false); setChecking(false); }
  };

  useEffect(() => { checkStatus(); }, []);

  const handleLogout = async () => {
    const r = await Swal.fire({
      ...swal, icon: "question", title: "Sign Out?",
      showCancelButton: true, confirmButtonText: "Sign Out",
      confirmButtonColor: T.danger, cancelButtonColor: T.muted,
    });
    if (!r.isConfirmed) return;
    ["token","user","userRole"].forEach(k => localStorage.removeItem(k));
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.pageBg }}>
        <div className="h-8 w-8 border-2 rounded-full animate-spin"
          style={{ borderColor: `${T.primary}40`, borderTopColor: T.primary }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: T.pageBg }}>
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: `${T.primary}12` }} />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: `${T.secondary}10` }} />

      {/* Brand */}
      <div className="mb-8 flex items-center gap-3 z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})` }}>
          <Zap size={20} strokeWidth={2.5} color="#fff" />
        </div>
        <span className="text-2xl font-extrabold tracking-tight" style={{ color: T.heading }}>
          Suvidha<span style={{ color: T.primary }}>1</span>
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl"
        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, backdropFilter: "blur(24px)" }}>

        {/* ── PENDING ── */}
        {status === "pending" && (
          <>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2"
                  style={{ background: `${T.warning}15`, borderColor: `${T.warning}40` }}>
                  <Clock size={36} style={{ color: T.warning }} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: T.warning }} />
                  <span className="relative inline-flex rounded-full h-5 w-5" style={{ background: T.warning }} />
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: T.heading }}>Pending Admin Approval</h1>
                <p className="text-sm mt-1.5" style={{ color: T.subText }}>
                  Hi <span className="font-semibold" style={{ color: T.heading }}>{user.firstName}</span>, your application is under review. You'll be notified once approved.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: "✓", label: "Profile submitted",               done: true  },
                { icon: "✓", label: "Documents uploaded",              done: true  },
                { icon: "⏳", label: "Admin verification in progress", done: false },
                { icon: "🔒", label: "Dashboard access — pending",     done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                  style={{
                    background: item.done ? `${T.success}10` : "rgba(255,255,255,0.04)",
                    borderColor: item.done ? `${T.success}25` : T.cardBorder,
                  }}>
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm" style={{ color: item.done ? T.success : T.muted }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-3.5 text-xs leading-relaxed text-center"
              style={{ background: `${T.warning}10`, border: `1px solid ${T.warning}25`, color: T.warning }}>
              Average review time is <strong>24–48 hours</strong>. Click Refresh to check your status.
            </div>

            <div className="flex gap-3">
              <button onClick={() => checkStatus(true)} disabled={checking}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${T.cardBorder}`, color: T.text }}>
                <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
                {checking ? "Checking…" : "Refresh Status"}
              </button>
              <button onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
                style={{ background: `${T.danger}12`, border: `1px solid ${T.danger}30`, color: T.danger }}>
                <LogOut size={15} />
              </button>
            </div>
          </>
        )}

        {/* ── REJECTED ── */}
        {status === "rejected" && (
          <>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2"
                style={{ background: `${T.danger}15`, borderColor: `${T.danger}40` }}>
                <XCircle size={36} style={{ color: T.danger }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: T.heading }}>Application Rejected</h1>
                <p className="text-sm mt-1.5" style={{ color: T.subText }}>Unfortunately your application was not approved.</p>
              </div>
            </div>
            {reason && (
              <div className="rounded-xl p-4" style={{ background: `${T.danger}12`, border: `1px solid ${T.danger}30` }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: T.danger }}>Reason</p>
                <p className="text-sm" style={{ color: "#fca5a5" }}>{reason}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => navigate("/staff/verification")}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition hover:opacity-90"
                style={{ background: `linear-gradient(to right, ${T.primary}, ${T.secondary})`, color: "#fff" }}>
                <FileEdit size={15} /> Re-submit Application
              </button>
              <button onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${T.cardBorder}`, color: T.subText }}>
                <LogOut size={15} />
              </button>
            </div>
          </>
        )}

        {/* ── INCOMPLETE ── */}
        {status === "incomplete" && (
          <>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2"
                style={{ background: `${T.info}15`, borderColor: `${T.info}40` }}>
                <FileEdit size={36} style={{ color: T.info }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: T.heading }}>Complete Your Application</h1>
                <p className="text-sm mt-1.5" style={{ color: T.subText }}>Please complete all 5 steps to submit your application for review.</p>
              </div>
            </div>
            <button onClick={() => navigate("/staff/verification")}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
              style={{ background: `linear-gradient(to right, ${T.primary}, ${T.secondary})`, color: "#fff" }}>
              <FileEdit size={15} /> Continue Application
            </button>
          </>
        )}
      </div>
    </div>
  );
}
