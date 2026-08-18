import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Zap, UserCheck } from "lucide-react";
import Swal from "sweetalert2";
import API from "../../shared/api";

const swalBase = {
  background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const INPUT = "w-full px-4 py-3 rounded-xl border border-white/15 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/50 transition text-sm";

export default function CreateUsername() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [username, setUsername] = useState("");
  const [error,    setError]    = useState("");
  const email = location.state?.email || "";
  const [loading,  setLoading]  = useState(false);

  const role = location.state?.role || sessionStorage.getItem("selectedRole");

  // Reaching this step without an email means the signup flow was skipped.
  useEffect(() => {
    if (!location.state?.email) navigate("/signup");
  }, [location.state, navigate]);

  const validate = (v) => {
    if (!v || v.length < 3)              return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(v))     return "Only letters, numbers and underscore allowed";
    return "";
  };

  const handleSubmit = async () => {
    const err = validate(username.trim());
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      await API.post("/complete-signup", { email, username: username.trim(), role });
      // Navigate immediately — no blocking Swal
      navigate("/login", { state: { role, justSignedUp: true } });
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("taken") || msg.toLowerCase().includes("already")) {
        setError("Username already taken. Try another.");
      } else if (err.code === "ECONNABORTED" || !err.response) {
        setError("Connection error. Please try again.");
      } else {
        await Swal.fire({ ...swalBase, icon: "error", title: "Failed",
          text: msg || "Could not save username.", confirmButtonColor: "#ef4444" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="mb-8 flex items-center gap-3 z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
          <Zap size={22} strokeWidth={2.5} className="text-slate-900" />
        </div>
        <span className="text-3xl font-extrabold text-white tracking-tight">
          Suvidha<span className="text-amber-400">1</span>
        </span>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 space-y-5 text-center">

          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <UserCheck size={26} className="text-amber-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Choose a Username</h1>
            <p className="text-sm text-white/50 mt-1">This is how others will find you on Suvidha1.</p>
          </div>

          <div className="text-left">
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={handleKey}
              placeholder="e.g. john_doe"
              // eslint-disable-next-line jsx-a11y/no-autofocus -- single-field step; focus belongs here
                autoFocus
              style={{ background: "rgba(255,255,255,0.07)" }}
              className={INPUT}
            />
            {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !username.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-sm tracking-wide hover:from-amber-300 hover:to-orange-400 transition disabled:opacity-60"
          >
            {loading
              ? <><span className="h-4 w-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" /> Saving…</>
              : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
