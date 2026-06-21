import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCog, Lock, Mail, CreditCard, MapPin, Languages, Bell,
  Shield, FileText, HelpCircle, LogOut, ChevronRight, Check,
  Camera, KeyRound, Eye, EyeOff, LocateFixed, Monitor,
  Smartphone, Trash2, AlertTriangle,
} from "lucide-react";
import API from "../api";

const BACKEND = "http://localhost:5000";

/* ── shared consumer-identical primitives ─────────────────────────────────── */
const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none";

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

function SectionHead({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <div>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-slate-800" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function SaveBtn({ saved, label = "Save changes", type = "submit", onClick }) {
  return (
    <button type={type} onClick={onClick}
      className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
      {saved ? <><Check size={14} /> Saved!</> : label}
    </button>
  );
}

/* ── panels ───────────────────────────────────────────────────────────────── */

function EditProfilePanel() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [saved, setSaved]         = useState(false);
  const [avatarPreview, setPreview] = useState(user.avatar ? `${BACKEND}${user.avatar}` : null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "P";

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPreview(URL.createObjectURL(file)); setUploading(true);
    const fd = new FormData(); fd.append("avatar", file);
    try {
      const { data } = await API.post("/create-profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (data.user?.avatar) {
        const s = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({ ...s, avatar: data.user.avatar }));
      }
    } catch {}
    setUploading(false);
  };

  return (
    <Card>
      <SectionHead icon={UserCog} title="Edit Profile" subtitle="Update your personal information" />
      <div className="mb-6 flex items-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-amber-400/30 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            {avatarPreview ? <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" /> : <span className="text-2xl font-bold text-slate-900">{initials}</span>}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 shadow-md border-2 border-white hover:bg-amber-500 transition">
            <Camera size={13} className="text-white" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 text-xs font-medium text-amber-600 hover:underline">
            {uploading ? "Uploading…" : "Change profile picture"}
          </button>
          <p className="text-xs text-slate-400 mt-0.5">JPG or PNG, max 5 MB</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
      </div>

      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        {[
          { label: "First name", key: "firstName", placeholder: "First name" },
          { label: "Last name",  key: "lastName",  placeholder: "Last name" },
          { label: "Username",   key: "userName",  placeholder: "@username" },
          { label: "Phone",      key: "phone",     placeholder: "+91 98765 43210" },
          { label: "Email",      key: "email",     placeholder: "you@email.com", type: "email" },
          { label: "Aadhaar",    key: "aadhaar",   placeholder: "XXXX XXXX XXXX" },
        ].map(({ label, key, placeholder, type = "text" }) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
            <input className={inp} type={type} defaultValue={user[key] || ""} placeholder={placeholder} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Bio</label>
          <textarea className={inp} rows={2} defaultValue={user.bio || ""} placeholder="Short bio about yourself" />
        </div>
        <div className="sm:col-span-2"><SaveBtn saved={saved} /></div>
      </form>
    </Card>
  );
}

function PasswordPanel() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow]   = useState({ cur: false, nw: false, cn: false });
  const eye = (k) => () => setShow(s => ({ ...s, [k]: !s[k] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (!d.current || !d.newPass || !d.confirm) { setError("All fields are required."); return; }
    if (d.newPass !== d.confirm) { setError("New passwords do not match."); return; }
    if (d.newPass.length < 8)    { setError("Password must be at least 8 characters."); return; }
    setError(""); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <SectionHead icon={Lock} title="Change Password" subtitle="Use a strong password with 8+ characters" />
      <form className="space-y-4" onSubmit={handleSubmit}>
        {[
          { label: "Current password",    name: "current", k: "cur" },
          { label: "New password",         name: "newPass", k: "nw"  },
          { label: "Confirm new password", name: "confirm", k: "cn"  },
        ].map(({ label, name, k }) => (
          <div key={name}>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
            <div className="relative">
              <input className={inp} type={show[k] ? "text" : "password"} name={name} placeholder="••••••••" />
              <button type="button" onClick={eye(k)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {show[k] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SaveBtn saved={saved} label="Update password" />
          <button type="button" onClick={() => navigate("/forgotPass")}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline">
            <KeyRound size={13} /> Forgot password?
          </button>
        </div>
      </form>
    </Card>
  );
}

function ChangeEmailPanel() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [step, setStep]   = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp]     = useState("");
  const [done, setDone]   = useState(false);
  const [error, setError] = useState("");

  if (done) return (
    <Card>
      <SectionHead icon={Mail} title="Change Email" subtitle="OTP verification required" />
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <Check size={24} className="text-emerald-600" />
        </div>
        <p className="text-base font-bold text-slate-800">Email updated!</p>
        <p className="text-sm text-slate-500">Your account email is now <span className="font-semibold text-indigo-600">{email}</span></p>
      </div>
    </Card>
  );

  return (
    <Card>
      <SectionHead icon={Mail} title="Change Email" subtitle="OTP verification required" />
      {step === 1 ? (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!email.includes("@")) { setError("Enter a valid email."); return; } setError(""); setStep(2); }}>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
            Current email: <span className="font-semibold">{user.email || "—"}</span>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">New email address</label>
            <input className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="new@email.com" />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">Send OTP</button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (otp.length < 4) { setError("Enter the OTP sent to your email."); return; } setError(""); setDone(true); }}>
          <p className="text-sm text-slate-500">OTP sent to <span className="font-semibold text-indigo-600">{email}</span></p>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Enter OTP</label>
            <input className={inp} value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6} />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Back</button>
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">Verify & Update</button>
          </div>
        </form>
      )}
    </Card>
  );
}

