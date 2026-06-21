import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, Trash2, BookOpen, IndianRupee,
  ShieldCheck, AlertCircle, Loader2, X, ArrowRight,
} from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const TYPE_META = {
  booking: { color: "bg-blue-500/15 text-blue-600 border-blue-500/20",      icon: BookOpen,    label: "Booking"  },
  payment: { color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", icon: IndianRupee, label: "Payment"  },
  admin:   { color: "bg-purple-500/15 text-purple-600 border-purple-500/20",    icon: ShieldCheck, label: "Admin"    },
  alert:   { color: "bg-amber-500/15 text-amber-600 border-amber-500/20",    icon: AlertCircle, label: "Alert"    },
};
const EMOJI = { booking: "📅", payment: "💰", admin: "🛡️", alert: "⚠️" };

function bookingToNotif(b) {
  const consumer = b.consumer || {};
  const name     = `${consumer.firstName || ""} ${consumer.lastName || ""}`.trim() || "Customer";
  return {
    id:      b._id,
    type:    "booking",
    title:   `${b.service} — ${b.status}`,
    message: `${name} · ${b.date}${b.address ? " · " + b.address : ""}`,
    detail:  `Booking for ${b.service} with ${name}. Address: ${b.address || "—"}. Date: ${b.date} at ${b.time || "—"}. Amount: ${b.price || "—"}.`,
    time:    new Date(b.updatedAt || b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    action:  { label: "View Booking", to: "/staff/bookings" },
  };
}

const FILTERS = [
  { key: "all",      label: "All"      },
  { key: "bookings", label: "Bookings" },
];

function DetailModal({ notif, onClose }) {
  const navigate = useNavigate();
  const meta     = TYPE_META[notif.type] || TYPE_META.admin;
  const TypeIcon = meta.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex items-start gap-4 px-6 pt-6 pb-4 border-b border-slate-100">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl ${meta.color}`}>
            {EMOJI[notif.type] || "📋"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-900">{notif.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{notif.time}</p>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-500">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.color}`}>
            <TypeIcon size={10} /> {meta.label}
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{notif.detail || notif.message}</p>
          {notif.action && (
            <button onClick={() => { onClose(); navigate(notif.action.to); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {notif.action.label} <ArrowRight size={14} />
            </button>
          )}
          <button onClick={onClose}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StaffNotifications() {
  const [notifs, setNotifs]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [readIds, setReadIds]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("sn_read") || "[]"); } catch { return []; }
  });
  const [activeFilter, setFilter] = useState("all");
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    API.get("/bookings/staff")
      .then(r => { if (r.data.success) setNotifs(r.data.bookings.map(bookingToNotif)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveRead    = (ids) => { setReadIds(ids); localStorage.setItem("sn_read", JSON.stringify(ids)); };
  const markRead    = (id)  => saveRead([...new Set([...readIds, id])]);
  const markAllRead = ()    => saveRead(notifs.map(n => n.id));
  const clearAll    = ()    => { setNotifs([]); saveRead([]); };
  const deleteOne   = (e, id) => { e.stopPropagation(); setNotifs(p => p.filter(n => n.id !== id)); };

  const isRead   = (n) => readIds.includes(n.id);
  const filtered = activeFilter === "all" ? notifs : notifs.filter(n => n.type === "booking");
  const unread   = notifs.filter(n => !isRead(n)).length;

  const handleOpen = (n) => { markRead(n.id); setSelected(n); };

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
            <Bell size={20} className="text-slate-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Notifications</h1>
            <p className="text-xs text-slate-500">{unread > 0 ? `${unread} unread` : "All caught up!"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifs.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500 shadow-sm hover:bg-rose-100 transition">
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => {
          const count = (f.key === "all" ? notifs : notifs.filter(n => n.type === "booking")).filter(n => !isRead(n)).length;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeFilter === f.key
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-md shadow-amber-400/20"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}>
              {f.label}
              {count > 0 && (
                <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                  activeFilter === f.key ? "bg-slate-900/20 text-slate-900" : "bg-amber-100 text-amber-600"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Bell size={36} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No notifications here</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const meta     = TYPE_META[notif.type] || TYPE_META.admin;
            const TypeIcon = meta.icon;
            const read     = isRead(notif);
            return (
              <button key={notif.id} onClick={() => handleOpen(notif)}
                className={`w-full text-left flex items-start gap-4 rounded-2xl border p-4 transition group ${
                  read
                    ? "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                    : "bg-white border-amber-200/60 shadow-sm shadow-amber-100 hover:shadow-md hover:border-amber-300"
                }`}>
                <div className={`relative flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl border text-lg ${meta.color}`}>
                  {EMOJI[notif.type] || "📋"}
                  {!read && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${read ? "text-slate-600" : "text-slate-900"}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                      {read && (
                        <button onClick={(e) => deleteOne(e, notif.id)}
                          className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 transition text-slate-400">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${read ? "text-slate-400" : "text-slate-500"}`}>
                    {notif.message}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.color}`}>
                      <TypeIcon size={10} /> {meta.label}
                    </span>
                    <span className="text-[11px] text-amber-500 font-medium opacity-0 group-hover:opacity-100 transition">
                      Tap to view →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && <DetailModal notif={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
