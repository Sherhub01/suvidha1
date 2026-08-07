import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Zap, Mail, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import API from "../api";

const swalBase = { background: "#0f172a", color: "#fff", confirmButtonColor: "#f59e0b" };

export default function Otp() {
  const location = useLocation();
  const navigate  = useNavigate();

  const email      = location.state?.email || "";
  const role       = location.state?.role  || sessionStorage.getItem("selectedRole") || "";
  const fromSignup = !!location.state?.email && location.state?.fromSignup !== false;

  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpError,  setOtpError]  = useState("");
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) { navigate("/signup"); return; }
    setTimeout(() => inputsRef.current[0]?.focus(), 100);
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
    setOtpError("");
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length !== 6) return;
    setOtp(text.split(""));
    setOtpError("");
    inputsRef.current[5]?.focus();
  };

  const verify = async (code) => {
    if (code.length < 6) { setOtpError("Please enter all 6 digits."); return; }
    setLoading(true);
    setOtpError("");
    try {
      await API.post("/verify-otp", { email, otp: code, role });
      navigate("/createUsername", { state: { email, role } });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired OTP.";
      setOtpError(msg);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    const code = otp.join("");
    if (code.length === 6 && !loading) verify(code);
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await API.post("/resend-otp", { email, role });
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
      Swal.fire({ ...swalBase, title: "OTP Resent 📩", text: `New OTP sent to ${email}`, icon: "success", timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ ...swalBase, title: "Failed", text: "Could not resend OTP.", icon: "error" });
    } finally {
      setResending(false);
    }
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
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 space-y-6 text-center">

          {fromSignup && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300">
              ✅ Account created! Check your email for the OTP.
            </div>
          )}

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
                disabled={loading}
                className={`w-11 h-12 text-center text-lg font-bold rounded-xl border transition outline-none disabled:opacity-60
                  ${digit ? "bg-amber-400/10 border-amber-400/60 text-amber-400" : "bg-white/8 border-white/15 text-white"}
                  ${otpError ? "border-rose-400/60" : ""}
                  focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50`}
              />
            ))}
          </div>

          {otpError && <p className="text-xs text-rose-400 -mt-2">{otpError}</p>}

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying…
            </div>
          )}

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