function PaymentMethodPanel() {
  const [method, setMethod] = useState("upi");
  const [saved, setSaved]   = useState(false);
  return (
    <Card>
      <SectionHead icon={CreditCard} title="Update Payment Method" subtitle="Admin approval required for changes" />
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        Changes to payment method require admin review (1–2 business days).
      </div>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        <div className="flex gap-3">
          {[["upi", "UPI / GPay"], ["bank", "Bank Transfer"]].map(([val, lbl]) => (
            <button key={val} type="button" onClick={() => setMethod(val)}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${method === val ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
              {lbl}
            </button>
          ))}
        </div>
        {method === "upi" ? (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">UPI ID</label>
            <input className={inp} placeholder="yourname@upi" />
          </div>
        ) : (
          <>
            {[["Account Number", "Account number"], ["IFSC Code", "e.g. SBIN0001234"], ["Account Holder Name", "As per bank records"]].map(([lbl, ph]) => (
              <div key={lbl}>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">{lbl}</label>
                <input className={inp} placeholder={ph} />
              </div>
            ))}
          </>
        )}
        <SaveBtn saved={saved} label="Submit for Review" />
      </form>
    </Card>
  );
}

function ServiceAreasPanel() {
  const AREAS = ["Andheri West", "Bandra", "Juhu", "Malad West", "Borivali", "Kandivali"];
  const [selected, setSelected] = useState(["Andheri West", "Bandra"]);
  const [saved, setSaved] = useState(false);
  const toggle = (a) => setSelected(s => s.includes(a) ? s.filter(x => x !== a) : [...s, a]);
  return (
    <Card>
      <SectionHead icon={MapPin} title="Manage Service Areas" subtitle="Select areas where you offer services" />
      <div className="flex flex-wrap gap-2 mb-5">
        {AREAS.map(a => (
          <button key={a} type="button" onClick={() => toggle(a)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${selected.includes(a) ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
            {a}
          </button>
        ))}
      </div>
      <SaveBtn saved={saved} type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} label="Save areas" />
    </Card>
  );
}

function LanguagePanel() {
  const LANGS = [["en", "English"], ["hi", "हिन्दी"], ["mr", "मराठी"], ["ta", "தமிழ்"]];
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const [saved, setSaved] = useState(false);
  return (
    <Card>
      <SectionHead icon={Languages} title="Language" subtitle="App display language" />
      <div className="flex flex-col gap-2 mb-5">
        {LANGS.map(([val, lbl]) => (
          <button key={val} type="button" onClick={() => setLang(val)}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${lang === val ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
            {lbl}
            {lang === val && <Check size={14} />}
          </button>
        ))}
      </div>
      <SaveBtn saved={saved} type="button" onClick={() => { localStorage.setItem("lang", lang); setSaved(true); setTimeout(() => setSaved(false), 2000); }} label="Save language" />
    </Card>
  );
}

function NotificationsPanel() {
  const [prefs, setPrefs] = useState({ newBooking: true, payment: true, reminder: true, promos: false, sms: false, push: true });
  const [saved, setSaved] = useState(false);
  const toggle = k => setPrefs(p => ({ ...p, [k]: !p[k] }));
  return (
    <div className="space-y-4">
      <Card>
        <SectionHead icon={Bell} title="Notification Preferences" subtitle="Choose how Suvidha1 keeps you updated" />
        <div className="divide-y divide-slate-100">
          {[
            { k: "newBooking", label: "New booking requests", desc: "Alert when a customer books you" },
            { k: "payment",    label: "Payment received",     desc: "Credit & payout notifications" },
            { k: "reminder",   label: "Job reminders",        desc: "1 hour before each booking" },
            { k: "sms",        label: "SMS notifications",    desc: "OTP and urgent alerts" },
            { k: "push",       label: "Push notifications",   desc: "Real-time updates on your device" },
            { k: "promos",     label: "Promotions & offers",  desc: "Tips and special offers" },
          ].map(({ k, label, desc }) => (
            <div key={k} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <Toggle checked={prefs[k]} onChange={() => toggle(k)} label={label} />
            </div>
          ))}
        </div>
      </Card>
      <SaveBtn saved={saved} type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} label="Save preferences" />
    </div>
  );
}

function PrivacyPanel({ onLogout }) {
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOutAll = async () => {
    setSigningOut(true);
    try { await API.post("/logout-all"); } catch {}
    localStorage.clear(); sessionStorage.clear();
    navigate("/", { replace: true });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await API.delete("/delete-account"); } catch {}
    localStorage.clear(); sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionHead icon={Shield} title="Privacy" subtitle="Your data and legal information" />
        {[["Privacy policy", "/privacy"], ["Terms & conditions", "/terms"], ["Cookie policy", "#"], ["Data export request", "#"]].map(([lbl, to]) => (
          <button key={lbl} onClick={() => to !== "#" && navigate(to)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition text-left">
            {lbl}<ChevronRight size={15} className="text-slate-400" />
          </button>
        ))}
      </Card>
      <Card>
        <SectionHead icon={Smartphone} title="Account" subtitle="Manage sessions and account" />
        <div className="space-y-2">
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            <LogOut size={16} className="text-slate-400" /> Sign out of this device
          </button>
          <button onClick={handleSignOutAll} disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-60">
            <Smartphone size={16} className="text-slate-400" />
            {signingOut ? "Signing out…" : "Sign out of all devices"}
          </button>
          <button onClick={() => setShowDelete(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-100 transition">
            <Trash2 size={16} /> Delete account permanently
          </button>
        </div>
      </Card>
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><AlertTriangle size={20} /></span>
              <h3 className="text-base font-bold text-slate-800">Delete account?</h3>
            </div>
            <p className="text-sm text-slate-500">This will permanently delete your profile, bookings and all data. This cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition disabled:opacity-60">
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TABS config ──────────────────────────────────────────────────────────── */
const TABS = [
  { id: "profile",   label: "Edit Profile",          icon: UserCog    },
  { id: "password",  label: "Change Password",        icon: Lock       },
  { id: "email",     label: "Change Email",           icon: Mail       },
  { id: "payment",   label: "Payment Method",         icon: CreditCard },
  { id: "areas",     label: "Service Areas",          icon: MapPin     },
  { id: "language",  label: "Language",               icon: Languages  },
  { id: "notifs",    label: "Notifications",          icon: Bell       },
  { id: "privacy",   label: "Privacy & Account",      icon: Shield     },
];

/* ── Main export ──────────────────────────────────────────────────────────── */
export default function Settings() {
  const navigate = useNavigate();
  const [active, setActive] = useState("profile");

  const handleLogout = () => {
    ["token", "user", "userRole"].forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem("selectedRole");
    navigate("/", { replace: true });
  };

  const renderPanel = () => {
    switch (active) {
      case "profile":  return <EditProfilePanel />;
      case "password": return <PasswordPanel />;
      case "email":    return <ChangeEmailPanel />;
      case "payment":  return <PaymentMethodPanel />;
      case "areas":    return <ServiceAreasPanel />;
      case "language": return <LanguagePanel />;
      case "notifs":   return <NotificationsPanel />;
      case "privacy":  return <PrivacyPanel onLogout={handleLogout} />;
      default:         return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActive(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left mb-0.5 ${
                  active === id ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}>
                <Icon size={16} className={active === id ? "text-amber-400" : "text-slate-400"} />
                <span className="flex-1">{label}</span>
                {active !== id && <ChevronRight size={13} className="text-slate-300" />}
              </button>
            ))}
            <div className="my-2 border-t border-slate-100" />
            <button onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>

        {/* Panel */}
        <div className="lg:col-span-3">{renderPanel()}</div>
      </div>
    </div>
  );
}
