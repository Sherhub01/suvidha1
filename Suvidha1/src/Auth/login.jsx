import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Zap, LogIn } from "lucide-react";
import Swal from "sweetalert2";
import API from "../api";

const INPUT = "w-full px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/50 transition text-sm";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ username: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("rememberUser") || "null");
    if (saved) setFormData((f) => ({ ...f, ...saved }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.username.trim()) e.username = "Username or email is required";
    if (!formData.password) e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await API.post("/login", {
        identifier: formData.username,
        password: formData.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (formData.remember) {
        localStorage.setItem("rememberUser", JSON.stringify({ username: formData.username }));
      } else {
        localStorage.removeItem("rememberUser");
      }

      const redirectTo = location.state?.redirectTo;
      Swal.fire({
        title: "Welcome back! 👋",
        text: `Logged in as ${data.user.firstName}`,
        icon: "success",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Continue →",
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        if (!data.user.profileCompleted || redirectTo === "/create-profile") {
          navigate("/create-profile");
        } else {
          navigate("/dashboard");
        }
      });
    } catch (err) {
      Swal.fire({
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid credentials. Please try again.",
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
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-700/10 blur-3xl" />

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
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white">Sign In</h1>
            <p className="text-sm text-white/50">Welcome back! Enter your credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Username or Email</label>
              <input
                name="username"
                type="text"
                placeholder="john_doe or john@email.com"
                value={formData.username}
                onChange={handleChange}
                className={INPUT}
              />
              {errors.username && <p className="mt-1 text-xs text-rose-400">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${INPUT} pr-11`}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" name="remember" checked={formData.remember} onChange={handleChange}
                  className="rounded accent-amber-400" />
                Remember me
              </label>
              <button type="button" onClick={() => navigate("/forgotPass")}
                className="text-sm text-amber-400 hover:text-amber-300 transition">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-sm tracking-wide hover:from-amber-300 hover:to-orange-400 hover:shadow-lg hover:shadow-amber-500/30 transition disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" /> Signing in…</span>
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link to="/withEmail"
            className="block w-full text-center py-3 rounded-xl border border-white/15 text-white/70 text-sm hover:bg-white/8 hover:text-white transition">
            Continue with Email
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

export default Login;
