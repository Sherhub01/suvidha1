import React, { useState } from "react";
import {
  User, Lock, MapPin, Bell, ShieldCheck,
  LogOut, Trash2, Smartphone, LocateFixed,
  ChevronRight, Check,
} from "lucide-react";
import Toggle from "../components/Toggle";
import useGeolocation from "../hooks/useGeolocation";
import { useNavigate } from "react-router-dom";

const TABS = ["Profile", "Security", "Location", "Notifications", "Privacy & Account"];

const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 focus:outline-none";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
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

export default function Settings() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Profile");
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });
  const [showDelete, setShowDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const { coords, loading, error } = useGeolocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account, preferences and privacy.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              active === t
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Profile ── */}
      {active === "Profile" && (
        <Card>
          <SectionTitle icon={User} title="Edit Profile" subtitle="Update your personal information" />
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSave}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">First name</label>
              <input className={inp} defaultValue={user.firstName} placeholder="First name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Last name</label>
              <input className={inp} defaultValue={user.lastName} placeholder="Last name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Username</label>
              <input className={inp} defaultValue={user.userName} placeholder="@username" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
              <input className={inp} type="email" defaultValue={user.email} placeholder="you@email.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Phone</label>
              <input className={inp} defaultValue={user.phone} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Aadhaar</label>
              <input className={inp} placeholder="XXXX XXXX XXXX" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Address</label>
              <input className={inp} placeholder="Your full address" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
                {saved ? <><Check size={15} /> Saved!</> : "Save changes"}
              </button>
              <button type="button" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-800">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Security ── */}
      {active === "Security" && (
        <Card>
          <SectionTitle icon={Lock} title="Change Password" subtitle="Use a strong password with 8+ characters" />
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Current password</label>
              <input className={inp} type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">New password</label>
              <input className={inp} type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Confirm new password</label>
              <input className={inp} type="password" placeholder="••••••••" />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
              Update password
            </button>
          </form>
        </Card>
      )}

      {/* ── Location ── */}
      {active === "Location" && (
        <Card>
          <SectionTitle icon={MapPin} title="Manage Location" subtitle="Used to show nearby professionals" />
          <div className="space-y-4">
            <div className={`flex items-center gap-3 rounded-xl p-3 text-sm ${
              error ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
            }`}>
              <LocateFixed size={16} className="shrink-0" />
              <span>
                {loading ? "Detecting your location…"
                  : error ? `Location unavailable: ${error}`
                  : `Detected: ${coords?.latitude.toFixed(4)}, ${coords?.longitude.toFixed(4)}`}
              </span>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-amber-400 hover:text-amber-600">
              <LocateFixed size={15} /> Use current location
            </button>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Saved address</label>
              <input className={inp} placeholder="Enter your home address" />
            </div>
            <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
              Save address
            </button>
          </div>
        </Card>
      )}

      {/* ── Notifications ── */}
      {active === "Notifications" && (
        <Card>
          <SectionTitle icon={Bell} title="Notification Preferences" subtitle="Choose how you want to be notified" />
          <div className="divide-y divide-slate-100">
            {[
              { key: "email", label: "Email notifications", desc: "Booking confirmations and updates" },
              { key: "sms",   label: "SMS notifications",   desc: "OTP and urgent alerts" },
              { key: "push",  label: "Push notifications",  desc: "Real-time booking updates" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <Toggle
                  checked={notifications[key]}
                  onChange={(val) => setNotifications((p) => ({ ...p, [key]: val }))}
                  label={label}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Privacy & Account ── */}
      {active === "Privacy & Account" && (
        <div className="space-y-4">
          <Card>
            <SectionTitle icon={ShieldCheck} title="Privacy" subtitle="Your data and legal information" />
            <div className="space-y-1">
              {["Privacy policy", "Terms & conditions", "Cookie policy"].map((item) => (
                <a key={item} href="#"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {item}
                  <ChevronRight size={15} className="text-slate-400" />
                </a>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={Smartphone} title="Account Actions" subtitle="Manage your active sessions" />
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <LogOut size={16} className="text-slate-400" /> Sign out of this device
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                <Smartphone size={16} className="text-slate-400" /> Sign out of all devices
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500 transition hover:bg-rose-100"
              >
                <Trash2 size={16} /> Delete account permanently
              </button>
            </div>

            {showDelete && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-semibold text-rose-600">Are you absolutely sure?</p>
                <p className="mt-1 text-xs text-rose-500">
                  This will permanently delete your profile, bookings and all saved data. This cannot be undone.
                </p>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-600">
                    Yes, delete my account
                  </button>
                  <button
                    onClick={() => setShowDelete(false)}
                    className="rounded-xl border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
