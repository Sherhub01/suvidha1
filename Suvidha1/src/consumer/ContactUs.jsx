import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, Loader2, ChevronDown } from "lucide-react";

const FAQS = [
  { q: "How quickly will I get a response?", a: "Our support team responds to all queries within 2 business hours during operating hours (8 AM – 10 PM IST, 7 days a week)." },
  { q: "How do I report an issue with a professional?", a: "Use the in-app dispute centre from your Bookings page. For urgent issues, call our helpline directly at +91 11 4000 0000." },
  { q: "Can I partner with Suvidha1 as a business?", a: "Yes! Email us at partners@suvidha1.app with your business details and we'll get back within 24 hours." },
  { q: "Where can I send legal notices?", a: "Legal notices should be sent to legal@suvidha1.app or by post to our registered office address below." },
];

const CONTACT_ITEMS = [
  {
    icon: Phone, label: "Call Us", value: "+91 11 4000 0000",
    sub: "Mon–Sun, 8 AM – 10 PM IST", href: "tel:+911140000000",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Mail, label: "Email Support", value: "support@suvidha1.app",
    sub: "Response within 2 hours", href: "mailto:support@suvidha1.app",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: MessageSquare, label: "Business / Partnerships", value: "partners@suvidha1.app",
    sub: "For B2B and franchise enquiries", href: "mailto:partners@suvidha1.app",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: MapPin, label: "Head Office", value: "Cyber Hub, DLF Phase 2",
    sub: "Gurugram, Haryana – 122002, India", href: null,
    color: "bg-amber-50 text-amber-600",
  },
];

export default function ContactUs() {
  const [form, setForm]       = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 20) e.message = "Please provide more detail (min 20 characters)";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate submission — replace with real API call when backend endpoint exists
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none";

  return (
    <div className="flex flex-col gap-10 pb-16">

      {/* ── Hero ── */}
      <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#312E81_0%,#4F46E5_30%,#7C3AED_60%,#06B6D4_100%)] p-8 sm:p-12">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 mb-4">
            <MessageSquare size={12} /> We're here to help
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Contact Suvidha1</h1>
          <p className="mt-3 text-base text-white/75 leading-relaxed">
            Have a question, issue or partnership enquiry? Our support team is available
            7 days a week, 8 AM – 10 PM IST. We typically respond within 2 hours.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
            <Clock size={14} /> Mon–Sun · 8 AM – 10 PM IST · Response in &lt; 2 hours
          </div>
        </div>
      </section>

      {/* ── Contact cards + form ── */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-5">

        {/* Contact info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {CONTACT_ITEMS.map(({ icon: Icon, label, value, sub, href, color }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex gap-4 items-start">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                {href
                  ? <a href={href} className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition">{value}</a>
                  : <p className="text-sm font-bold text-gray-900">{value}</p>
                }
                <p className="mt-0.5 text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}

          {/* Map embed */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 220 }}>
            <iframe
              title="Suvidha1 Office Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.08,28.48,77.11,28.50&layer=mapnik&marker=28.4949,77.0939"
              style={{ width: "100%", height: "100%", border: 0 }}
              loading="lazy"
            />
          </div>
          <p className="text-xs text-gray-400 -mt-2 text-center">
            Cyber Hub, DLF Phase 2, Gurugram, Haryana
          </p>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Message Sent!</h2>
              <p className="text-sm text-gray-500 max-w-xs">
                Thanks for reaching out. Our team will get back to you at <strong>{form.email}</strong> within 2 hours.
              </p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition">
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900">Send us a message</h2>
              <p className="mt-1 text-sm text-gray-500">Fill the form and we'll reply to your email shortly.</p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name *</label>
                    <input value={form.name} onChange={set("name")} placeholder="Your full name" className={inp} />
                    {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email Address *</label>
                    <input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" className={inp} />
                    {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone (optional)</label>
                    <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" className={inp} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Subject *</label>
                    <select value={form.subject} onChange={set("subject")} className={inp}>
                      <option value="">Select a topic</option>
                      <option value="Booking Issue">Booking Issue</option>
                      <option value="Payment / Refund">Payment / Refund</option>
                      <option value="Professional Complaint">Professional Complaint</option>
                      <option value="Account Issue">Account Issue</option>
                      <option value="Partnership / Business">Partnership / Business</option>
                      <option value="Technical Problem">Technical Problem</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.subject && <p className="mt-1 text-xs text-rose-500">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Message *</label>
                  <textarea rows={5} value={form.message} onChange={set("message")}
                    placeholder="Describe your issue or question in detail…"
                    className={`${inp} resize-none`} />
                  {errors.message && <p className="mt-1 text-xs text-rose-500">{errors.message}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-60">
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                    : <><Send size={15} /> Send Message</>}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900">Common Questions</h2>
        <p className="mt-1 text-sm text-gray-500">Quick answers before you reach out.</p>
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-4 sm:p-5">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-left group">
                <span className={`text-sm font-semibold transition ${openFaq === i ? "text-indigo-700" : "text-gray-900 group-hover:text-indigo-600"}`}>
                  {faq.q}
                </span>
                <ChevronDown size={17} className={`shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-indigo-600" : ""}`} />
              </button>
              {openFaq === i && <p className="mt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
