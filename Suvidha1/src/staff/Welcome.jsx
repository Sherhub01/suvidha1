import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Clock, CheckCircle, Loader2 } from "lucide-react";
import staffAPI from "./staffAPI";
import { T } from "./theme";

export default function Welcome() {
  const navigate = useNavigate();
  const [info,    setInfo]    = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    staffAPI.get("/status")
      .then(({ data }) => setInfo(data))
      .catch(() => setInfo({ status: "incomplete", currentStep: 1 }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!info) return;
    if (info.status === "approved") navigate("/staff/dashboard", { replace: true });
    else if (info.status === "pending") navigate("/staff/pending", { replace: true });
  }, [info, navigate]);

  const completedCount = info?.completedSteps?.length || 0;
  const pct = Math.round((completedCount / 5) * 100);
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "S";

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center" style={{ background: T.pageBg }}>
        <Loader2 size={28} className="animate-spin" style={{ color: T.primary }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-6" style={{ background: T.pageBg }}>
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: `${T.primary}10` }} />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl" style={{ background: `${T.secondary}10` }} />

      {/* Progress ring */}
      <div className="relative mb-5 h-24 w-24 z-10">
        <svg className="absolute inset-0" width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="48" cy="48" r="44" fill="none"
            stroke={T.primary} strokeWidth="6"
            strokeDasharray="276.46"
            strokeDashoffset={276.46 - (276.46 * pct) / 100}
            strokeLinecap="round" transform="rotate(-90 48 48)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ring-2"
            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, color: "#fff", ringColor: `${T.primary}30` }}>
            {initials}
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold mb-1 z-10" style={{ color: T.heading }}>Welcome to Suvidha1</h1>
      <p className="text-sm font-semibold mb-1 z-10" style={{ color: T.subText }}>Staff Portal</p>
      <p className="text-xs mb-6 z-10" style={{ color: T.muted }}>Complete your 5-step profile to start accepting jobs</p>

      {/* Steps overview */}
      <div className="w-full max-w-sm mb-6 space-y-2 text-left z-10">
        {[
          { icon: Edit,        label: "Fill 5-step registration form",       done: completedCount >= 5 },
          { icon: Clock,       label: "Wait for admin approval (24–48h)",    done: info?.status === "approved" },
          { icon: CheckCircle, label: "Access your professional dashboard",  done: false },
        ].map(({ icon: Icon, label, done }, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2.5 border"
            style={{
              background:   done ? `${T.success}10` : "rgba(255,255,255,0.04)",
              borderColor:  done ? `${T.success}25` : T.cardBorder,
            }}>
            <Icon size={15} style={{ color: done ? T.success : T.muted }} />
            <span className="text-xs font-medium" style={{ color: done ? T.success : T.subText }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[280px] z-10">
        <button onClick={() => navigate("/staff/verification")}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: `linear-gradient(to right, ${T.primary}, ${T.secondary})`, color: "#fff", boxShadow: `0 8px 24px ${T.primary}30` }}>
          <Edit size={15} /> {completedCount > 0 ? "Continue Registration" : "Start Registration"}
        </button>
      </div>

      <p className="mt-5 text-xs z-10" style={{ color: T.muted }}>
        {completedCount > 0 ? `${completedCount} of 5 steps completed · ${pct}% done` : "0 of 5 steps completed"}
      </p>
      <div className="mt-3 w-full max-w-[280px] h-1.5 rounded-full overflow-hidden z-10" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${T.primary}, ${T.secondary})` }} />
      </div>
    </div>
  );
}
