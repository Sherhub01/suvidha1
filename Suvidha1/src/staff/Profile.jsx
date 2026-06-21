import { useState, useEffect, useRef } from "react";
import { Camera, Save, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { T, card, input } from "./theme";
import axios from "axios";

const BACKEND = "http://localhost:5000";

const API = axios.create({ baseURL: `${BACKEND}/api` });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

function Field({ label, value, onChange, type = "text", readOnly = false, multiline = false }) {
  const style = { ...input, opacity: readOnly ? 0.6 : 1 };
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: T.subText }}>{label}</label>
      {multiline
        ? <textarea rows={3} value={value || ""} onChange={onChange} readOnly={readOnly}
            className="px-3.5 py-2.5 text-sm resize-none" style={style} />
        : <input type={type} value={value || ""} onChange={onChange} readOnly={readOnly}
            className="px-3.5 py-2.5 text-sm" style={style} />
      }
    </div>
  );
}

const STATUS_ICON = {
  approved:  { icon: CheckCircle, color: T.success, label: "Approved" },
  pending:   { icon: Clock,       color: T.warning, label: "Pending Review" },
  rejected:  { icon: XCircle,     color: "#ef4444",  label: "Rejected" },
  incomplete:{ icon: Clock,       color: T.muted,    label: "Incomplete" },
};

