import { Upload } from "lucide-react";

const DOCS = [
  { icon: "🪪", label: "Aadhaar Card",            sub: "XXXX-XXXX-8432",      status: "approved", progress: 100 },
  { icon: "📄", label: "PAN Card",                sub: "ABCDE1234F",           status: "pending",  progress: 60  },
  { icon: "🏅", label: "Professional Certificate", sub: "HVAC Technician · 2019", status: "approved", progress: 100 },
  { icon: "🪪", label: "Profile Photo",            sub: "rs_profile.jpg",      status: "approved", progress: 100 },
  { icon: "🚗", label: "Driving License",          sub: "Optional · Not uploaded", status: "upload", progress: 0 },
];

const STATUS = {
  approved: { cls: "bg-green-500/20 text-green-400 border-green-500/30", label: "Approved", bar: "#22C55E" },
  pending:  { cls: "bg-amber-500/20 text-amber-300 border-amber-500/30", label: "Pending",  bar: "#F59E0B" },
  rejected: { cls: "bg-rose-500/20 text-rose-400 border-rose-500/30",   label: "Rejected", bar: "#F43F5E" },
  upload:   { cls: "",                                                    label: "",         bar: "" },
};

export default function Documents() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-white">My Documents</h1>
          <p className="text-xs text-white/60 mt-0.5">4 of 5 documents submitted</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {DOCS.map((doc, i) => {
          const s = STATUS[doc.status];
          return (
            <div key={i} className="rounded-2xl border border-white/20 p-4 transition-all hover:bg-white/[0.18]"
              style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ background: "rgba(59,130,246,0.15)" }}>
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{doc.label}</div>
                  <div className="text-xs text-white/50 truncate mt-0.5">{doc.sub}</div>
                </div>
                {doc.status === "upload" ? (
                  <button className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                    style={{ background: "rgba(255,255,255,0.1)" }}>
                    <Upload size={12} /> Upload
                  </button>
                ) : (
                  <span className={`rounded-xl border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
                )}
              </div>
              {doc.progress > 0 && (
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${doc.progress}%`, background: s.bar }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
