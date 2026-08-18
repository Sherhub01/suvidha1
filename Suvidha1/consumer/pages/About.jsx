import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Target, Eye, Mail, Phone, MapPin, ChevronDown, ExternalLink,
  ShieldCheck, Clock, Users, Star, Zap, CheckCircle2, HeartHandshake,
  Award, TrendingUp, Globe2, ThumbsUp,
} from "lucide-react";
import { THEME, SERVICES } from "../../shared/api";

const FAQS = [
  {
    q: "How are professionals verified on Suvidha1?",
    a: "Every professional submits government ID (Aadhaar and PAN) plus their address and experience details, and each application is reviewed by our team before the profile goes live. After that we track ratings and reviews from real completed bookings. We do not yet run police verification or in-person skill tests.",
  },
  {
    q: "How do I book a service?",
    a: "Search for the service you need, pick a professional based on ratings, price and availability, and tap 'Book service' on their profile. They will confirm the booking within minutes. You can also chat with them before booking.",
  },
  {
    q: "What if I'm not satisfied with the work?",
    a: "Contact support at support@suvidha1.app with your booking reference within 24 hours. We will look into it with the professional and, where appropriate, arrange a re-visit or a refund.",
  },
  {
    q: "Is pricing fixed or negotiable?",
    a: "Each professional lists either an hourly rate or a fixed price for common jobs. Any additional work beyond the original scope is quoted and agreed upon before they proceed — no surprise charges.",
  },
  {
    q: "Which cities does Suvidha1 operate in?",
    a: "We currently operate across Delhi NCR (Delhi, Gurugram, Noida, Faridabad) and are rapidly expanding to Mumbai, Pune, Bengaluru, Hyderabad, Chennai, Kolkata and Ahmedabad in 2025.",
  },
  {
    q: "Is my payment secure?",
    a: "You can pay the professional in cash after the job, or pay online where that is offered. Online payments go through a third-party payment gateway and your card details never touch our servers.",
  },
  {
    q: "Can I become a service professional on Suvidha1?",
    a: "Absolutely. Download the app, create a professional account, complete your verification, and start receiving bookings. Most professionals start earning within 48 hours of approval.",
  },
];

const STATS = [
  { icon: Users,      label: "Verified professionals", value: "10,000+" },
  { icon: ShieldCheck,label: "Background-checked",      value: "100%"    },
  { icon: Clock,      label: "Avg. response time",      value: "< 30 min"},
  { icon: Star,       label: "Average rating",          value: "4.8 / 5" },
  { icon: ThumbsUp,   label: "Satisfaction rate",       value: "96%"     },
  { icon: Globe2,     label: "Cities served",           value: "12+"     },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    desc: "Every professional submits government ID and is reviewed by our team before their profile goes live, so you know who is coming to your home.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Zap,
    title: "Speed",
    desc: "Get a professional at your door in under 60 minutes for urgent needs, or schedule in advance at your convenience.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: HeartHandshake,
    title: "Fair for Everyone",
    desc: "Transparent pricing for consumers and fair, steady earnings for professionals — no hidden platform cuts, no surprises.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Award,
    title: "Quality Assured",
    desc: "Every booking is backed by our Service Guarantee. Not satisfied? We make it right, every single time.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Growth for Pros",
    desc: "Professionals get tools to grow their income — from smart scheduling and earnings analytics to customer insights.",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: CheckCircle2,
    title: "Reliability",
    desc: "Real-time booking status, GPS tracking and in-app chat so you're never left wondering where your professional is.",
    color: "bg-purple-50 text-purple-600",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Search", desc: "Browse by service category or search by name. Filter by rating, price, availability or distance." },
  { step: "02", title: "Choose", desc: "View profiles, read verified reviews and compare prices. Chat with the professional before booking." },
  { step: "03", title: "Book", desc: "Select a time slot that works for you. Our system instantly notifies the professional." },
  { step: "04", title: "Get it done", desc: "Professional arrives on time, does the job. Pay securely through the app when complete." },
];

