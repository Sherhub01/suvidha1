import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, Mail, KeyRound, Eye, EyeOff, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api/admin" });

const swalBase = {
  background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const STEPS = ["Enter Email", "Verify OTP", "New Password"];

export default function AdminForgotPassword() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [step, setStep]               = useState(1);
  const [email, setEmail]             = useState(location.state?.email || "");
  const [emailError, setEmailError]   = useState("");
  const [otp, setOtp]                 = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError]       = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passErrors, setPassErrors]   = useState({});
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

  // Step 1: send OTP via real backend (nodemailer)
  const handleSendOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      await API.post("/forgot-password", { email });
      await Swal.fire({
        ...swalBase, icon: "success", title: "OTP Sent 📩",
        text: `A 6-digit code was sent to ${email}`,
        timer: 2000, timerProgressBar: true, showConfirmButton: false,
      });
      setStep(2);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Could not send OTP. Check the email address.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async () => {
    const entered = otp.join("");
    if (entered.length < 6) { setOtpError("Enter the full 6-digit OTP"); return; }
    setOtpError("");
    setStep(3);
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError("");
    if (value && index < 5) document.getElementById(`fp-otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`fp-otp-${index - 1}`)?.focus();
  };

  // Step 3: reset password via real backend
  const handleResetPassword = async () => {
    const e = {};
    if (!newPass)                    e.newPass = "Password is required";
    else if (newPass.length < 8)     e.newPass = "Minimum 8 characters";
    if (!confirmPass)                e.confirmPass = "Please confirm your password";
    else if (newPass !== confirmPass) e.confirmPass = "Passwords do not match";
    setPassErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await API.post("/reset-password", { email, otp: otp.join(""), newPassword: newPass });
      await Swal.fire({
        ...swalBase, icon: "success", title: "Password Reset! 🎉",
        text: "Your admin password has been updated successfully.",
        confirmButtonColor: "#3b82f6", confirmButtonText: "Sign In",
      });
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setPassErrors({ newPass: err.response?.data?.message || "Reset failed. OTP may have expired." });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (hasError) =>
    `w-full rounded-xl border px-4 py-3 text-sm bg-white/5 text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-blue-400/50 ${hasError ? "border-red-400/60" : "border-white/15 focus:border-blue-400/60"}`;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Suvidha<span className="text-blue-400">1</span>
            </h1>
            <p className="text-sm text-white/40 tracking-widest uppercase mt-0.5">Admin Portal</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl p-8 space-y-6"
          style={{ background: "rgba(255,255,255,0.05)" }}>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Reset Admin Password</h2>
            <p className="text-sm text-white/40 mt-1">We'll verify your identity via OTP</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition"
                  style={{
                    background: i + 1 < step ? "#22c55e" : i + 1 === step ? "#3b82f6" : "rgba(255,255,255,0.1)",
                    color: i + 1 <= step ? "#fff" : "rgba(255,255,255,0.3)",
                  }}>
                  {i + 1 < step ? <CheckCircle size={13} /> : i + 1}
                </div>
                <span className="text-[10px] hidden sm:block" style={{ color: i + 1 === step ? "#fff" : "rgba(255,255,255,0.3)" }}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-5 h-px mx-1 bg-white/15" />}
              </div>
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-white/55 text-center">
                Enter your admin email and we'll send a one-time code.
              </p>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                    placeholder="admin@suvidha1.com"
                    className={`${inputCls(!!emailError)} pl-9`} />
                </div>
                {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
              </div>
              <button onClick={handleSendOtp} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm transition hover:from-blue-400 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-60">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Sending OTP…</>
                  : <><Mail size={15} /> Send OTP</>}
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-white/60 text-center">
                Enter the 6-digit code sent to <span className="text-white font-semibold">{email}</span>
              </p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input key={i} id={`fp-otp-${i}`}
                    maxLength="1" value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    className="w-12 h-12 text-center text-xl font-bold rounded-xl border border-white/20 bg-white/5 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition" />
                ))}
              </div>
              {otpError && <p className="text-xs text-red-400 text-center">{otpError}</p>}
              <button onClick={handleVerifyOtp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm transition hover:opacity-90">
                <KeyRound size={15} /> Verify OTP
              </button>
              <button onClick={() => { setStep(1); setOtp(["","","","","",""]); setOtpError(""); }}
                className="w-full text-xs text-white/40 hover:text-white/70 transition text-center">
                ← Resend or change email
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-white/55 text-center">
                Set a new password for <span className="text-white font-semibold">{email}</span>
              </p>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={newPass}
                    onChange={e => { setNewPass(e.target.value); setPassErrors(p => ({ ...p, newPass: "" })); }}
                    placeholder="Min. 8 characters"
                    className={`${inputCls(!!passErrors.newPass)} pr-11`} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passErrors.newPass && <p className="mt-1 text-xs text-red-400">{passErrors.newPass}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} value={confirmPass}
                    onChange={e => { setConfirmPass(e.target.value); setPassErrors(p => ({ ...p, confirmPass: "" })); }}
                    placeholder="Re-enter new password"
                    className={`${inputCls(!!passErrors.confirmPass)} pr-11`} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passErrors.confirmPass && <p className="mt-1 text-xs text-red-400">{passErrors.confirmPass}</p>}
              </div>
              <button onClick={handleResetPassword} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm transition hover:opacity-90 disabled:opacity-60">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Resetting…</>
                  : <><CheckCircle size={15} /> Reset Password</>}
              </button>
            </div>
          )}

          <div className="flex justify-center">
            <Link to="/admin/login"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition">
              <ArrowLeft size={12} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
