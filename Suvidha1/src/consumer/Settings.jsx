import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Lock, MapPin, Bell, ShieldCheck, LogOut, Trash2,
  Smartphone, LocateFixed, ChevronRight, Check, Monitor,
  Globe, AlertTriangle, X, Camera,
} from "lucide-react";
import useGeolocation from "../hooks/useGeolocation";
import API from "../api";

const BACKEND = "http://localhost:5000";

/* ── Reusable primitives ── */
const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-navy placeholder:text-slate/60 transition focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 focus:outline-none";

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-card ${className}`}>{children}</div>;
}

function SectionHead({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <div>
        <h2 className="text-base font-semibold text-navy">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate">{subtitle}</p>}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-navy" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

/* ── Tab panels ── */
function ProfilePanel({ user }) {
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatar ? `${BACKEND}${user.avatar}` : null
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "U";

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const { data } = await API.post("/create-profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.user?.avatar) {
        const stored = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({ ...stored, avatar: data.user.avatar }));
      }
    } catch {}
    setUploading(false);
  };

  return (
    <Card>
      <SectionHead icon={User} title="Edit Profile" subtitle="Update your personal information" />

      {/* Avatar upload */}
      <div className="mb-6 flex items-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-amber-400/30 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-900">{initials}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy shadow-md border-2 border-white hover:bg-amber-400 transition"
            title="Change profile picture"
          >
            <Camera size={13} className="text-white" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-navy">{user.firstName} {user.lastName}</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-1 text-xs font-medium text-amber-600 hover:underline"
          >
            {uploading ? "Uploading…" : "Change profile picture"}
          </button>
          <p className="text-xs text-slate/60 mt-0.5">JPG or PNG, max 5 MB</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        {[
          { label: "First name", key: "firstName", placeholder: "First name" },
          { label: "Last name",  key: "lastName",  placeholder: "Last name" },
          { label: "Username",   key: "userName",  placeholder: "@username" },
          { label: "Email",      key: "email",     placeholder: "you@email.com", type: "email" },
          { label: "Phone",      key: "phone",     placeholder: "+91 98765 43210" },
          { label: "Aadhaar",    key: "aadhaar",   placeholder: "XXXX XXXX XXXX" },
        ].map(({ label, key, placeholder, type = "text" }) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-medium text-navy/70">{label}</label>
            <input className={inp} type={type} defaultValue={user[key] || ""} placeholder={placeholder} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-navy/70">Address</label>
          <input className={inp} defaultValue={user.address || ""} placeholder="Your full address" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light transition">
            {saved ? <><Check size={14} /> Saved!</> : "Save changes"}
          </button>
        </div>
      </form>
    </Card>
  );
}

function PasswordPanel() {
  const [saved, setSaved] = useState(false);
  return (
    <Card>
      <SectionHead icon={Lock} title="Change Password" subtitle="Use a strong password with 8+ characters" />
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        {["Current password", "New password", "Confirm new password"].map((label) => (
          <div key={label}>
            <label className="mb-1.5 block text-xs font-medium text-navy/70">{label}</label>
            <input className={inp} type="password" placeholder="••••••••" />
          </div>
        ))}
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light transition">
          {saved ? <><Check size={14} /> Updated!</> : "Update password"}
        </button>
      </form>
    </Card>
  );
}

function LocationPanel() {
  const { coords, loading, error } = useGeolocation();
  const [saved, setSaved] = useState(false);
  return (
    <Card>
      <SectionHead icon={MapPin} title="Manage Location" subtitle="Used to show nearby professionals" />
      <div className="space-y-4">
        <div className={`flex items-center gap-3 rounded-xl p-3 text-sm ${error ? "bg-rose-50 text-rose" : "bg-emerald-50 text-emerald"}`}>
          <LocateFixed size={16} className="shrink-0" />
          <span>{loading ? "Detecting your location…" : error ? `Unavailable: ${error}` : `Detected: ${coords?.latitude.toFixed(4)}, ${coords?.longitude.toFixed(4)}`}</span>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-navy hover:border-gold transition">
          <LocateFixed size={15} /> Use current location
        </button>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-navy/70">Saved address</label>
          <input className={inp} placeholder="Enter your home address" />
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light transition">
          {saved ? <><Check size={14} /> Saved!</> : "Save address"}
        </button>
      </div>
    </Card>
  );
}

function NotificationsPanel() {
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: true, bookingUpdates: true, promotions: false, reminders: true });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);
  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-4">
      <Card>
        <SectionHead icon={Bell} title="Notification Preferences" subtitle="Choose how Suvidha1 keeps you updated" />
        <div className="divide-y divide-slate-100">
          {[
            { key: "email", label: "Email notifications", desc: "Booking confirmations & updates" },
            { key: "sms", label: "SMS notifications", desc: "OTP and urgent alerts" },
            { key: "push", label: "Push notifications", desc: "Real-time updates on your device" },
            { key: "bookingUpdates", label: "Booking status updates", desc: "When professional is on the way" },
            { key: "promotions", label: "Promotions & offers", desc: "Discounts and seasonal offers" },
            { key: "reminders", label: "Appointment reminders", desc: "Reminder 1 hour before service" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-navy">{label}</p>
                <p className="text-xs text-slate">{desc}</p>
              </div>
              <Toggle checked={prefs[key]} onChange={() => toggle(key)} label={label} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead icon={Monitor} title="Appearance & Language" subtitle="Personalise your experience" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy">Dark mode</p>
              <p className="text-xs text-slate">Switch to dark interface</p>
            </div>
            <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy">Language</p>
              <p className="text-xs text-slate">App display language</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
        </div>
      </Card>

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light transition"
      >
        {saved ? <><Check size={14} /> Saved!</> : "Save preferences"}
      </button>
    </div>
  );
}

function PrivacyPanel({ onDelete, onLogout }) {
  const [showDelete, setShowDelete] = useState(false);
  return (
    <div className="space-y-4">
      <Card>
        <SectionHead icon={ShieldCheck} title="Privacy" subtitle="Your data and legal information" />
        {["Privacy policy", "Terms & conditions", "Cookie policy", "Data export request"].map((item) => (
          <a key={item} href="#" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-navy hover:bg-slate-50 transition">
            {item}<ChevronRight size={15} className="text-slate" />
          </a>
        ))}
      </Card>
      <Card>
        <SectionHead icon={Smartphone} title="Account" subtitle="Manage sessions and account" />
        <div className="space-y-2">
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-navy hover:bg-slate-50 transition">
            <LogOut size={16} className="text-slate" /> Sign out of this device
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-navy hover:bg-slate-50 transition">
            <Smartphone size={16} className="text-slate" /> Sign out of all devices
          </button>
          <button onClick={() => setShowDelete(true)} className="flex w-full items-center gap-3 rounded-xl border border-rose/20 bg-rose-light/40 px-4 py-3 text-sm font-medium text-rose hover:bg-rose-light transition">
            <Trash2 size={16} /> Delete account permanently
          </button>
        </div>
      </Card>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose"><AlertTriangle size={20} /></span>
              <h3 className="text-base font-bold text-navy">Delete account?</h3>
            </div>
            <p className="text-sm text-slate">This will permanently delete your profile, bookings and all data. This cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50 transition">Cancel</button>
              <button onClick={onDelete} className="flex-1 rounded-xl bg-rose py-2.5 text-sm font-semibold text-white hover:bg-rose/90 transition">Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Settings ── */
const TABS = [
  { id: "profile",       label: "Edit Profile",       icon: User },
  { id: "password",      label: "Change Password",     icon: Lock },
  { id: "location",      label: "Location",            icon: MapPin },
  { id: "notifications", label: "Notifications",       icon: Bell },
  { id: "privacy",       label: "Privacy & Account",   icon: ShieldCheck },
];

export default function Settings() {
  const navigate  = useNavigate();
  const [active, setActive] = useState("profile");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});

  useEffect(() => {
    API.get("/me").then((r) => setUser(r.data.user)).catch(() => {});
  }, []);
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };
  const handleDelete = () => { localStorage.clear(); navigate("/login"); };

  const renderPanel = () => {
    switch (active) {
      case "profile":       return <ProfilePanel user={user} />;
      case "password":      return <PasswordPanel />;
      case "location":      return <LocationPanel />;
      case "notifications": return <NotificationsPanel />;
      case "privacy":       return <PrivacyPanel onLogout={handleLogout} onDelete={handleDelete} />;
      default:              return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="mt-1 text-sm text-slate">Manage your account, preferences and privacy.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-card">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left mb-0.5 ${
                  active === id ? "bg-navy text-white" : "text-slate hover:bg-slate-50 hover:text-navy"
                }`}
              >
                <Icon size={16} className={active === id ? "text-gold" : "text-slate"} />
                <span className="flex-1">{label}</span>
                {active !== id && <ChevronRight size={13} className="text-slate/40" />}
              </button>
            ))}
            <div className="my-2 border-t border-slate-100" />
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose hover:bg-rose-light/50 transition">
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
