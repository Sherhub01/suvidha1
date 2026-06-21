import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, UserPlus, Mail, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api/admin" });

const swalBase = {
  background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const STEPS = ["Details", "Verify OTP", "Done"];

export default function AdminSignup() {
  const navigate = useNavigate();
  const [step, setStep]               = useState(1);
  const [form, setForm]               = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp]                 = useState(["", "", "", "", "", ""]);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(er => ({ ...er, [name]: "" }));
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) document.getElementById(`admin-otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`admin-otp-${index - 1}`)?.focus();
  };

  // ── Step 1: validate + send OTP via nodemailer ──────────
  const handleSendOtp = async () => {
    const e = {};
    if (!form.name.trim())     e.name = "Full name is required";
    if (!form.email.trim())    e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)        e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await API.post("/send-otp", { email: form.email, name: form.name });
      await Swal.fire({
        ...swalBase, icon: "success",
        title: "OTP Sent 📩",
        text: `A 6-digit code was sent to ${form.email}`,
        timer: 2000, timerProgressBar: true, showConfirmButton: false,
      });
      setStep(2);
    } catch (err) {
      await Swal.fire({
        ...swalBase, icon: "error",
        title: "Failed to send OTP",
        text: err.response?.data?.message || "Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP + create account ─────────────────
  const handleVerifyAndCreate = async () => {
    const entered = otp.join("");
    if (entered.length < 6) { setErrors({ otp: "Enter the full 6-digit OTP" }); return; }

    setLoading(true);
    try {
      const { data } = await API.post("/signup", {
        name:     form.name,
        email:    form.email,
        password: form.password,
        otp:      entered,
      });
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));
      setStep(3);
    } catch (err) {
      setErrors({ otp: err.response?.data?.message || "Could not create account." });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full rounded-xl border px-4 py-3 text-sm bg-white/5 text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-blue-400/50 ${errors[field] ? "border-red-400/60" : "border-white/15 focus:border-blue-400/60"}`;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 overflow-hidden py-8">
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
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

        <div className="rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl backdrop-blur-2xl"
          style={{ background: "rgba(255,255,255,0.05)" }}>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Create Admin Account</h2>
            <p className="text-sm text-white/40 mt-1">Verified via email OTP</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition"
                  style={{
                    background: i + 1 < step ? "#22c55e" : i + 1 === step ? "#3b82f6" : "rgba(255,255,255,0.1)",
                    color: i + 1 <= step ? "#fff" : "rgba(255,255,255,0.3)",
                  }}>
                  {i + 1 < step ? <CheckCircle size={13} /> : i + 1}
                </div>
                <span className="text-[11px]" style={{ color: i + 1 === step ? "#fff" : "rgba(255,255,255,0.3)" }}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-6 h-px bg-white/15" />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Full Name</label>
                <input name="name" type="text" value={form.name} onChange={handle}
                  placeholder="John Admin" className={inputCls("name")} />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Email Address <span className="text-blue-400/70 ml-1">(OTP sent here)</span>
                </label>
                <input name="email" type="email" value={form.email} onChange={handle}
                  placeholder="admin@example.com" className={inputCls("email")} />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
                <div className="relative">
                  <input name="password" type={showPass ? "text" : "password"} value={form.password}
                    onChange={handle} placeholder="Min. 8 characters"
                    className={`${inputCls("password")} pr-11`} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input name="confirmPassword" type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                    onChange={handle} placeholder="Re-enter password"
                    className={`${inputCls("confirmPassword")} pr-11`} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>

              <button onClick={handleSendOtp} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm transition hover:from-blue-400 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-60">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Sending OTP…</>
                  : <><Mail size={15} /> Send OTP to Email</>}
              </button>

              <p className="text-center text-sm text-white/40">
                Already have an account?{" "}
                <Link to="/admin/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* ── Step 2: Verify OTP ── */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-white/60 text-center">
                Enter the 6-digit code sent to{" "}
                <span className="text-white font-semibold">{form.email}</span>
              </p>

              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input key={i} id={`admin-otp-${i}`}
                    maxLength="1" value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    className="w-12 h-12 text-center text-xl font-bold rounded-xl border border-white/20 bg-white/5 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition" />
                ))}
              </div>
              {errors.otp && <p className="text-xs text-red-400 text-center">{errors.otp}</p>}

              <button onClick={handleVerifyAndCreate} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm transition hover:opacity-90 disabled:opacity-60">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                  : <><UserPlus size={15} /> Verify & Create Account</>}
              </button>

              <button onClick={() => { setStep(1); setOtp(["","","","","",""]); setErrors({}); }}
                className="w-full text-xs text-white/40 hover:text-white/70 transition text-center">
                ← Change email or resend OTP
              </button>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 3 && (
            <div className="flex flex-col items-center gap-5 text-center py-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 border-2 border-green-400/40">
                <CheckCircle size={38} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Account Created!</h3>
                <p className="text-sm text-white/50 mt-1">
                  Welcome, <span className="text-white font-semibold">{form.name}</span>. Your admin account is ready.
                </p>
              </div>
              <button onClick={() => navigate("/admin/dashboard", { replace: true })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm transition hover:opacity-90">
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
