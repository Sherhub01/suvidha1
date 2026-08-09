import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, BookOpen, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";
import { session } from "../session";
import { API_URL } from "../config";

const API = axios.create({ baseURL: API_URL });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token") || session.getToken();
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const TYPE_ICON = {
  booking_confirmed:  "🔧",
  booking_completed:  "✅",
  booking_cancelled:  "❌",
  booking_scheduled:  "📅",
};

export default function Notifications() {
  const navigate = useNavigate();
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/bookings/consumer-alerts");
      if (data.success) setAlerts(data.alerts);
    } catch { /* offline */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll every 15s so status updates appear automatically
  useEffect(() => {
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const markRead = async (alert) => {
    if (!alert.isRead) {
      try { await API.patch(`/bookings/consumer-alerts/${alert._id}/read`); } catch { /* ignore */ }
      setAlerts(prev => prev.map(a => a._id === alert._id ? { ...a, isRead: true } : a));
    }
    navigate("/bookings");
  };

  const markAllRead = async () => {
    try { await API.patch("/bookings/consumer-alerts/read-all"); } catch { /* ignore */ }
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const unread   = alerts.filter(a => !a.isRead).length;

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
          <button onClick={load}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
            <RefreshCw size={12} /> Refresh
          </button>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-slate-400">Live · auto-refreshes every 15s</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-amber-500" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Bell size={36} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No notifications here</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const read = alert.isRead;
            const icon = TYPE_ICON[alert.type] || "📋";
            const b    = alert.booking || {};
            return (
              <button key={alert._id} onClick={() => markRead(alert)}
                className={`w-full text-left flex items-start gap-4 rounded-2xl border p-4 transition group ${
                  read
                    ? "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                    : "bg-white border-amber-200/60 shadow-sm shadow-amber-100 hover:shadow-md hover:border-amber-300"
                }`}>
                <div className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl border text-lg ${
                  read ? "bg-slate-50 border-slate-100" : "bg-amber-50 border-amber-200"
                }`}>
                  {icon}
                  {!read && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${read ? "text-slate-600" : "text-slate-900"}`}>
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(alert.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      {!read && <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />}
                    </div>
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${read ? "text-slate-400" : "text-slate-500"}`}>
                    {alert.message}
                  </p>
                  {b.date && (
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span>📅 {b.date} · {b.time}</span>
                      {b.price && <span className="font-semibold text-slate-600">{b.price}</span>}
                      <span className={`px-2 py-0.5 rounded-lg font-semibold ${
                        b.status === "Confirmed" ? "bg-indigo-50 text-indigo-600" :
                        b.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                        b.status === "Cancelled" ? "bg-rose-50 text-rose-500" :
                        "bg-blue-50 text-blue-600"
                      }`}>{b.status}</span>
                    </div>
                  )}
                  {!read && (
                    <p className="mt-1.5 text-[11px] font-semibold text-amber-500">Tap to view booking →</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