const SOCIALS = [
  { href: "https://facebook.com",  label: "Facebook",  color: "hover:text-blue-600  hover:border-blue-300  hover:bg-blue-50"  },
  { href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-600  hover:border-pink-300  hover:bg-pink-50"  },
  { href: "https://twitter.com",   label: "Twitter",   color: "hover:text-sky-500   hover:border-sky-300   hover:bg-sky-50"   },
  { href: "https://linkedin.com",  label: "LinkedIn",  color: "hover:text-blue-700  hover:border-blue-400  hover:bg-blue-50"  },
];

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="flex flex-col gap-10 pb-10">

      {/* ── Hero ── */}
      <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#312E81_0%,#4F46E5_30%,#7C3AED_60%,#06B6D4_100%)] p-8 sm:p-12">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 mb-4">
            <Zap size={12} /> India's Most Trusted Home Services Platform
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl leading-tight">
            Trusted local professionals,<br />just a tap away
          </h1>
          <p className="mt-4 text-base text-white/75 leading-relaxed">
            Suvidha1 connects households with ID-verified, admin-reviewed
            professionals across 16+ service categories — making quality home services
            accessible, affordable and reliable for everyone.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/services" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 hover:bg-white/90 transition shadow-lg">
              Browse Services →
            </Link>
            <a href="mailto:support@suvidha1.app" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition">
              <Mail size={14} /> Contact Us
            </a>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className={`${THEME.glassCard} flex flex-col items-center p-4 text-center`}>
              <Icon size={18} className="text-cyan-300 mb-1.5" />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-[11px] text-white/65 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={`${THEME.card} p-6 border-l-4 border-indigo-500`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <Target size={20} />
          </span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">Our Mission</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed dark:text-slate-300">
            To make trusted home and personal services accessible to every household at
            fair prices, with zero hassle — by putting verified professionals just a
            search away, 7 days a week.
          </p>
        </div>
        <div className={`${THEME.card} p-6 border-l-4 border-cyan-500`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 mb-4">
            <Eye size={20} />
          </span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">Our Vision</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed dark:text-slate-300">
            A future where finding reliable help is as easy as ordering food — with dignity,
            fair pay and steady livelihoods for millions of skilled service professionals
            across every city in India.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">How Suvidha1 works</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Book a verified professional in 4 simple steps.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <div key={step} className={`${THEME.card} p-5 relative overflow-hidden`}>
              <span className="absolute top-3 right-4 text-5xl font-black text-gray-50 select-none">{step}</span>
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold mb-3">{i + 1}</div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-50">{title}</h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed dark:text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Values ── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">What we stand for</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">The principles that guide every decision we make.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`${THEME.card} p-5 flex gap-4`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-50">{title}</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed dark:text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">Services we offer</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">16+ categories, all available in one place.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm dark:border-slate-700">
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">Frequently asked questions</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Can't find an answer? Email us at support@suvidha1.app</p>
        <div className={`${THEME.card} mt-4 divide-y divide-gray-100`}>
          {FAQS.map((faq, i) => (
            <div key={i} className="p-4 sm:p-5">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-left group">
                <span className={`text-sm font-semibold transition ${openFaq === i ? "text-indigo-700" : "text-gray-900 group-hover:text-indigo-600"}`}>
                  {faq.q}
                </span>
                <ChevronDown size={18}
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-indigo-600" : ""}`} />
              </button>
              {openFaq === i && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3 dark:text-slate-300">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact & Socials ── */}
      <section className={`${THEME.card} grid grid-cols-1 gap-8 p-6 sm:p-8 sm:grid-cols-2`}>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">Get in touch</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Our support team is available every day, 8 AM – 10 PM IST.</p>
          <div className="mt-5 flex flex-col gap-4">
            <a href="mailto:support@suvidha1.app"
              className="flex items-center gap-3 group text-sm text-gray-700 hover:text-indigo-600 transition dark:text-slate-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition">
                <Mail size={16} />
              </span>
              <div>
                <p className="font-semibold text-sm">Email Support</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">support@suvidha1.app</p>
              </div>
            </a>
            <a href="tel:+911140000000"
              className="flex items-center gap-3 group text-sm text-gray-700 hover:text-indigo-600 transition dark:text-slate-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition">
                <Phone size={16} />
              </span>
              <div>
                <p className="font-semibold text-sm">Call Us</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">+91 11 4000 0000 (Mon–Sun, 8AM–10PM)</p>
              </div>
            </a>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <MapPin size={16} />
              </span>
              <div>
                <p className="font-semibold text-sm">Head Office</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Suvidha1 Technologies Pvt. Ltd.<br />Cyber Hub, DLF Phase 2, Gurugram, Haryana – 122002</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">Follow us</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Stay updated with offers, tips and community stories.</p>
          <div className="mt-5 flex gap-3">
            {SOCIALS.map(({ href, label, color }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition ${color}`}>
                <ExternalLink size={16} />
              </a>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-5">
            <p className="text-sm font-bold text-gray-900 dark:text-slate-50">Become a professional on Suvidha1</p>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed dark:text-slate-400">
              Join 10,000+ skilled professionals earning steady income through our platform.
              Free to join, instant approvals for verified workers.
            </p>
            <a href="mailto:partners@suvidha1.app"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition">
              Apply Now <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Legal links ── */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-slate-500">
        <Link to="/terms"   className="hover:text-indigo-600 hover:underline transition">Terms & Conditions</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:text-indigo-600 hover:underline transition">Privacy Policy</Link>
        <span>·</span>
        <span>© {new Date().getFullYear()} Suvidha1 Technologies Pvt. Ltd. All rights reserved.</span>
      </div>
    </div>
  );
};

export default About;
