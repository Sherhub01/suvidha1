import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, BookOpen, AlertCircle, Gift, Settings, Loader2 } from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const FILTERS = [
  { key: "all",     label: "All" },
  { key: "booking", label: "Bookings" },
  { key: "system",  label: "System" },
];

const TYPE_META = {
  booking: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20",   icon: BookOpen   },
  alert:   { color: "bg-amber-500/15 text-amber-400 border-amber-500/20", icon: AlertCircle },
  promo:   { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: Gift  },
  system:  { color: "bg-purple-500/15 text-purple-400 border-purple-500/20",    icon: Settings },
};

// Turn a real booking into a notification object
function bookingToNotif(b) {
  return {
    id:      b._id,
    type:    "booking",
    title:   `${b.service} — ${b.status}`,
    message: `${b.workerName || "Professional"} · ${b.date}${b.address ? " · " + b.address : ""}`,
    time:    new Date(b.updatedAt || b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    read:    b.status === "Completed" || b.status === "Cancelled",
    link:    "/bookings",
    icon:    b.status === "Completed" ? "✅" : b.status === "Cancelled" ? "❌" : b.status === "Confirmed" ? "🔧" : "📅",
  };
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [readIds, setReadIds]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("cn_read") || "[]"); } catch { return []; }
  });
  const [activeFilter, setFilter] = useState("all");

  useEffect(() => {
    API.get("/bookings/consumer")
      .then(r => {
        if (r.data.success) setNotifs(r.data.bookings.map(bookingToNotif));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveRead = (ids) => {
    setReadIds(ids);
    localStorage.setItem("cn_read", JSON.stringify(ids));
  };

  const markRead    = (id) => saveRead([...new Set([...readIds, id])]);
  const markAllRead = ()   => saveRead(notifs.map(n => n.id));
  const clearAll    = ()   => { setNotifs([]); saveRead([]); };

  const isRead  = (n) => n.read || readIds.includes(n.id);
  const filtered = notifs.filter(n => activeFilter === "all" || n.type === activeFilter);
  const unread   = notifs.filter(n => !isRead(n)).length;

  const handleClick = (notif) => { markRead(notif.id); navigate(notif.link); };

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
          const count = (f.key === "all" ? notifs : notifs.filter(n => n.type === f.key)).filter(n => !isRead(n)).length;
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
            const meta    = TYPE_META[notif.type] || TYPE_META.system;
            const TypeIcon = meta.icon;
            const read    = isRead(notif);
            return (
              <button key={notif.id} onClick={() => handleClick(notif)}
                className={`w-full text-left flex items-start gap-4 rounded-2xl border p-4 transition group ${
                  read
                    ? "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                    : "bg-white border-amber-200/60 shadow-sm shadow-amber-100 hover:shadow-md hover:border-amber-300"
                }`}>
                <div className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl border text-lg ${meta.color}`}>
                  {notif.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${read ? "text-slate-600" : "text-slate-900"}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                      {!read && <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />}
                    </div>
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${read ? "text-slate-400" : "text-slate-500"}`}>
                    {notif.message}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.color}`}>
                      <TypeIcon size={10} /> {notif.type}
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
    </div>
  );
}
