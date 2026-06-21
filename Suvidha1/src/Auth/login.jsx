import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Zap, LogIn, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import API from "../api";

const swalBase = {
  background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const inputCls = "w-full px-4 py-3 rounded-xl border border-white/15 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/50 transition text-sm";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(
    () => location.state?.role || sessionStorage.getItem("selectedRole") || "consumer"
  );
  const [form, setForm]         = useState({ username: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const r = location.state?.role || sessionStorage.getItem("selectedRole");
    if (r) setRole(r);
    const saved = JSON.parse(localStorage.getItem("rememberUser") || "null");
    if (saved?.username) setForm(f => ({ ...f, username: saved.username }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchRole = (r) => {
    setRole(r);
    sessionStorage.setItem("selectedRole", r);
    setErrors({});
  };

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors(er => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username or email is required";
    if (!form.password)        e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const persist = (token, user) => {
    localStorage.setItem("token",    token);
    localStorage.setItem("user",     JSON.stringify(user));
    localStorage.setItem("userRole", role);
    sessionStorage.removeItem("selectedRole");
    if (form.remember) {
      localStorage.setItem("rememberUser", JSON.stringify({ username: form.username }));
    } else {
      localStorage.removeItem("rememberUser");
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const { data } = await API.post("/login", {
        identifier: form.username.trim(),
        password:   form.password,
        role,
      });

      persist(data.token, data.user);

      await Swal.fire({
        ...swalBase,
        icon: "success",
        title: `Welcome back! 👋`,
        text: `Signed in as ${data.user.firstName} · ${role === "staff" ? "Professional" : "Consumer"}`,
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      const dest = role === "staff"
        ? (data.user.profileCompleted ? "/staff/dashboard" : "/staff/welcome")
        : (data.user.profileCompleted ? "/dashboard"       : "/create-profile");
      navigate(dest, { replace: true });

    } catch (err) {
      const msg  = err.response?.data?.message || "";
      const code = err.response?.data?.code    || "";

      if (code === "NOT_REGISTERED" || err.response?.status === 404) {
        const result = await Swal.fire({
          ...swalBase,
          icon: "warning",
          title: "Account Not Found",
          text: `No ${role} account found. Would you like to sign up?`,
          showCancelButton: true,
          confirmButtonText: "Sign Up",
          cancelButtonText: "Try Again",
          confirmButtonColor: "#f59e0b",
          cancelButtonColor: "#6b7280",
        });
        if (result.isConfirmed) navigate("/signup", { state: { role } });
        return;
      }

      if (code === "NOT_VERIFIED") {
        await Swal.fire({
          ...swalBase,
          icon: "info",
          title: "Email Not Verified",
          text: "Please verify your email before logging in.",
          confirmButtonColor: "#f59e0b",
          confirmButtonText: "OK",
        });
        return;
      }

      await Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Sign In Failed",
        text: msg || "Invalid credentials. Please check your details.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStaff = role === "staff";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl" />

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
        <div className="rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl p-8 space-y-6"
          style={{ background: "rgba(255,255,255,0.05)" }}>

          {/* Role Toggle */}
          <div className="flex rounded-2xl bg-white/8 border border-white/10 p-1 gap-1">
            <button
              type="button"
              onClick={() => switchRole("consumer")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                !isStaff
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-md shadow-amber-500/20"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              Consumer
            </button>
            <button
              type="button"
              onClick={() => switchRole("staff")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isStaff
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              Professional
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Sign In</h1>
            <p className="text-sm text-white/50 mt-1">
              {isStaff ? "Sign in to your professional account" : "Welcome back! Enter your credentials."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Username or Email</label>
              <input name="username" type="text" value={form.username} onChange={handle}
                placeholder="john_doe or john@email.com"
                style={{ background: "rgba(255,255,255,0.07)" }}
                className={inputCls} />
              {errors.username && <p className="mt-1 text-xs text-rose-400">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"} value={form.password}
                  onChange={handle} placeholder="Enter your password"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                  className={`${inputCls} pr-11`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" name="remember" checked={form.remember} onChange={handle}
                  className="rounded accent-amber-400" />
                Remember me
              </label>
              <button type="button" onClick={() => navigate("/forgotPass", { state: { role } })}
                className="text-sm text-amber-400 hover:text-amber-300 transition">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm tracking-wide transition disabled:opacity-60 ${
                isStaff
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-400 hover:to-pink-500 hover:shadow-lg hover:shadow-rose-500/30"
                  : "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:from-amber-300 hover:to-orange-400 hover:shadow-lg hover:shadow-amber-500/30"
              }`}>
              {loading
                ? <><span className="h-4 w-4 border-2 border-current/40 border-t-current rounded-full animate-spin" /> Signing in…</>
                : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-white/50">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup", { state: { role } })}
              className="text-amber-400 font-semibold hover:text-amber-300 transition">
              Create account
            </button>
          </p>

          <div className="border-t border-white/8 pt-4 text-center">
            <Link to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-white/25 hover:text-white/55 transition">
              <ShieldCheck size={13} /> Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
