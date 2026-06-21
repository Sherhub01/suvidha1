// ────────────────────────────────────────────────────────────
// Shared UI primitives — import from this file everywhere
// ────────────────────────────────────────────────────────────

// Card
export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Stat card
export function StatCard({ icon: Icon, label, value, change, changeLabel, color = "blue" }) {
  const colors = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",  badge: "bg-blue-100 text-blue-700" },
    green:  { bg: "bg-green-50",  icon: "text-green-600", badge: "bg-green-100 text-green-700" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
    red:    { bg: "bg-red-50",    icon: "text-red-600",   badge: "bg-red-100 text-red-700" },
    teal:   { bg: "bg-teal-50",   icon: "text-teal-600",  badge: "bg-teal-100 text-teal-700" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600",badge: "bg-purple-100 text-purple-700" },
  };
  const c = colors[color] || colors.blue;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon size={20} className={c.icon} />
        </div>
        {change !== undefined && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.badge}`}>
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold text-gray-900">{value ?? <Skeleton className="h-7 w-24" />}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
      {changeLabel && <div className="mt-1 text-[11px] text-gray-400">{changeLabel}</div>}
    </Card>
  );
}

// Badge
export function Badge({ status }) {
  const map = {
    active:    "bg-green-100 text-green-700",
    approved:  "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    pending:   "bg-amber-100 text-amber-700",
    rejected:  "bg-red-100 text-red-700",
    suspended: "bg-red-100 text-red-700",
    cancelled: "bg-red-100 text-red-700",
    disabled:  "bg-gray-100 text-gray-600",
    paid:      "bg-blue-100 text-blue-700",
    refunded:  "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${map[status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// Button
export function Btn({ children, variant = "primary", size = "sm", onClick, disabled, className = "", type = "button" }) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { xs: "px-2.5 py-1 text-[11px]", sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary:  "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary:"bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
    danger:   "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    success:  "bg-green-500 text-white hover:bg-green-600 shadow-sm",
    outline:  "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    ghost:    "text-gray-600 hover:bg-gray-100",
    amber:    "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// Table shell
export function Table({ headers, children, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100">
            {headers.map(h => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
      {empty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-sm font-medium text-gray-500">{empty}</div>
        </div>
      )}
    </div>
  );
}

// Table row
export function TR({ children, onClick }) {
  return (
    <tr onClick={onClick} className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${onClick ? "cursor-pointer" : ""}`}>
      {children}
    </tr>
  );
}

// Table cell
export function TD({ children, className = "" }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>;
}

// Skeleton
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}

// Pagination
export function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
      <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
      <div className="flex gap-1">
        <Btn variant="outline" size="xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Btn>
        <Btn variant="outline" size="xs" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</Btn>
      </div>
    </div>
  );
}

// Modal
export function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${width} rounded-2xl bg-white shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ConfirmDialog
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <Btn variant="outline" onClick={onCancel}>Cancel</Btn>
        <Btn variant={danger ? "danger" : "primary"} onClick={onConfirm}>Confirm</Btn>
      </div>
    </Modal>
  );
}

// SearchBar
export function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:bg-white transition"
    />
  );
}

// Select filter
export function FilterSelect({ value, onChange, options, placeholder = "All" }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:bg-white transition"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Input
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
      <input {...props}
        className="rounded-xl border border-gray-200 px-3 py-2 text-[13px] text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

// Textarea
export function Textarea({ label, rows = 3, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
      <textarea rows={rows} {...props}
        className="rounded-xl border border-gray-200 px-3 py-2 text-[13px] text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
      />
    </div>
  );
}

// SectionHeader
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ChartPlaceholder
export function ChartPlaceholder({ label, height = "h-48" }) {
  return (
    <div className={`${height} rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex flex-col items-center justify-center gap-2`}>
      <div className="flex items-end gap-1.5 h-12">
        {[40, 65, 45, 80, 60, 90, 55, 75, 50, 85].map((h, i) => (
          <div key={i} className="w-4 rounded-t" style={{ height: `${h}%`, background: i % 2 === 0 ? "#2563EB" : "#14B8A6", opacity: 0.6 }} />
        ))}
      </div>
      <div className="text-xs text-gray-400 font-medium">{label} — chart renders after API integration</div>
    </div>
  );
}

// Avatar initials
export function Avatar({ name = "", size = "sm" }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
  const sizes = { xs: "h-6 w-6 text-[9px]", sm: "h-8 w-8 text-[11px]", md: "h-10 w-10 text-[13px]", lg: "h-12 w-12 text-base" };
  const colors = ["bg-blue-500","bg-teal-500","bg-amber-500","bg-purple-500","bg-rose-500","bg-green-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full text-white font-bold ${sizes[size]} ${color}`}>
      {initials}
    </div>
  );
}
