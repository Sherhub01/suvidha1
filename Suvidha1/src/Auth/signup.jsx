import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import API from "../api";

const INPUT = "w-full px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/50 transition text-sm";

const COUNTRY_CODES = [
  { code: "+91", country: "🇮🇳 India" },
  { code: "+1",  country: "🇺🇸 USA" },
  { code: "+44", country: "🇬🇧 UK" },
  { code: "+971",country: "🇦🇪 UAE" },
  { code: "+61", country: "🇦🇺 Australia" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "", terms: false, countryCode: "+91",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "phone") v = value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, [name]: v }));
    setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!form.email.trim())     e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!form.phone)            e.phone = "Phone number is required";
    else if (form.phone.length !== 10) e.phone = "Must be 10 digits";
    if (!form.password)         e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.confirmPassword)  e.confirmPassword = "Please confirm password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.terms)            e.terms = "You must accept the terms";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/signup", {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        phone:     `${form.countryCode} ${form.phone}`,
        password:  form.password,
      });
      navigate("/welcome", { state: { email: form.email, firstName: form.firstName } });
    } catch (err) {
      Swal.fire({
        title: "Signup Failed",
        text: err.response?.data?.message || "An error occurred. Please try again.",
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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 overflow-hidden">
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
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-sm text-white/50">Join Suvidha1 and find trusted professionals.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input name="firstName" value={form.firstName} onChange={handleChange}
                  placeholder="First name" className={INPUT} />
                {errors.firstName && <p className="mt-1 text-xs text-rose-400">{errors.firstName}</p>}
              </div>
              <div>
                <input name="lastName" value={form.lastName} onChange={handleChange}
                  placeholder="Last name" className={INPUT} />
                {errors.lastName && <p className="mt-1 text-xs text-rose-400">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="Email address" className={INPUT} />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <div className="flex gap-2">
                <select name="countryCode" value={form.countryCode} onChange={handleChange}
                  className="px-3 py-3 rounded-xl bg-white/8 border border-white/15 text-white text-sm outline-none focus:ring-2 focus:ring-amber-400/60">
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-800">{c.country} {c.code}</option>
                  ))}
                </select>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="10-digit number" className={INPUT} />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"} value={form.password}
                  onChange={handleChange} placeholder="Create password" className={`${INPUT} pr-11`} />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <div className="relative">
                <input name="confirmPassword" type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                  onChange={handleChange} placeholder="Confirm password" className={`${INPUT} pr-11`} />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input name="terms" type="checkbox" checked={form.terms} onChange={handleChange}
                  className="mt-0.5 rounded accent-amber-400" />
                <span className="text-sm text-white/60">
                  I agree to the{" "}
                  <span className="text-amber-400 hover:text-amber-300 cursor-pointer">Terms & Conditions</span>
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-xs text-rose-400">{errors.terms}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-sm tracking-wide hover:from-amber-300 hover:to-orange-400 hover:shadow-lg hover:shadow-amber-500/30 transition disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" /> Creating account…</span>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/50">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-amber-400 font-semibold hover:text-amber-300 transition">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
