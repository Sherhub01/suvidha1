import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Clock,
  Users,
} from "lucide-react";
import { THEME, SERVICES } from "../api";

const FAQS = [
  {
    q: "How are professionals verified on Suvidha1?",
    a: "Every professional goes through identity verification, address checks and a background screening before they can list their services. We also continuously monitor ratings and reviews.",
  },
  {
    q: "How do I book a service?",
    a: "Search for the service you need, pick a professional based on ratings, price and availability, and tap 'Book service' on their profile. They'll confirm the booking shortly after.",
  },
  {
    q: "What if I'm not satisfied with the work?",
    a: "You can raise an issue directly from your booking and our support team will help arrange a re-visit, refund or replacement professional depending on the situation.",
  },
  {
    q: "Is pricing fixed or negotiable?",
    a: "Each professional lists either an hourly rate or a fixed price for common jobs. Any additional work beyond the original scope is quoted separately before they proceed.",
  },
  {
    q: "Which cities does Suvidha1 operate in?",
    a: "We currently operate across Delhi NCR (Delhi, Gurugram, Noida) and are expanding to Mumbai, Pune, Bengaluru, Hyderabad, Chennai, Kolkata and Ahmedabad.",
  },
];

const STATS = [
  { icon: Users, label: "Verified professionals", value: "10,000+" },
  { icon: ShieldCheck, label: "Background-checked", value: "100%" },
  { icon: Clock, label: "Avg. response time", value: "< 30 min" },
];

const SOCIALS = [
  { href: "https://facebook.com",  label: "Facebook",  icon: ExternalLink },
  { href: "https://instagram.com", label: "Instagram", icon: ExternalLink },
  { href: "https://twitter.com",   label: "Twitter",   icon: ExternalLink },
  { href: "https://linkedin.com",  label: "LinkedIn",  icon: ExternalLink },
];

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#312E81_0%,#4F46E5_30%,#7C3AED_60%,#06B6D4_100%)] p-6 sm:p-10">
        <h1 className="max-w-2xl text-2xl font-extrabold text-white sm:text-3xl">
          Suvidha1 connects you with trusted local professionals - fast.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/75">
          From electricians and plumbers to home tutors and beauticians, Suvidha1 makes it
          simple to find verified, rated help for everyday tasks - all in one app.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className={`${THEME.glassCard} flex items-center gap-3 p-4`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-white/70">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={`${THEME.card} p-6`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Target size={20} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Our mission</h2>
          <p className="mt-2 text-sm text-gray-600">
            To make trusted home and personal services accessible to every household, at fair
            prices, with zero hassle - by putting verified professionals just a search away.
          </p>
        </div>
        <div className={`${THEME.card} p-6`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <Eye size={20} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Our vision</h2>
          <p className="mt-2 text-sm text-gray-600">
            A future where finding reliable help is as easy as ordering food - with dignity,
            fair pay and steady work for service professionals across India.
          </p>
        </div>
      </section>

      {/* Services offered */}
      <section>
        <h2 className="text-xl font-bold text-gray-900">Services we offer</h2>
        <p className="mt-1 text-sm text-gray-500">All available in one place, just a tap away.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-bold text-gray-900">Frequently asked questions</h2>
        <div className={`${THEME.card} mt-4 divide-y divide-gray-100`}>
          {FAQS.map((faq, i) => (
            <div key={i} className="p-4 sm:p-5">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-gray-400 transition-transform ${openFaq === i ? "rotate-180 text-indigo-600" : ""}`}
                />
              </button>
              {openFaq === i && <p className="mt-3 text-sm text-gray-600">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Contact & socials */}
      <section className={`${THEME.card} grid grid-cols-1 gap-6 p-6 sm:grid-cols-2`}>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Get in touch</h2>
          <p className="mt-1 text-sm text-gray-500">Our support team is available every day, 8am - 10pm.</p>
          <div className="mt-4 flex flex-col gap-3">
            <a href="mailto:support@suvidha1.app" className="flex items-center gap-3 text-sm text-gray-700 hover:text-indigo-600">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Mail size={16} /></span>
              support@suvidha1.app
            </a>
            <a href="tel:+911140000000" className="flex items-center gap-3 text-sm text-gray-700 hover:text-indigo-600">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Phone size={16} /></span>
              +91 11 4000 0000
            </a>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><MapPin size={16} /></span>
              Suvidha1 HQ, Cyber Hub, DLF Phase 2, Gurugram, Haryana
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Follow us</h2>
          <p className="mt-1 text-sm text-gray-500">Updates, offers and stories from the Suvidha1 community.</p>
          <div className="mt-4 flex gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
