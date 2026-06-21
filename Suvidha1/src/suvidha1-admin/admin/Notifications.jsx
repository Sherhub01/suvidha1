import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Users, UserCheck, Globe, Bell, Loader2, RefreshCw, Clock, Trash2 } from "lucide-react";
import { Card, Btn, SectionHeader, Input, Textarea, Badge } from "./ui";
import { sendNotification, getNotifications } from "./services/api";
import Swal from "sweetalert2";

const BACKEND = "http://localhost:5000";
function authHeaders() {
  const t = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${t}`, "Content-Type": "application/json" };
}

// Build real notifications from platform activity
function buildNotifications(pending, recentBookings, consumers) {
  const notifs = [];

  pending.forEach(s => {
    const name = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim() || "Staff";
    notifs.push({
      id: `pending_${s._id}`,
      title: "New Staff Application",
      message: `${name} · ${s.category || "—"} · ${s.city || s.serviceCity || "—"}`,
      time: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Pending",
      type: "staff",
      unread: true,
    });
  });

  recentBookings.forEach(b => {
    const con = b.consumer || {};
    const name = `${con.firstName || ""} ${con.lastName || ""}`.trim() || "Consumer";
    if (b.status === "Scheduled") {
      notifs.push({
        id: `booking_${b._id}`,
        title: `New Booking: ${b.service}`,
        message: `${name} · ${b.date} · ${b.address || "—"}`,
        time: new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        type: "booking",
        unread: true,
      });
    }
  });

  consumers.slice(0, 3).forEach(c => {
    const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "User";
    notifs.push({
      id: `consumer_${c._id}`,
      title: "New Consumer Registered",
      message: `${name} · ${c.email}`,
      time: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—",
      type: "consumer",
      unread: !c.isVerified,
    });
  });

  return notifs.sort((a, b) => (a.unread === b.unread ? 0 : a.unread ? -1 : 1));
}

const POLL_MS = 20000;

export default function AdminNotifications() {
  const [title,     setTitle]     = useState("");
  const [desc,      setDesc]      = useState("");
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(null);
  const [sentNotifs, setSentNotifs] = useState([]);
  const [notifs,    setNotifs]    = useState([]);
  const [counts,    setCounts]    = useState({ consumers: 0, staff: 0 });
  const [loading,   setLoading]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const pollRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [pen, bkn, con, sentRes] = await Promise.all([
        fetch(`${BACKEND}/api/staff/admin/list?status=pending`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${BACKEND}/api/admin/bookings?limit=10`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${BACKEND}/api/admin/consumers?limit=5`, { headers: authHeaders() }).then(r => r.json()),
        getNotifications().then(r => r.data).catch(() => ({ notifications: [] })),
      ]);
      const statsRes = await fetch(`${BACKEND}/api/admin/stats`, { headers: authHeaders() }).then(r => r.json());
      setNotifs(buildNotifications(
        pen.profiles  || [],
        bkn.bookings  || [],
        con.consumers || [],
      ));
      setSentNotifs(sentRes.notifications || []);
      if (statsRes.success) setCounts({ consumers: statsRes.stats.totalConsumers, staff: statsRes.stats.totalStaff });
    } catch { /* network */ }
    finally { if (!silent) setLoading(false); setLastRefresh(new Date()); }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const AUDIENCE_LABEL = { all: "All Users", consumers: "Consumers", staff: "Professionals" };

  const send = async (audience) => {
    if (!title.trim() || !desc.trim()) return;
    setSending(true);
    try {
      await sendNotification({ title, message: desc, audience });
      setSent(AUDIENCE_LABEL[audience]);
      setTimeout(() => setSent(null), 3000);
      setTitle(""); setDesc("");
      load(true);
    } catch {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not send notification.", background: "#0f172a", color: "#fff" });
    } finally {
      setSending(false);
    }
  };

  const TYPE_ICON = { staff: "👤", booking: "📅", consumer: "🙋" };
  const TYPE_COLOR = {
    staff:    "bg-purple-50 text-purple-700 border-purple-200",
    booking:  "bg-blue-50 text-blue-700 border-blue-200",
    consumer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="Notifications" subtitle="Platform activity and announcements" />
        <button onClick={() => load()} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
      {lastRefresh && (
        <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-4">
          <Clock size={10} /> Live feed · last updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · auto-refreshes every 20s
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compose */}
        <Card className="p-5">
          <div className="text-sm font-bold text-gray-800 mb-4">Send Announcement</div>
          <div className="space-y-3">
            <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Platform Maintenance on Sunday" />
            <Textarea label="Message" rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Write your announcement here…" />
          </div>

          {sent && (
            <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
              ✓ Notification sent to <strong>{sent}</strong> successfully.
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-2">
            <Btn variant="primary"   onClick={() => send("all")}       disabled={!title || !desc || sending}>
              <Globe size={13} /> Send to All Users
            </Btn>
            <Btn variant="secondary" onClick={() => send("consumers")}  disabled={!title || !desc || sending}>
              <Users size={13} /> Send to Consumers Only
            </Btn>
            <Btn variant="outline"   onClick={() => send("staff")}      disabled={!title || !desc || sending}>
              <UserCheck size={13} /> Send to Professionals Only
            </Btn>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px]">
            {[
              [counts.consumers.toLocaleString(), "Consumers"],
              [counts.staff.toLocaleString(),     "Professionals"],
              [(counts.consumers + counts.staff).toLocaleString(), "Total"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-gray-50 border border-gray-100 py-2">
                <div className="font-bold text-gray-800">{n}</div>
                <div className="text-gray-400">{l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card className="p-5">
          <div className="text-sm font-bold text-gray-800 mb-4">
            Live Activity Feed
            {notifs.some(n => n.unread) && (
              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {notifs.filter(n => n.unread).length}
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
          ) : notifs.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Bell size={28} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No activity yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {notifs.map(n => (
                <div key={n.id} className={`flex items-start gap-3 rounded-xl border p-3 transition ${n.unread ? "border-amber-200 bg-amber-50/50" : "border-gray-100 bg-white hover:bg-gray-50"}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base ${TYPE_COLOR[n.type] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {TYPE_ICON[n.type] || "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13px] font-semibold leading-snug ${n.unread ? "text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">{n.time}</span>
                        {n.unread && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                      </div>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5 truncate">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Sent Announcements History */}
      <Card className="mt-4 p-5">
        <div className="text-sm font-bold text-gray-800 mb-4">Sent Announcements History</div>
        {sentNotifs.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Send size={24} className="text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No announcements sent yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sentNotifs.map(n => {
              const AUDIENCE_COLOR = {
                all:       "bg-blue-50 text-blue-700 border-blue-200",
                consumers: "bg-emerald-50 text-emerald-700 border-emerald-200",
                staff:     "bg-purple-50 text-purple-700 border-purple-200",
              };
              const AUDIENCE_LABEL2 = { all: "All Users", consumers: "Consumers", staff: "Professionals" };
              return (
                <div key={n._id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 hover:bg-gray-50 transition">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base ${AUDIENCE_COLOR[n.audience] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    📢
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold text-gray-900 leading-snug">{n.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${AUDIENCE_COLOR[n.audience]}`}>
                          {AUDIENCE_LABEL2[n.audience]}
                        </span>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
