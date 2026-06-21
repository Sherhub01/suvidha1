import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Zap, Mail, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import API from "../api";

const swalBase = { background: "#0f172a", color: "#fff", confirmButtonColor: "#f59e0b" };

export default function Otp() {
  const location = useLocation();
  const navigate  = useNavigate();

  const email = location.state?.email || "";
  const role  = location.state?.role  || sessionStorage.getItem("selectedRole") || "";

  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate("/signup");
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length !== 6) return;
    const arr = text.split("");
    setOtp(arr);
    inputsRef.current[5]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      Swal.fire({ ...swalBase, title: "Incomplete", text: "Please enter all 6 digits.", icon: "warning" });
      return;
    }
    setLoading(true);
    try {
      await API.post("/verify-otp", { email, otp: code, role });
      await Swal.fire({
        ...swalBase,
        title: "Email Verified! ✅",
        text: "Now choose a username to continue.",
        icon: "success",
        confirmButtonText: "Continue →",
      });
      navigate("/createUsername", { state: { email, role } });
    } catch (err) {
      Swal.fire({
        ...swalBase,
        title: "Verification Failed",
        text: err.response?.data?.message || "Invalid or expired OTP.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend by re-triggering signup OTP — use forgot-password with role so backend finds the right user
  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await API.post("/forgot-password", { email, role });
      setCountdown(60);
      Swal.fire({ ...swalBase, title: "OTP Resent 📩", text: `New OTP sent to ${email}`, icon: "success", timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ ...swalBase, title: "Failed", text: "Could not resend OTP.", icon: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 overflow-hidden">
      <div className="pointer-events-none absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-amber-500/15 blur-3xl" />

      <div className="mb-8 flex items-center gap-3 z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
          <Zap size={22} strokeWidth={2.5} className="text-slate-900" />
        </div>
        <span className="text-3xl font-extrabold text-white tracking-tight">
          Suvidha<span className="text-amber-400">1</span>
        </span>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 space-y-6 text-center">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Mail size={28} className="text-amber-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
            <p className="text-sm text-white/50 mt-1">We sent a 6-digit OTP to</p>
            <p className="text-sm font-semibold text-amber-400 mt-0.5">{email}</p>
          </div>

          <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input key={i}
                maxLength={1}
                ref={el => (inputsRef.current[i] = el)}
                type="text" inputMode="numeric" value={digit}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                className={`w-11 h-12 text-center text-lg font-bold rounded-xl border transition outline-none
                  ${digit ? "bg-amber-400/10 border-amber-400/60 text-amber-400" : "bg-white/8 border-white/15 text-white"}
                  focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50`}
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading || otp.join("").length < 6}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-sm hover:from-amber-300 hover:to-orange-400 hover:shadow-lg hover:shadow-amber-500/30 transition disabled:opacity-50">
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" /> Verifying…</span>
              : "Verify OTP"}
          </button>

          <button onClick={handleResend} disabled={resending || countdown > 0}
            className="flex items-center justify-center gap-2 mx-auto text-sm text-white/50 hover:text-white/80 transition disabled:opacity-40">
            <RotateCcw size={14} />
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
