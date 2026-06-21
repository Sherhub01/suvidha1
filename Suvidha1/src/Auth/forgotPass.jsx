import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Zap, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import API from "../api";

const swalBase = { background: "#0f172a", color: "#fff", confirmButtonColor: "#ec4899" };

const INPUT = "w-full px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400/50 transition text-sm";

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const role      = location.state?.role || sessionStorage.getItem("selectedRole") || "consumer";

  const [step, setStep]           = useState(1);
  const [email, setEmail]         = useState(location.state?.email || "");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const inputsRef = useRef([]);

  const [emailError, setEmailError] = useState("");

  // Step 1 — send OTP via backend (nodemailer)
  const handleSendOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      await API.post("/forgot-password", { email, role });
      setStep(2);
      Swal.fire({ ...swalBase, title: "OTP Sent 📩", text: `Check your inbox at ${email}`, icon: "success", timer: 2000, showConfirmButton: false });
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || "Something went wrong. Please try again.";
      // 400 = invalid email format (server-side), 404 = not registered — show inline, NOT a server alert
      if (status === 400 || status === 404) {
        setEmailError(msg);
      } else {
        Swal.fire({ ...swalBase, title: "Error", text: msg, icon: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
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

  // Step 2 — just move to step 3 (OTP verified server-side when resetting)
  const handleVerifyOtp = () => {
    if (otp.join("").length < 6) {
      Swal.fire({ ...swalBase, title: "Incomplete", text: "Enter all 6 digits.", icon: "warning" });
      return;
    }
    setStep(3);
  };

  // Step 3 — reset password via backend (backend verifies OTP)
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Swal.fire({ ...swalBase, title: "Too Short", text: "Password must be at least 6 characters.", icon: "error" });
      return;
    }
    setLoading(true);
    try {
      await API.post("/reset-password", { email, otp: otp.join(""), newPassword, role });
      await Swal.fire({ ...swalBase, title: "Password Reset! 🎉", text: "Sign in with your new password.", icon: "success", confirmButtonColor: "#22c55e", confirmButtonText: "Sign In" });
      navigate("/login", { state: { role } });
    } catch (err) {
      Swal.fire({ ...swalBase, title: "Reset Failed", text: err.response?.data?.message || "OTP may have expired.", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
      <div className="mb-8 flex items-center gap-3 z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
          <Zap size={22} strokeWidth={2.5} className="text-slate-900" />
        </div>
        <span className="text-3xl font-extrabold text-white tracking-tight">
          Suvidha<span className="text-amber-400">1</span>
        </span>
      </div>

      <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl space-y-6 text-center">
        <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
        <p className="text-sm text-white/50">
          {step === 1 ? "Enter your email to receive an OTP" : step === 2 ? "Enter the OTP sent to your email" : "Set your new password"}
        </p>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="Enter your email" className={INPUT} />
            {emailError && <p className="text-sm text-rose-400 text-left">{emailError}</p>}
            <button onClick={handleSendOtp} disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input key={i} maxLength="1"
                  ref={el => (inputsRef.current[i] = el)}
                  value={digit}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  className="w-12 h-12 text-center text-xl font-bold rounded-xl border border-white/20 bg-white/8 text-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition" />
              ))}
            </div>
            <button onClick={handleVerifyOtp}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl transition hover:opacity-90">
              Verify OTP
            </button>
            <button onClick={() => { setStep(1); setOtp(["","","","","",""]); }}
              className="text-xs text-white/40 hover:text-white/70 transition">
              ← Resend or change email
            </button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                className={`${INPUT} pr-11`} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button onClick={handleResetPassword} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </div>
        )}

        <button onClick={() => navigate("/login", { state: { role } })}
          className="text-xs text-white/40 hover:text-white/70 transition">
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}
