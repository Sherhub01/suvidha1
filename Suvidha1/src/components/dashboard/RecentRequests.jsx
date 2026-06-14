import React from "react";
import { CalendarClock, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { recentRequests } from "../../data/mockData";

const STATUS_STYLES = {
  Completed: { icon: CheckCircle2, classes: "bg-emerald-100 text-emerald-600" },
  Scheduled: { icon: Clock3,       classes: "bg-amber-100 text-amber-600" },
  Cancelled: { icon: XCircle,      classes: "bg-rose-100 text-rose-500" },
};

export default function RecentRequests() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-slate-800">Recent requests</h2>

      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-900/5">
        {recentRequests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <CalendarClock size={28} className="text-slate-400" />
            <p className="text-sm text-slate-500">
              No bookings yet — your service history will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentRequests.map((req) => {
              const status = STATUS_STYLES[req.status];
              const StatusIcon = status.icon;
              return (
                <li
                  key={req.id}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-sand/60"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${status.classes}`}
                  >
                    <StatusIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {req.service}{" "}
                      <span className="font-normal text-slate-500">with {req.worker}</span>
                    </p>
                    <p className="text-xs text-slate-400">{req.date}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}
                  >
                    {req.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
