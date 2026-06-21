import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { T, card } from "./theme";

const STEPS = ["Personal & Address", "Profession & Area", "Bank Details", "Review"];

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

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: T.muted }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <Field label={label}>
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

export default function CreateProfile() {
  const [step, setStep] = useState(1);
  const pct = Math.round((step / STEPS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto">

      {/* Progress */}
      <div className="rounded-2xl p-4 mb-4" style={card}>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs" style={{ color: T.subText }}>Step {step} of {STEPS.length} — <span className="font-semibold" style={{ color: T.heading }}>{STEPS[step - 1]}</span></span>
          <span className="text-xs font-bold" style={{ color: T.primary }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: `linear-gradient(to right, ${T.primary}, ${T.secondary})` }} />
        </div>
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition"
                style={{
                  background: i + 1 < step ? `${T.success}cc` : i + 1 === step ? T.primary : "rgba(255,255,255,0.07)",
                  color: i + 1 <= step ? "#fff" : T.muted,
                }}>
                {i + 1 < step ? <Check size={10} /> : i + 1}
              </div>
              <div className="text-[9px]" style={{ color: i + 1 === step ? T.heading : T.muted }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo upload */}
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-4" style={card}>
        <div className="relative">
          <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold ring-2"
            style={{ background: `linear-gradient(135deg,${T.primary},${T.secondary})`, color: "#fff", ringColor: `${T.primary}30` }}>RS</div>
          <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full shadow"
            style={{ background: T.primary, color: "#fff" }}>
            <Camera size={12} />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: T.heading }}>Profile Photo</p>
          <p className="text-xs" style={{ color: T.subText }}>JPG or PNG, max 5MB</p>
          <button className="mt-1.5 rounded-lg px-3 py-1 text-[11px] font-semibold transition hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${T.cardBorder}`, color: T.text }}>
            Upload Photo
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl p-5" style={card}>
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: T.heading }}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: `${T.primary}25`, color: T.primary }}>{step}</span>
          {STEPS[step - 1]}
        </h2>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Full Name" placeholder="Rahul Sharma" /></div>
            <Input label="Date of Birth" type="date" />
            <Sel label="Gender"><option>Male</option><option>Female</option><option>Other</option></Sel>
            <Input label="Phone" placeholder="+91 98765 43210" />
            <Input label="PIN Code" placeholder="400001" />
            <div className="col-span-2"><Input label="Street Address" placeholder="Flat 4B, Sunrise Apartments" /></div>
            <Input label="City" placeholder="Mumbai" />
            <Input label="State" placeholder="Maharashtra" />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Sel label="Primary Category">
                {["HVAC Technician","Electrician","Plumber","Cleaning","Carpenter","Painter","Welder","Mason"].map(c => <option key={c}>{c}</option>)}
              </Sel>
            </div>
            <Input label="Sub-category" placeholder="e.g. AC Installation" />
            <Input label="Experience (years)" type="number" placeholder="7" />
            <Input label="Service City" placeholder="Mumbai" />
            <Input label="Service Radius (km)" type="number" placeholder="15" />
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Account Holder Name" placeholder="Rahul Sharma" /></div>
            <div className="col-span-2"><Input label="Account Number" placeholder="XXXX XXXX XXXX 4321" /></div>
            <Input label="IFSC Code" placeholder="SBIN0001234" />
            <Input label="Bank Name" placeholder="State Bank of India" />
            <div className="col-span-2">
              <Sel label="Payout Method"><option>Bank Transfer</option><option>UPI</option></Sel>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2">
            {[["Name","Rahul Sharma"],["City","Mumbai"],["Category","HVAC Technician"],["Experience","7 years"],["Bank","SBI ****4321"]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                <span className="text-sm" style={{ color: T.subText }}>{k}</span>
                <span className="text-sm font-semibold" style={{ color: T.heading }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-5 pt-4" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
            className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold transition hover:opacity-80 disabled:opacity-30"
            style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.text }}>
            <ChevronLeft size={14} /> Back
          </button>
          <button onClick={() => setStep(s => Math.min(STEPS.length, s + 1))}
            className="flex items-center gap-1 rounded-xl px-5 py-2 text-xs font-semibold transition hover:opacity-90"
            style={{ background: `linear-gradient(to right, ${T.primary}, ${T.secondary})`, color: "#fff" }}>
            {step === STEPS.length ? "Submit" : "Next Step"} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
