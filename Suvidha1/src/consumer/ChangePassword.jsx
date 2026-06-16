import { useState } from "react";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { THEME, changePassword } from "../api";

const PasswordField = ({ label, value, onChange, error, id }) => {
  const [show, setShow] = useState(false);
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={id === "currentPassword" ? "current-password" : "new-password"}
          className={`${THEME.input} pl-10 pr-10 ${error ? "border-red-400 focus:ring-red-300" : ""}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </label>
  );
};

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = "Current password is required.";
    if (!form.newPassword || form.newPassword.length < 8)
      errs.newPassword = "New password must be at least 8 characters.";
    if (form.newPassword !== form.confirmNewPassword)
      errs.confirmNewPassword = "Passwords don't match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      await changePassword(form);
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setErrors({ global: "Failed to change password. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const getStrength = () => {
    const p = form.newPassword;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const levels = [
      { label: "Weak", color: "bg-red-400 w-1/4" },
      { label: "Fair", color: "bg-amber-400 w-2/4" },
      { label: "Good", color: "bg-indigo-400 w-3/4" },
      { label: "Strong", color: "bg-emerald-500 w-full" },
    ];
    return levels[score - 1] || levels[0];
  };

  const strength = getStrength();

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
      <p className="text-sm text-gray-500">
        Use at least 8 characters with a mix of uppercase letters, numbers and symbols for a strong password.
      </p>

      <PasswordField
        id="currentPassword"
        label="Current password"
        value={form.currentPassword}
        onChange={set("currentPassword")}
        error={errors.currentPassword}
      />

      <div className="flex flex-col gap-1">
        <PasswordField
          id="newPassword"
          label="New password"
          value={form.newPassword}
          onChange={set("newPassword")}
          error={errors.newPassword}
        />
        {strength && (
          <div className="mt-1.5">
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div className={`h-1.5 rounded-full transition-all ${strength.color}`} />
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Strength: <span className="font-semibold">{strength.label}</span></p>
          </div>
        )}
      </div>

      <PasswordField
        id="confirmNewPassword"
        label="Confirm new password"
        value={form.confirmNewPassword}
        onChange={set("confirmNewPassword")}
        error={errors.confirmNewPassword}
      />

      {errors.global && <p className={THEME.errorAlert}>{errors.global}</p>}

      {success && (
        <div className={`${THEME.successAlert} flex items-center gap-2`}>
          <CheckCircle2 size={16} /> Password changed successfully.
        </div>
      )}

      <div>
        <button type="submit" disabled={saving} className={THEME.primaryBtn}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          {saving ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;
