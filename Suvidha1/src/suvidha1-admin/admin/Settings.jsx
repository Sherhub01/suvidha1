import { useState, useEffect } from "react";
import { Shield, Key, User, FileText, Lock, Monitor, ChevronRight, Loader2, Save, LogOut, Eye, EyeOff, Bell, Globe } from "lucide-react";
import { Card, Btn, SectionHeader, Input, Modal, Textarea } from "./ui";
import api from "./services/api";
import Swal from "sweetalert2";

const swal = {
  background: "linear-gradient(135deg,#0f172a,#1e3a5f)", color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const SECTIONS = [
  { id: "profile",   icon: User,     label: "Admin Profile",        desc: "Update your name and email" },
  { id: "password",  icon: Key,      label: "Change Password",      desc: "Update your admin login password" },
  { id: "security",  icon: Shield,   label: "Security Settings",    desc: "2FA, login alerts, auto-logout" },
  { id: "sessions",  icon: Monitor,  label: "Session Management",   desc: "View and revoke active sessions" },
  { id: "privacy",   icon: FileText, label: "Privacy Policy",       desc: "Edit platform privacy policy text" },
  { id: "terms",     icon: FileText, label: "Terms & Conditions",   desc: "Edit platform terms of service" },
  { id: "notifications", icon: Bell, label: "Notification Settings",desc: "Configure platform-wide notifications" },
];

export default function Settings() {
  const [active, setActive] = useState(null);

  // Profile state
  const [profile, setProfile]     = useState({ name: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [pw, setPw]     = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);

  // Security toggles
  const [security, setSecurity] = useState({ twoFA: false, loginAlerts: true, autoLogout: "30", ipWhitelist: false });
  const [secSaving, setSecSaving] = useState(false);

  // Policy text
  const [policyText, setPolicyText] = useState("");
  const [termsText, setTermsText]   = useState("");
  const [policySaving, setPolicySaving] = useState(false);

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({ emailOnNewStaff: true, emailOnBooking: false, emailOnNewUser: true });
  const [notifSaving, setNotifSaving] = useState(false);

  // Load admin profile on mount
  useEffect(() => {
    api.get("/admin/profile").then(({ data }) => {
      if (data.success) setProfile({ name: data.admin.name || "", email: data.admin.email || "" });
    }).catch(() => {});
  }, []);

  /* ── Save profile ── */
  const saveProfile = async () => {
    if (!profile.name.trim()) return;
    setProfileSaving(true);
    try {
      await api.put("/admin/profile", { name: profile.name, email: profile.email });
      await Swal.fire({ ...swal, icon: "success", title: "Profile Updated", timer: 1500, showConfirmButton: false });
      setActive(null);
    } catch (err) {
      await Swal.fire({ ...swal, icon: "error", title: "Failed", text: err.response?.data?.message || "Could not update profile." });
    } finally { setProfileSaving(false); }
  };

  /* ── Change password ── */
  const changePassword = async () => {
    if (!pw.current || !pw.next || !pw.confirm) {
      return Swal.fire({ ...swal, icon: "warning", title: "All fields required" });
    }
    if (pw.next.length < 8) {
      return Swal.fire({ ...swal, icon: "warning", title: "Password too short", text: "Minimum 8 characters." });
    }
    if (pw.next !== pw.confirm) {
      return Swal.fire({ ...swal, icon: "warning", title: "Passwords don't match" });
    }
    setPwSaving(true);
    try {
      await api.patch("/admin/change-password", { currentPassword: pw.current, newPassword: pw.next });
      await Swal.fire({ ...swal, icon: "success", title: "Password Changed!", text: "Your password has been updated.", timer: 2000, showConfirmButton: false });
      setPw({ current: "", next: "", confirm: "" });
      setActive(null);
    } catch (err) {
      await Swal.fire({ ...swal, icon: "error", title: "Failed", text: err.response?.data?.message || "Incorrect current password." });
    } finally { setPwSaving(false); }
  };

  /* ── Save security settings ── */
  const saveSecurity = async () => {
    setSecSaving(true);
    try {
      // Persist to localStorage as demo (no dedicated backend endpoint)
      localStorage.setItem("admin_security", JSON.stringify(security));
      await Swal.fire({ ...swal, icon: "success", title: "Security Settings Saved", timer: 1500, showConfirmButton: false });
      setActive(null);
    } finally { setSecSaving(false); }
  };

  /* ── Save policy / terms ── */
  const savePolicy = async (type) => {
    setPolicySaving(true);
    try {
      localStorage.setItem(`admin_${type}`, type === "privacy" ? policyText : termsText);
      await Swal.fire({ ...swal, icon: "success", title: "Saved", timer: 1500, showConfirmButton: false });
      setActive(null);
    } finally { setPolicySaving(false); }
  };

  /* ── Save notification settings ── */
  const saveNotifSettings = async () => {
    setNotifSaving(true);
    try {
      localStorage.setItem("admin_notif_settings", JSON.stringify(notifSettings));
      await Swal.fire({ ...swal, icon: "success", title: "Notification Settings Saved", timer: 1500, showConfirmButton: false });
      setActive(null);
    } finally { setNotifSaving(false); }
  };

  /* ── Revoke session ── */
  const revokeSession = async (device) => {
    await Swal.fire({ ...swal, icon: "success", title: `Session revoked`, text: `${device} has been logged out.`, timer: 1500, showConfirmButton: false });
  };

  const revokeAll = async () => {
    const r = await Swal.fire({
      ...swal, icon: "warning", title: "Revoke all sessions?",
      text: "All other devices will be logged out immediately.",
      showCancelButton: true, confirmButtonText: "Revoke All", confirmButtonColor: "#ef4444",
    });
    if (!r.isConfirmed) return;
    await Swal.fire({ ...swal, icon: "success", title: "All sessions revoked", timer: 1500, showConfirmButton: false });
  };

  const SESSIONS = [
    { device: "Chrome · Windows", ip: "103.21.xx.xx", time: "Active now",     current: true  },
    { device: "Chrome · iPhone",  ip: "122.18.xx.xx", time: "2 hours ago",    current: false },
    { device: "Safari · iPad",    ip: "103.55.xx.xx", time: "Yesterday 4 PM", current: false },
  ];

  const PwField = ({ field, label }) => (
    <div className="relative">
      <Input label={label} type={showPw[field] ? "text" : "password"}
        value={pw[field]} onChange={e => setPw(p => ({ ...p, [field]: e.target.value }))} />
      <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
        className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
        {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Platform configuration and admin preferences" />

      <div className="space-y-2">
        {SECTIONS.map(({ id, icon: Icon, label, desc }) => (
          <button key={id} onClick={() => {
            setActive(id);
            if (id === "privacy")       setPolicyText(localStorage.getItem("admin_privacy") || "Enter your privacy policy here…");
            if (id === "terms")         setTermsText(localStorage.getItem("admin_terms") || "Enter your terms of service here…");
            if (id === "security")      setSecurity(JSON.parse(localStorage.getItem("admin_security") || "null") || security);
            if (id === "notifications") setNotifSettings(JSON.parse(localStorage.getItem("admin_notif_settings") || "null") || notifSettings);
          }}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left shadow-sm transition hover:bg-gray-50 hover:shadow">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Icon size={18} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-gray-800">{label}</div>
              <div className="text-[12px] text-gray-400">{desc}</div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* ── Profile Modal ── */}
      <Modal open={active === "profile"} onClose={() => setActive(null)} title="Edit Admin Profile">
        <div className="space-y-3">
          <Input label="Full Name" value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Super Admin" />
          <Input label="Email Address" type="email" value={profile.email}
            onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="admin@suvidha1.com" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="outline" onClick={() => setActive(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={saveProfile} disabled={profileSaving}>
            {profileSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Profile
          </Btn>
        </div>
      </Modal>

      {/* ── Password Modal ── */}
      <Modal open={active === "password"} onClose={() => setActive(null)} title="Change Password">
        <div className="space-y-3">
          <PwField field="current" label="Current Password" />
          <PwField field="next"    label="New Password (min 8 chars)" />
          <PwField field="confirm" label="Confirm New Password" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="outline" onClick={() => setActive(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={changePassword} disabled={pwSaving}>
            {pwSaving ? <Loader2 size={13} className="animate-spin" /> : <Key size={13} />} Update Password
          </Btn>
        </div>
      </Modal>

      {/* ── Security Modal ── */}
      <Modal open={active === "security"} onClose={() => setActive(null)} title="Security Settings" width="max-w-lg">
        <div className="space-y-4">
          {[
            { key: "twoFA",       label: "Two-Factor Authentication", sub: "Require OTP on each login" },
            { key: "loginAlerts", label: "Login Alerts",              sub: "Email notification on new sign-in" },
            { key: "ipWhitelist", label: "IP Whitelist",              sub: "Restrict access to known IPs only" },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <button onClick={() => setSecurity(s => ({ ...s, [key]: !s[key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${security[key] ? "bg-blue-600" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${security[key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Auto-logout</p>
              <p className="text-xs text-gray-400">Inactivity timeout</p>
            </div>
            <select value={security.autoLogout} onChange={e => setSecurity(s => ({ ...s, autoLogout: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400">
              {[["15", "15 min"], ["30", "30 min"], ["60", "1 hour"], ["0", "Never"]].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="outline" onClick={() => setActive(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={saveSecurity} disabled={secSaving}>
            {secSaving ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />} Save Settings
          </Btn>
        </div>
      </Modal>

      {/* ── Sessions Modal ── */}
      <Modal open={active === "sessions"} onClose={() => setActive(null)} title="Active Sessions">
        <div className="space-y-2">
          {SESSIONS.map(s => (
            <div key={s.device} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${s.current ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
              <Monitor size={16} className={s.current ? "text-blue-500" : "text-gray-400"} />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-gray-800">
                  {s.device} {s.current && <span className="text-[10px] text-blue-600 font-normal">(current)</span>}
                </p>
                <p className="text-[11px] text-gray-400">{s.ip} · {s.time}</p>
              </div>
              {!s.current && (
                <Btn variant="danger" size="xs" onClick={() => revokeSession(s.device)}>
                  <LogOut size={11} /> Revoke
                </Btn>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Btn variant="outline" onClick={() => setActive(null)}>Close</Btn>
          <Btn variant="danger" size="sm" onClick={revokeAll}>
            <LogOut size={13} /> Revoke All Other Sessions
          </Btn>
        </div>
      </Modal>

      {/* ── Privacy Policy Modal ── */}
      <Modal open={active === "privacy"} onClose={() => setActive(null)} title="Privacy Policy" width="max-w-xl">
        <Textarea label="Policy Content" rows={10} value={policyText} onChange={e => setPolicyText(e.target.value)} />
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="outline" onClick={() => setActive(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => savePolicy("privacy")} disabled={policySaving}>
            {policySaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Policy
          </Btn>
        </div>
      </Modal>

      {/* ── Terms Modal ── */}
      <Modal open={active === "terms"} onClose={() => setActive(null)} title="Terms & Conditions" width="max-w-xl">
        <Textarea label="Terms Content" rows={10} value={termsText} onChange={e => setTermsText(e.target.value)} />
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="outline" onClick={() => setActive(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => savePolicy("terms")} disabled={policySaving}>
            {policySaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Terms
          </Btn>
        </div>
      </Modal>

      {/* ── Notification Settings Modal ── */}
      <Modal open={active === "notifications"} onClose={() => setActive(null)} title="Notification Settings">
        <div className="space-y-3">
          {[
            { key: "emailOnNewStaff", label: "New Staff Application",  sub: "Email when a staff submits for review" },
            { key: "emailOnBooking",  label: "New Booking",            sub: "Email on every new platform booking" },
            { key: "emailOnNewUser",  label: "New User Registration",  sub: "Email when a consumer signs up" },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <button onClick={() => setNotifSettings(s => ({ ...s, [key]: !s[key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifSettings[key] ? "bg-blue-600" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${notifSettings[key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="outline" onClick={() => setActive(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={saveNotifSettings} disabled={notifSaving}>
            {notifSaving ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />} Save Settings
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
