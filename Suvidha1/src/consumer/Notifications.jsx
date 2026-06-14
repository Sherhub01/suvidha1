import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, BookOpen, Zap, Gift, Settings, AlertCircle } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";

const FILTERS = [
  { key: "all",     label: "All" },
  { key: "booking", label: "Bookings" },
  { key: "alert",   label: "Alerts" },
  { key: "promo",   label: "Promos" },
  { key: "system",  label: "System" },
];

const TYPE_META = {
  booking: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20",    icon: BookOpen  },
  alert:   { color: "bg-amber-500/15 text-amber-400 border-amber-500/20", icon: AlertCircle },
  promo:   { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: Gift },
  system:  { color: "bg-purple-500/15 text-purple-400 border-purple-500/20",    icon: Settings },
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = notifications.filter(
    (n) => activeFilter === "all" || n.type === activeFilter
  );

  const handleClick = (notif) => {
    markRead(notif.id);
    navigate(notif.link);
  };

  return (
    <div className="mx-auto max-w-2xl pb-10">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
            <Bell size={20} className="text-slate-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Notifications</h1>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500 shadow-sm hover:bg-rose-100 transition"
            >
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => {
          const count = f.key === "all"
            ? notifications.filter((n) => !n.read).length
            : notifications.filter((n) => n.type === f.key && !n.read).length;

          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeFilter === f.key
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-md shadow-amber-400/20"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                  activeFilter === f.key ? "bg-slate-900/20 text-slate-900" : "bg-amber-100 text-amber-600"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Bell size={36} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No notifications here</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const meta = TYPE_META[notif.type] || TYPE_META.system;
            const TypeIcon = meta.icon;

            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left flex items-start gap-4 rounded-2xl border p-4 transition group
                  ${notif.read
                    ? "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                    : "bg-white border-amber-200/60 shadow-sm shadow-amber-100 hover:shadow-md hover:border-amber-300"
                  }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl border text-lg ${meta.color}`}>
                  {notif.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${notif.read ? "text-slate-600" : "text-slate-900"}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${notif.read ? "text-slate-400" : "text-slate-500"}`}>
                    {notif.message}
                  </p>
                  {/* Type badge */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.color}`}>
                      <TypeIcon size={10} />
                      {notif.type}
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
