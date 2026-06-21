import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Send, Star, MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";

const LINKS = {
  Platform: [
    { label: "Dashboard",  to: "/dashboard" },
    { label: "Services",   to: "/services"  },
    { label: "Bookings",   to: "/bookings"  },
    { label: "Map",        to: "/map"       },
  ],
  Account: [
    { label: "Settings",       to: "/settings" },
    { label: "Notifications",  to: "/notifications" },
    { label: "About",          to: "/about"    },
  ],
  Legal: [
    { label: "Privacy Policy",   to: "/privacy"  },
    { label: "Terms & Conditions", to: "/terms"  },
  ],
};

function FeedbackForm() {
  const [form, setForm]   = useState({ name: "", email: "", rating: 0, message: "" });
  const [hover, setHover] = useState(0);
  const [sent, setSent]   = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message.trim() || !form.rating) return;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-700/30 bg-emerald-900/30 p-8 text-center">
        <CheckCircle2 size={36} className="text-emerald-400" />
        <p className="text-base font-bold text-white">Thank you, {form.name || "friend"}!</p>
        <p className="text-sm text-white/60">Your feedback helps us improve Suvidha1.</p>
        <button
          onClick={() => { setSent(false); setForm({ name: "", email: "", rating: 0, message: "" }); }}
          className="mt-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 transition"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Your name</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Rahul Sharma"
            className="w-full rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
          />
        </div>
      </div>

      {/* Star rating */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">Rate your experience</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => set("rating", s)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={`transition-colors ${
                  s <= (hover || form.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-white/20"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="mb-1 block text-xs font-medium text-white/50">Your feedback</label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us what you loved or how we can improve…"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
        />
      </div>

      <button
        type="submit"
        disabled={!form.message.trim() || !form.rating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send size={14} /> Submit Feedback
      </button>
    </form>
  );
}

export default function Footer() {
  const navigate = useNavigate();

  const handleNavClick = (to) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-auto border-t border-white/6 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

          {/* Brand + contact */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                <Zap size={16} strokeWidth={2.5} className="text-slate-900" />
              </div>
              <div>
                <span className="block text-base font-extrabold text-white leading-none">
                  Suvidha<span className="text-amber-400">1</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">Pro Services</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-white/50 mb-5">
              India's trusted platform for verified home service professionals — available 24 × 7.
            </p>
            <div className="space-y-2 text-xs text-white/50">
              <div className="flex items-center gap-2"><MapPin size={13} className="text-amber-400/70 shrink-0" /> New Delhi, India</div>
              <div className="flex items-center gap-2"><Phone size={13} className="text-amber-400/70 shrink-0" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Mail size={13} className="text-amber-400/70 shrink-0" /> support@suvidha1.app</div>
            </div>
          </div>

          {/* Nav link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group} className="lg:col-span-1">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">{group}</p>
              <ul className="space-y-2.5">
                {items.map(({ label, to }) => (
                  <li key={to} className="group">
                    <button
                      onClick={() => handleNavClick(to)}
                      className="inline-flex items-center text-sm text-white/60 font-medium transition duration-200 hover:text-amber-400"
                    >
                      <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Feedback form */}
          <div className="lg:col-span-2">
            <p className="mb-1 text-sm font-bold text-white">Share your feedback</p>
            <p className="mb-4 text-xs text-white/40">Help us build a better Suvidha1.</p>
            <FeedbackForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/6 pt-6 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Suvidha1. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Built with ❤️ in India
          </p>
        </div>

      </div>
    </footer>
  );
}
