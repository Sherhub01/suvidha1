import { useState, useRef } from "react";
import { Camera, Save, Loader2 } from "lucide-react";
import { THEME, MOCK_USER, updateProfile } from "../api";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const STATES = [
  "Delhi", "Haryana", "Uttar Pradesh", "Rajasthan", "Maharashtra",
  "Karnataka", "Tamil Nadu", "West Bengal", "Gujarat", "Telangana",
];

const EditProfile = () => {
  const [form, setForm] = useState({ ...MOCK_USER, ...MOCK_USER.address });
  const [photoPreview, setPhotoPreview] = useState(MOCK_USER.profilePhoto);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, profilePhotoFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = "text", extra = {}) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={form[key] ?? ""}
        onChange={set(key)}
        className={THEME.input}
        {...extra}
      />
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={photoPreview}
            alt="Profile"
            className="h-20 w-20 rounded-2xl object-cover ring-4 ring-indigo-50"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow"
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Profile photo</p>
          <p className="text-xs text-gray-500">JPG or PNG, max 5 MB</p>
        </div>
      </div>

      {/* Personal */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">Personal information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("First name", "firstName", "text", { required: true })}
          {field("Last name", "lastName", "text", { required: true })}
          {field("Username", "username", "text", { autoComplete: "username" })}
          {field("Email address", "email", "email", { autoComplete: "email" })}
          {field("Phone number", "phone", "tel")}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Gender</span>
            <select value={form.gender ?? ""} onChange={set("gender")} className={THEME.input}>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </label>
          {field("Date of birth", "dob", "date")}
          {field("Aadhaar number", "aadhaarNumber", "text", { maxLength: 14, placeholder: "XXXX-XXXX-XXXX" })}
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">Address</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">State</span>
            <select value={form.state ?? ""} onChange={set("state")} className={THEME.input}>
              <option value="">Select state</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          {field("City", "city")}
          {field("PIN code", "pinCode", "text", { maxLength: 6, pattern: "[0-9]*" })}
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Full address</span>
            <textarea
              rows={2}
              value={form.fullAddress ?? ""}
              onChange={set("fullAddress")}
              className={`${THEME.input} resize-none`}
            />
          </label>
        </div>
      </div>

      {error && <p className={THEME.errorAlert}>{error}</p>}
      {saved && <p className={THEME.successAlert}>Profile saved successfully!</p>}

      <div>
        <button
          type="submit"
          disabled={saving}
          className={`${THEME.primaryBtn}`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default EditProfile;
