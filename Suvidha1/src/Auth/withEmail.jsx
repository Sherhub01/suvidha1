import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Zap, Mail } from "lucide-react";
import Swal from "sweetalert2";
import API from "../api";

const INPUT = "w-full px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/50 transition text-sm";

const LoginEmail = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password)     e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const role = sessionStorage.getItem("selectedRole") || "consumer";
      const { data } = await API.post("/login", { identifier: form.email, password: form.password, role });
      const resolvedRole = data.user?.role || role;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", resolvedRole);
      sessionStorage.removeItem("selectedRole");

      const dest = resolvedRole === "staff"
        ? (!data.user.profileCompleted ? "/staff/create-profile" : "/staff/dashboard")
        : (!data.user.profileCompleted ? "/create-profile" : "/dashboard");

      Swal.fire({
        title: "Welcome back! 👋",
        text: `Logged in as ${data.user.firstName}`,
        icon: "success",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#f59e0b",
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        navigate(dest, { replace: true });
      });
    } catch (err) {
      Swal.fire({
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid email or password.",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 overflow-hidden">
      <div className="pointer-events-none absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-amber-500/15 blur-3xl" />

      {/* Brand */}
      <div className="mb-8 flex items-center gap-3 z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
          <Zap size={22} strokeWidth={2.5} className="text-slate-900" />
        </div>
        <span className="text-3xl font-extrabold text-white tracking-tight">
          Suvidha<span className="text-amber-400">1</span>
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-3">
              <Mail size={24} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Sign In with Email</h1>
            <p className="text-sm text-white/50">Enter your registered email and password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="john@example.com" className={INPUT} />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"} value={form.password}
                  onChange={handleChange} placeholder="Enter your password" className={`${INPUT} pr-11`} />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-sm tracking-wide hover:from-amber-300 hover:to-orange-400 hover:shadow-lg hover:shadow-amber-500/30 transition disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />Signing in…</span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link
            to="/login"
            state={{ role: sessionStorage.getItem("selectedRole") || "consumer" }}
            className="block w-full text-center py-3 rounded-xl border border-white/15 text-white/70 text-sm hover:bg-white/8 hover:text-white transition">
            Sign in with Username
          </Link>

          <p className="text-center text-sm text-white/50">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")} className="text-amber-400 font-semibold hover:text-amber-300 transition">
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginEmail;
