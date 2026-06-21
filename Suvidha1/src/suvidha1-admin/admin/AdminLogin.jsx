import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, LogIn, KeyRound } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api/admin" });

const swalBase = {
  background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "sswag177@gmail.com", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(er => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)        e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await API.post("/login", { email: form.email, password: form.password });
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));
      await Swal.fire({
        ...swalBase, icon: "success",
        title: `Welcome, ${data.admin.name}! 🛡️`,
        text: "Redirecting to Admin Portal…",
        timer: 1500, timerProgressBar: true, showConfirmButton: false,
      });
      // Admin login successful — navigate to dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message;
      await Swal.fire({
        ...swalBase, icon: "error",
        title: msg ? "Login Failed" : "Something went wrong",
        text: msg || "Please try again later.",
        confirmButtonColor: "#ef4444", confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full rounded-xl border px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-blue-400/50";

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
            <h2 className="text-xl font-bold text-white">Sign in to Admin</h2>
            <p className="text-sm text-white/40 mt-1">Manage your platform from one place</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                placeholder="admin@suvidha1.com"
                style={{ background: "rgba(255,255,255,0.07)" }}
                className={`${inputBase} ${errors.email ? "border-red-400/60" : "border-white/15 focus:border-blue-400/60"}`} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/50">Password</label>
                <button type="button"
                  onClick={() => navigate("/admin/forgot-password", { state: { email: form.email } })}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">
                  <KeyRound size={12} /> Forgot password?
                </button>
              </div>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"} value={form.password}
                  onChange={handle} placeholder="Enter your password"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                  className={`${inputBase} pr-11 ${errors.password ? "border-red-400/60" : "border-white/15 focus:border-blue-400/60"}`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm tracking-wide hover:from-blue-400 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition disabled:opacity-60">
              {loading
                ? <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Don't have an account?{" "}
            <Link to="/admin/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition">
              Create account
            </Link>
          </p>

          <p className="text-center text-xs text-white/20">Suvidha1 Admin Portal · Secure Access</p>
        </div>
      </div>
    </div>
  );
}