export default function Profile() {
  const [user,    setUser]    = useState({});
  const [profile, setProfile] = useState({});
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");
  const fileRef = useRef();

  useEffect(() => {
    API.get("/auth/me").then(r => {
      setUser(r.data.user);
      setForm(f => ({
        ...f,
        firstName: r.data.user.firstName || "",
        lastName:  r.data.user.lastName  || "",
        email:     r.data.user.email     || "",
        phone:     r.data.user.phone     || "",
        bio:       r.data.user.bio       || "",
      }));
    }).catch(() => {});

    API.get("/staff/profile").then(r => {
      setProfile(r.data.profile || {});
      const p = r.data.profile || {};
      setForm(f => ({
        ...f,
        fullName:   p.fullName   || "",
        city:       p.serviceCity || p.city || "",
        skills:     (p.skills || []).join(", "),
        experience: p.experience ? String(p.experience) : "",
        category:   p.category   || "",
      }));
    }).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("step", 1);
      fd.append("data", JSON.stringify({
        fullName:   form.fullName,
        bio:        form.bio,
        experience: Number(form.experience) || 0,
        skills:     form.skills.split(",").map(s => s.trim()).filter(Boolean),
      }));
      if (fileRef.current?.files[0]) fd.append("photo", fileRef.current.files[0]);
      await API.post("/staff/step", fd, { headers: { "Content-Type": "multipart/form-data" } });

      // Also update user bio/phone
      const authFd = new FormData();
      if (form.phone) authFd.append("phone", form.phone);
      if (form.bio)   authFd.append("bio",   form.bio);
      await API.post("/auth/create-profile", authFd, { headers: { "Content-Type": "multipart/form-data" } });

      setMsg("Profile updated successfully!");
      // Refresh
      const r = await API.get("/staff/profile");
      setProfile(r.data.profile || {});
    } catch {
      setMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const avatarUrl = profile.photo
    ? `${BACKEND}${profile.photo}`
    : user.avatar
      ? `${BACKEND}${user.avatar}`
      : null;

  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "P";
  const fullDisplayName = profile.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Professional";

  const statusInfo = STATUS_ICON[profile.status] || STATUS_ICON.incomplete;
  const StatusIcon = statusInfo.icon;

  const completedSteps = profile.completedSteps?.length || 0;
  const completionPct  = Math.round((completedSteps / 8) * 100);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: T.heading }}>My Profile</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 shadow-lg disabled:opacity-60"
          style={{ background: T.primary, color: "#fff" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {msg && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: msg.includes("success") ? `${T.success}20` : `#ef444420`,
            color: msg.includes("success") ? T.success : "#ef4444",
            border: `1px solid ${msg.includes("success") ? T.success+"40" : "#ef444440"}` }}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Avatar card */}
        <div className="rounded-2xl p-6 text-center" style={card}>
          <div className="relative mx-auto mb-4 h-20 w-20">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="h-20 w-20 rounded-full object-cover ring-4"
                  style={{ ringColor: `${T.primary}30` }} />
              : <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ring-4"
                  style={{ background: `linear-gradient(135deg,${T.primary},${T.secondary})`, ringColor: `${T.primary}30` }}>
                  {initials}
                </div>
            }
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full shadow-md"
              style={{ background: T.primary, color: "#fff" }}>
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" />
          </div>
          <p className="text-base font-bold" style={{ color: T.heading }}>{fullDisplayName}</p>
          <p className="text-xs mt-0.5" style={{ color: T.subText }}>
            {profile.category || "—"} {profile.serviceCity ? `· ${profile.serviceCity}` : ""}
          </p>

          <div className="mt-4 text-left">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: T.subText }}>
              <span>Profile Completion</span>
              <span className="font-semibold" style={{ color: T.success }}>{completionPct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${completionPct}%`, background: T.success }} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <StatusIcon size={14} style={{ color: statusInfo.color }} />
            <span className="text-xs font-semibold" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
          </div>

          {profile.rejectionReason && (
            <p className="mt-2 text-xs rounded-lg px-3 py-2" style={{ background: "#ef444415", color: "#ef4444" }}>
              Reason: {profile.rejectionReason}
            </p>
          )}
        </div>

        {/* Verification Status */}
        <div className="rounded-2xl p-5" style={card}>
          <h2 className="text-base font-bold mb-4" style={{ color: T.heading }}>Verification Status</h2>
          <div className="flex flex-col gap-3">
            {[
              ["Identity (Aadhaar)", profile.aadhaarNo ? "Submitted" : "Pending",   profile.aadhaarNo ? T.success : T.warning],
              ["PAN Card",           profile.panNo     ? "Submitted" : "Pending",   profile.panNo     ? T.success : T.warning],
              ["Documents",          profile.aadhaarDoc ? "Uploaded" : "Pending",   profile.aadhaarDoc ? T.success : T.warning],
              ["Account Status",     profile.status    || "incomplete",              profile.status === "approved" ? T.success : profile.status === "rejected" ? "#ef4444" : T.warning],
            ].map(([k, v, c]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: T.subText }}>{k}</span>
                <span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold capitalize"
                  style={{ background: `${c}20`, color: c, border: `1px solid ${c}40` }}>{v}</span>
              </div>
            ))}
            {user.email && (
              <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                <span className="text-sm" style={{ color: T.subText }}>Email Verified</span>
                <span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: `${T.success}20`, color: T.success, border: `1px solid ${T.success}40` }}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl p-5" style={card}>
        <h2 className="text-base font-bold mb-4" style={{ color: T.heading }}>Personal Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name"   value={form.fullName}   onChange={set("fullName")} />
          <Field label="Email"       value={form.email}      onChange={set("email")}    readOnly />
          <Field label="Phone"       value={form.phone}      onChange={set("phone")} />
          <Field label="Category"    value={form.category}   onChange={set("category")} readOnly />
          <Field label="Skills (comma separated)" value={form.skills} onChange={set("skills")} />
          <Field label="Experience (years)" value={form.experience} onChange={set("experience")} type="number" />
          <div className="sm:col-span-2">
            <Field label="Bio" value={form.bio} onChange={set("bio")} multiline />
          </div>
        </div>
      </div>

      {/* Documents (view only) */}
      {(profile.aadhaarDoc || profile.panDoc || profile.certDoc) && (
        <div className="rounded-2xl p-5" style={card}>
          <h2 className="text-base font-bold mb-4" style={{ color: T.heading }}>Uploaded Documents</h2>
          <div className="flex flex-wrap gap-3">
            {[
              ["Aadhaar Card", profile.aadhaarDoc],
              ["PAN Card",     profile.panDoc],
              ["Certificate",  profile.certDoc],
            ].filter(([, p]) => p).map(([label, path]) => (
              <a key={label} href={`${BACKEND}${path}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-80"
                style={{ background: `${T.info}20`, color: T.info, border: `1px solid ${T.info}40` }}>
                📄 {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
