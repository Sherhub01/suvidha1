import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Upload, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import staffAPI from "./staffAPI";
import { T, card } from "./theme";

// ── 5 steps: removed Emergency & Skills/Certs; merged Personal+Address and Profession+ServiceArea ──
const STEPS = [
  { id: 1, label: "Personal & Address" },
  { id: 2, label: "Identity Docs" },
  { id: 3, label: "Profession & Area" },
  { id: 4, label: "Bank Details" },
  { id: 5, label: "Review & Submit" },
];

const swal = {
  background: T.pageBg, color: T.heading,
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const inputStyle = {
  background: T.inputBg, border: `1px solid ${T.cardBorder}`,
  borderRadius: 12, color: T.heading, outline: "none",
  padding: "10px 14px", fontSize: 13, width: "100%",
};

const selectStyle = {
  background: "#0D1526", border: `1px solid ${T.cardBorder}`,
  borderRadius: 12, color: T.heading, outline: "none",
  padding: "10px 14px", fontSize: 13, width: "100%",
};

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: T.muted }}>{label}</label>
      {children}
      {error && <p className="text-[10px] mt-0.5" style={{ color: T.danger }}>{error}</p>}
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <Field label={label} error={error}>
      <input {...props} style={inputStyle}
        onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.boxShadow = `0 0 0 2px ${T.primary}30`; }}
        onBlur={e => { e.target.style.borderColor = T.cardBorder; e.target.style.boxShadow = "none"; }} />
    </Field>
  );
}

function Sel({ label, children, ...props }) {
  return (
    <Field label={label}>
      <select {...props} style={selectStyle}>{children}</select>
    </Field>
  );
}

function UploadZone({ label, hint, name, file, onChange }) {
  const ref = useRef();
  return (
    <div onClick={() => ref.current.click()} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition"
      style={{ borderColor: file ? T.success : T.cardBorder, background: file ? `${T.success}08` : "rgba(255,255,255,0.03)" }}>
      <input ref={ref} type="file" name={name} className="hidden" accept=".jpg,.jpeg,.png,.pdf"
        onChange={e => onChange(name, e.target.files[0])} />
      {file ? <Check size={22} style={{ color: T.success }} /> : <Upload size={22} style={{ color: T.muted }} />}
      <div className="text-sm font-semibold" style={{ color: T.heading }}>{label}</div>
      <div className="text-xs" style={{ color: T.subText }}>{file ? file.name : hint}</div>
      {!file && (
        <span className="mt-1 rounded-xl px-4 py-1.5 text-[11px] font-semibold" style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.text }}>
          Choose File
        </span>
      )}
    </div>
  );
}

const AREAS = ["Andheri", "Bandra", "Juhu", "Malad", "Borivali", "Goregaon", "Dadar", "Thane"];

const INITIAL = {
  fullName: "", dob: "", gender: "Male", bio: "",
  phone: "", street: "", city: "", state: "", pinCode: "", landmark: "",
  aadhaarNo: "", panNo: "",
  category: "HVAC Technician", subCategory: "", experience: "",
  serviceCity: "", serviceRadius: "", preferredAreas: [],
  accountHolder: "", accountNumber: "", ifscCode: "", bankName: "", payoutMethod: "Bank Transfer", upiId: "",
};

