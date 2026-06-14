import React, { useState } from "react";
import { Mail, Phone, Globe, MessageCircle, ChevronDown, ShieldCheck, Star, Clock } from "lucide-react";

const FAQS = [
  { q: "How are professionals verified on Suvidha?", a: "Every professional submits government ID and undergoes a background check before accepting bookings. Verified pros carry a blue badge." },
  { q: "What if I'm not satisfied with a service?", a: "Raise an issue from your booking history within 24 hours and our support team will arrange a free re-visit or full refund." },
  { q: "Which cities does Suvidha cover?", a: "We're live across 50+ metro and tier-2 cities in India, with new cities added every month. Check availability at booking." },
  { q: "Is my payment secure?", a: "All payments are processed through PCI-DSS compliant gateways. We never store your card details." },
];

const STATS = [
  { value: "50K+",   label: "Happy customers",        icon: Star },
  { value: "2K+",    label: "Verified professionals", icon: ShieldCheck },
  { value: "50+",    label: "Cities covered",         icon: Globe },
  { value: "< 2 hrs",label: "Avg response time",      icon: Clock },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="mx-auto max-w-3xl pb-16">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl px-8 py-10 text-white" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #1e40af 100%)" }}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-10 bottom-0 h-24 w-24 rounded-full border border-white/[0.06]" />
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">About us</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Built for India's homes.</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
          Suvidha connects households with verified, skilled professionals — from electricians
          and plumbers to tutors and beauticians — booked in minutes, backed by transparent
          pricing and real reviews.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Icon size={17} strokeWidth={2.2} />
            </div>
            <p className="text-xl font-bold text-slate-800">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Mission & Vision */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={17} />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Our Mission</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Make trustworthy home services accessible to every household, while giving
            skilled workers fair, steady income.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Star size={17} />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Our Vision</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            A neighbourhood where help is always one tap away — reliable, affordable,
            and fair for everyone involved.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Frequently asked questions</h2>
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {FAQS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {item.q}
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              {openFaq === i && (
                <p className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-500">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Get in touch</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { href: "mailto:support@suvidha.app", icon: Mail,          bg: "bg-amber-50",   text: "text-amber-600",   label: "Email us",         value: "support@suvidha.app" },
            { href: "tel:+911800123456",           icon: Phone,         bg: "bg-emerald-50", text: "text-emerald-600", label: "Call us",           value: "1800-123-456" },
            { href: "#",                           icon: Globe,         bg: "bg-slate-100",  text: "text-slate-600",   label: "Website",           value: "www.suvidha.app" },
            { href: "#",                           icon: MessageCircle, bg: "bg-rose-50",    text: "text-rose-500",    label: "Live chat",         value: "Chat with support" },
          ].map(({ href, icon: Icon, bg, text, label, value }) => (
            <a key={label} href={href}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}>
                <Icon size={18} />
              </span>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
