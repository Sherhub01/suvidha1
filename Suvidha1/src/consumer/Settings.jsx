import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Lock, MapPin, Bell, ShieldCheck, LogOut, Trash2,
  Smartphone, LocateFixed, ChevronRight, Check, Monitor,
  AlertTriangle, Camera, KeyRound,
} from "lucide-react";
import useGeolocation from "../hooks/useGeolocation";
import API from "../api";

const BACKEND = "http://localhost:5000";

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
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-slate-800" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function ProfilePanel({ user }) {
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ? `${BACKEND}${user.avatar}` : null);
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
      const { data } = await API.post("/create-profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
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
      <div className="mb-6 flex items-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-amber-400/30 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
              : <span className="text-2xl font-bold text-slate-900">{initials}</span>}
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
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        {[
          { label: "First name", key: "firstName", placeholder: "First name" },
          { label: "Last name",  key: "lastName",  placeholder: "Last name" },
          { label: "Username",   key: "userName",  placeholder: "@username" },
          { label: "Email",      key: "email",     placeholder: "you@email.com", type: "email" },
          { label: "Phone",      key: "phone",     placeholder: "+91 98765 43210" },
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
        <div className="sm:col-span-2">
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
            {saved ? <><Check size={14} /> Saved!</> : "Save changes"}
          </button>
        </div>
      </form>
    </Card>
  );
}

// ── Task 1: Forgot password link in Change Password ──────────────────────────
function PasswordPanel() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const { current, newPass, confirm } = Object.fromEntries(new FormData(e.target));
    if (!current || !newPass || !confirm) { setError("All fields are required."); return; }
    if (newPass !== confirm) { setError("New passwords do not match."); return; }
    if (newPass.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <SectionHead icon={Lock} title="Change Password" subtitle="Use a strong password with 8+ characters" />
      <form className="space-y-4" onSubmit={handleSubmit}>
        {[
          { label: "Current password",    name: "current" },
          { label: "New password",         name: "newPass" },
          { label: "Confirm new password", name: "confirm" },
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
            <input className={inp} type="password" name={name} placeholder="••••••••" />
          </div>
        ))}
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
            {saved ? <><Check size={14} /> Updated!</> : "Update password"}
          </button>
          {/* Forgot password link */}
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
          >
            <KeyRound size={13} /> Forgot password?
          </button>
        </div>
      </form>
    </Card>
  );
}

