import React, { useEffect, useState } from "react";

function formatDateTime(date) {
  const dateStr = date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
}

export default function GreetingHero({ user = {} }) {
  const [now, setNow] = useState(new Date());
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "there";

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const { dateStr, timeStr } = formatDateTime(now);

  return (
    <section className="relative overflow-hidden rounded-2xl px-8 py-10 text-white shadow-lg mb-8" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #1e40af 100%)'}}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute right-8 bottom-0 h-28 w-28 rounded-full border border-white/6" />
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">{dateStr} · {timeStr}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Good to see you, <span className="text-amber-400">{fullName}</span> 👋
      </h1>
      <p className="mt-2 max-w-md text-sm text-white/70">
        Find a trusted professional for any job around your home — booked in minutes, backed by verified reviews.
      </p>
    </section>
  );
}