export default function Verification() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [files, setFiles] = useState({ aadhaarDoc: null, panDoc: null });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const pct = Math.round((step / 5) * 100);

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(er => ({ ...er, [name]: "" }));
  };

  const toggleArea = area => setForm(f => ({
    ...f,
    preferredAreas: f.preferredAreas.includes(area)
      ? f.preferredAreas.filter(a => a !== area)
      : [...f.preferredAreas, area],
  }));

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "Full name required";
      if (!form.dob)             e.dob = "Date of birth required";
      if (!form.phone.trim())    e.phone = "Phone required";
      if (!form.street.trim())   e.street = "Street address required";
      if (!form.city.trim())     e.city = "City required";
      if (!form.state.trim())    e.state = "State required";
      if (!form.pinCode.trim())  e.pinCode = "PIN code required";
    }
    if (step === 2) {
      if (!form.aadhaarNo.trim()) e.aadhaarNo = "Aadhaar number required";
      if (!form.panNo.trim())     e.panNo = "PAN number required";
    }
    if (step === 3) {
      if (!form.experience) e.experience = "Experience required";
    }
    if (step === 4) {
      if (!form.accountHolder.trim()) e.accountHolder = "Account holder name required";
      if (!form.accountNumber.trim()) e.accountNumber = "Account number required";
      if (!form.ifscCode.trim())      e.ifscCode = "IFSC code required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveCurrentStep = async () => {
    if (!validateStep()) return false;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("step", step);
      const data = {};

      if (step === 1) Object.assign(data, {
        fullName: form.fullName, dob: form.dob, gender: form.gender, bio: form.bio,
        phone: form.phone, street: form.street, city: form.city,
        state: form.state, pinCode: form.pinCode, landmark: form.landmark,
      });
      if (step === 2) Object.assign(data, { aadhaarNo: form.aadhaarNo, panNo: form.panNo });
      if (step === 3) Object.assign(data, {
        category: form.category, subCategory: form.subCategory,
        experience: Number(form.experience),
        serviceCity: form.serviceCity, serviceRadius: Number(form.serviceRadius),
        preferredAreas: form.preferredAreas,
      });
      if (step === 4) Object.assign(data, {
        accountHolder: form.accountHolder, accountNumber: form.accountNumber,
        ifscCode: form.ifscCode, bankName: form.bankName,
        payoutMethod: form.payoutMethod, upiId: form.upiId,
      });

      fd.append("data", JSON.stringify(data));
      if (step === 2) {
        if (files.aadhaarDoc) fd.append("aadhaarDoc", files.aadhaarDoc);
        if (files.panDoc)     fd.append("panDoc",     files.panDoc);
      }

      await staffAPI.post("/step", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setCompletedSteps(cs => cs.includes(step) ? cs : [...cs, step]);
      return true;
    } catch (err) {
      await Swal.fire({ ...swal, icon: "error", title: "Save Failed", text: err.response?.data?.message || "Could not save step. Please try again." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < 5) {
      const ok = await saveCurrentStep();
      if (ok) setStep(s => s + 1);
    }
  };

  const handleBack = () => { setErrors({}); setStep(s => Math.max(1, s - 1)); };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await staffAPI.post("/submit");
      await Swal.fire({
        ...swal, icon: "success", title: "Application Submitted! 🎉",
        html: `<p style='color:${T.subText};font-size:14px'>Your profile is under review.<br/>You'll be notified once approved by the admin.</p>`,
        confirmButtonColor: T.primary, confirmButtonText: "Go to Status Page",
      });
      navigate("/staff/pending", { replace: true });
    } catch (err) {
      await Swal.fire({ ...swal, icon: "error", title: "Submit Failed", text: err.response?.data?.message || "Could not submit. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const isCompleted = id => completedSteps.includes(id);

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Progress Bar ── */}
      <div className="rounded-2xl p-4 mb-4" style={card}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: T.subText }}>
            Step {step} of 5 — <span className="font-semibold" style={{ color: T.heading }}>{STEPS[step - 1].label}</span>
          </span>
          <span className="text-xs font-bold" style={{ color: T.primary }}>{pct}% complete</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: `linear-gradient(to right, ${T.primary}, ${T.secondary})` }} />
        </div>
        <div className="flex gap-2">
          {STEPS.map(s => (
            <button key={s.id}
              onClick={() => isCompleted(s.id) && setStep(s.id)}
              className="flex h-8 flex-1 items-center justify-center rounded-lg text-[10px] font-bold transition"
              style={{
                background: isCompleted(s.id) ? `${T.success}cc` : s.id === step ? T.primary : "rgba(255,255,255,0.07)",
                color: isCompleted(s.id) || s.id === step ? "#fff" : T.muted,
                cursor: isCompleted(s.id) ? "pointer" : "default",
              }}>
              {isCompleted(s.id) ? <Check size={11} /> : s.id}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="rounded-2xl p-6" style={card}>
        <h2 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: T.heading }}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: `${T.primary}25`, color: T.primary }}>{step}</span>
          {STEPS[step - 1].label}
        </h2>

        {/* Step 1 — Personal Info + Address */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input label="Full Name" name="fullName" value={form.fullName} onChange={handle} placeholder="Rahul Sharma" error={errors.fullName} /></div>
            <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handle} error={errors.dob} />
            <Sel label="Gender" name="gender" value={form.gender} onChange={handle}>
              <option>Male</option><option>Female</option><option>Other</option>
            </Sel>
            <Input label="Phone" name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" error={errors.phone} />
            <Input label="PIN Code" name="pinCode" value={form.pinCode} onChange={handle} placeholder="400001" error={errors.pinCode} />
            <div className="col-span-2"><Input label="Street Address" name="street" value={form.street} onChange={handle} placeholder="Flat 4B, Sunrise Apartments" error={errors.street} /></div>
            <Input label="City" name="city" value={form.city} onChange={handle} placeholder="Mumbai" error={errors.city} />
            <Input label="State" name="state" value={form.state} onChange={handle} placeholder="Maharashtra" error={errors.state} />
            <div className="col-span-2">
              <Field label="Bio (optional)">
                <textarea name="bio" value={form.bio} onChange={handle} rows={2}
                  placeholder="Tell customers about yourself…"
                  style={{ ...inputStyle, resize: "none" }} />
              </Field>
            </div>
          </div>
        )}

        {/* Step 2 — Identity Docs */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Aadhaar Number" name="aadhaarNo" value={form.aadhaarNo} onChange={handle} placeholder="XXXX XXXX XXXX" error={errors.aadhaarNo} />
              <Input label="PAN Number" name="panNo" value={form.panNo} onChange={handle} placeholder="ABCDE1234F" error={errors.panNo} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <UploadZone label="Aadhaar Card" hint="Front & back · JPG or PDF · Max 5MB" name="aadhaarDoc" file={files.aadhaarDoc} onChange={(n, f) => setFiles(p => ({ ...p, [n]: f }))} />
              <UploadZone label="PAN Card"     hint="Front side · JPG or PDF · Max 5MB"   name="panDoc"     file={files.panDoc}     onChange={(n, f) => setFiles(p => ({ ...p, [n]: f }))} />
            </div>
          </div>
        )}

        {/* Step 3 — Profession + Service Area */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Sel label="Primary Category" name="category" value={form.category} onChange={handle}>
                  {["HVAC Technician","Electrician","Plumber","Cleaning","Carpenter","Painter","Welder","Mason","Mechanic","Pest Control"].map(c => <option key={c}>{c}</option>)}
                </Sel>
              </div>
              <Input label="Sub-category" name="subCategory" value={form.subCategory} onChange={handle} placeholder="e.g. AC Installation" />
              <Input label="Years of Experience" name="experience" type="number" min="0" value={form.experience} onChange={handle} placeholder="7" error={errors.experience} />
              <Input label="Primary Service City" name="serviceCity" value={form.serviceCity} onChange={handle} placeholder="Mumbai" />
              <Input label="Service Radius (km)" name="serviceRadius" type="number" min="1" value={form.serviceRadius} onChange={handle} placeholder="15" />
            </div>
            <Field label="Preferred Areas (click to select)">
              <div className="flex flex-wrap gap-2 mt-1">
                {AREAS.map(a => (
                  <button key={a} type="button" onClick={() => toggleArea(a)}
                    className="rounded-xl border px-3 py-1 text-xs font-medium transition"
                    style={{
                      borderColor: form.preferredAreas.includes(a) ? T.primary : T.cardBorder,
                      background:  form.preferredAreas.includes(a) ? `${T.primary}20` : "rgba(255,255,255,0.05)",
                      color:       form.preferredAreas.includes(a) ? T.primary : T.subText,
                    }}>
                    {a}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* Step 4 — Bank Details */}
        {step === 4 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input label="Account Holder Name" name="accountHolder" value={form.accountHolder} onChange={handle} placeholder="Rahul Sharma" error={errors.accountHolder} /></div>
            <div className="col-span-2"><Input label="Bank Account Number" name="accountNumber" value={form.accountNumber} onChange={handle} placeholder="XXXX XXXX XXXX 4321" error={errors.accountNumber} /></div>
            <Input label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handle} placeholder="SBIN0001234" error={errors.ifscCode} />
            <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handle} placeholder="State Bank of India" />
            <div className="col-span-2">
              <Sel label="Payout Method" name="payoutMethod" value={form.payoutMethod} onChange={handle}>
                <option>Bank Transfer</option><option>UPI</option>
              </Sel>
            </div>
            {form.payoutMethod === "UPI" && (
              <div className="col-span-2"><Input label="UPI ID" name="upiId" value={form.upiId} onChange={handle} placeholder="rahul@upi" /></div>
            )}
          </div>
        )}

        {/* Step 5 — Review & Submit */}
        {step === 5 && (
          <div className="space-y-2">
            {[
              ["Full Name",     form.fullName || "—"],
              ["Date of Birth", form.dob || "—"],
              ["Phone",         form.phone || "—"],
              ["Address",       [form.street, form.city, form.state, form.pinCode].filter(Boolean).join(", ") || "—"],
              ["Aadhaar",       form.aadhaarNo ? `****${form.aadhaarNo.slice(-4)}` : "—"],
              ["Category",      form.category],
              ["Experience",    form.experience ? `${form.experience} years` : "—"],
              ["Service City",  form.serviceCity || "—"],
              ["Bank",          form.bankName ? `${form.bankName} ****${form.accountNumber.slice(-4)}` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                <span className="text-sm" style={{ color: T.subText }}>{k}</span>
                <span className="text-sm font-semibold text-right max-w-[60%] truncate" style={{ color: T.heading }}>{v}</span>
              </div>
            ))}
            <div className="mt-4 rounded-xl p-3.5 text-xs leading-relaxed"
              style={{ background: `${T.warning}12`, border: `1px solid ${T.warning}30`, color: T.warning }}>
              ⚠️ By submitting you confirm all information and documents are accurate. Your application will be reviewed by admin before dashboard access is granted.
            </div>
          </div>
        )}

        {/* ── Nav Buttons ── */}
        <div className="flex justify-between mt-6 pt-4" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
          <button onClick={handleBack} disabled={step === 1 || saving}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition hover:opacity-80 disabled:opacity-30"
            style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.text }}>
            <ChevronLeft size={14} /> Back
          </button>

          {step < 5 ? (
            <button onClick={handleNext} disabled={saving}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold transition hover:opacity-90 disabled:opacity-60"
              style={{ background: `linear-gradient(to right, ${T.primary}, ${T.secondary})`, color: "#fff" }}>
              {saving
                ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                : <>Save & Next <ChevronRight size={14} /></>}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-xs font-bold transition hover:opacity-90 disabled:opacity-60"
              style={{ background: `linear-gradient(to right, ${T.success}, #16a34a)`, color: "#fff" }}>
              {saving
                ? <><Loader2 size={13} className="animate-spin" /> Submitting…</>
                : <><Check size={14} /> Submit for Review</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