// ── Task 2: Location panel with navigate-to-professionals ────────────────────
function LocationPanel() {
  const { coords, loading, error } = useGeolocation();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [addr, setAddr] = useState({ houseNo: "", street: "", landmark: "", city: "", state: "", pincode: "" });
  const set = (k) => (e) => setAddr((a) => ({ ...a, [k]: e.target.value }));

  const handleUseLocation = () => {
    if (coords) {
      // Navigate to map page with user coords so map centres on them
      navigate("/map", { state: { userLat: coords.latitude, userLng: coords.longitude } });
    }
  };

  return (
    <Card>
      <SectionHead icon={MapPin} title="Address" subtitle="Your saved address for service bookings" />
      <div className="space-y-4">
        {/* GPS status */}
        <div className={`flex items-center gap-3 rounded-xl p-3 text-sm ${error ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>
          <LocateFixed size={16} className="shrink-0" />
          <span className="flex-1">
            {loading ? "Detecting your location…" : error ? `Unavailable: ${error}` : `Detected: ${coords?.latitude.toFixed(4)}, ${coords?.longitude.toFixed(4)}`}
          </span>
        </div>

        {/* Navigate to professionals near current location */}
        <button
          onClick={handleUseLocation}
          disabled={!coords}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-amber-400 hover:bg-amber-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LocateFixed size={15} className="text-amber-600" />
          {coords ? "Find professionals near me" : loading ? "Detecting location…" : "Location unavailable"}
        </button>

        {/* Structured address form */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">House / Flat No.</label>
            <input className={inp} placeholder="e.g. 221B" value={addr.houseNo} onChange={set("houseNo")} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Street / Area</label>
            <input className={inp} placeholder="e.g. MG Road, Sector 12" value={addr.street} onChange={set("street")} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Landmark <span className="text-slate-400">(optional)</span></label>
            <input className={inp} placeholder="e.g. Near City Mall" value={addr.landmark} onChange={set("landmark")} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">City</label>
            <input className={inp} placeholder="e.g. New Delhi" value={addr.city} onChange={set("city")} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">State</label>
            <input className={inp} placeholder="e.g. Delhi" value={addr.state} onChange={set("state")} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Pincode</label>
            <input className={inp} placeholder="e.g. 110001" maxLength={6} value={addr.pincode} onChange={set("pincode")} />
          </div>
        </div>

        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
        >
          {saved ? <><Check size={14} /> Saved!</> : "Save address"}
        </button>
      </div>
    </Card>
  );
}

// ── Task 3: Dark mode actually applies + all buttons work ────────────────────
function NotificationsPanel() {
  const [prefs, setPrefs] = useState({
    email: true, sms: false, push: true,
    bookingUpdates: true, promotions: false, reminders: true,
  });
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "en");
  const [saved, setSaved] = useState(false);
  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  // Apply dark mode to <html> element
  const handleDarkMode = (val) => {
    setDarkMode(val);
    if (val) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "1");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "0");
    }
  };

  const handleSave = () => {
    localStorage.setItem("lang", language);
    localStorage.setItem("notifPrefs", JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionHead icon={Bell} title="Notification Preferences" subtitle="Choose how Suvidha1 keeps you updated" />
        <div className="divide-y divide-slate-100">
          {[
            { key: "email",          label: "Email notifications",   desc: "Booking confirmations & updates" },
            { key: "sms",            label: "SMS notifications",      desc: "OTP and urgent alerts" },
            { key: "push",           label: "Push notifications",     desc: "Real-time updates on your device" },
            { key: "bookingUpdates", label: "Booking status updates", desc: "When professional is on the way" },
            { key: "promotions",     label: "Promotions & offers",    desc: "Discounts and seasonal offers" },
            { key: "reminders",      label: "Appointment reminders",  desc: "Reminder 1 hour before service" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
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
              <p className="text-sm font-medium text-slate-800">Dark mode</p>
              <p className="text-xs text-slate-500">Switch to dark interface</p>
            </div>
            <Toggle checked={darkMode} onChange={handleDarkMode} label="Dark mode" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Language</p>
              <p className="text-xs text-slate-500">App display language</p>
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
        </div>
      </Card>

      <button onClick={handleSave}
        className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
        {saved ? <><Check size={14} /> Saved!</> : "Save preferences"}
      </button>
    </div>
  );
}

// ── Tasks 4: Sign out all devices (API) + delete account from DB ─────────────
function PrivacyPanel({ onDelete, onLogout }) {
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOutAll = async () => {
    setSigningOut(true);
    try {
      await API.post("/logout-all");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    sessionStorage.removeItem("selectedRole");
    navigate("/", { replace: true });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await API.delete("/delete-account");
    } catch {}
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionHead icon={ShieldCheck} title="Privacy" subtitle="Your data and legal information" />
        {[
          { label: "Privacy policy",       to: "/privacy" },
          { label: "Terms & conditions",   to: "/terms" },
          { label: "Cookie policy",        to: "#" },
          { label: "Data export request",  to: "#" },
        ].map(({ label, to }) => (
          <button key={label} onClick={() => to !== "#" && navigate(to)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition text-left">
            {label}<ChevronRight size={15} className="text-slate-400" />
          </button>
        ))}
      </Card>

      <Card>
        <SectionHead icon={Smartphone} title="Account" subtitle="Manage sessions and account" />
        <div className="space-y-2">
          <button onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            <LogOut size={16} className="text-slate-400" /> Sign out of this device
          </button>
          <button
            onClick={handleSignOutAll}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
          >
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
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle size={20} />
              </span>
              <h3 className="text-base font-bold text-slate-800">Delete account?</h3>
            </div>
            <p className="text-sm text-slate-500">
              This will permanently delete your profile, bookings and all data from our servers. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting}
                className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition disabled:opacity-60">
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "profile",       label: "Edit Profile",     icon: User },
  { id: "password",      label: "Change Password",   icon: Lock },
  { id: "location",      label: "Address",           icon: MapPin },
  { id: "notifications", label: "Notifications",     icon: Bell },
  { id: "privacy",       label: "Privacy & Account", icon: ShieldCheck },
];

export default function Settings() {
  const navigate = useNavigate();
  const [active, setActive] = useState("profile");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});

  useEffect(() => {
    API.get("/me").then((r) => setUser(r.data.user)).catch(() => {});
    // Restore dark mode preference on mount
    if (localStorage.getItem("darkMode") === "1") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  const handleDelete = () => { localStorage.clear(); navigate("/"); };

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
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account, preferences and privacy.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
        <div className="lg:col-span-3">{renderPanel()}</div>
      </div>
    </div>
  );
}
