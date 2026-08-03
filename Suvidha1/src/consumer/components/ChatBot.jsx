import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles,
  RotateCcw,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Suvidha1 AI Assistant — floating chatbot powered by the Anthropic API
   (claude-sonnet-4-6, streaming-ready).

   ▸ Knows everything about the Suvidha1 app (18 services, booking flow,
     pricing, settings, nearby map, profile setup, etc.)
   ▸ Guides new users through the app step-by-step
   ▸ Suggests related pages / actions inline
   ▸ Fully responsive — floats bottom-right, collapsible on mobile

   No extra npm packages needed — uses the Anthropic /v1/messages endpoint
   directly via fetch (same pattern the platform uses for AI-powered artifacts).
───────────────────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are Suvidha1 Assistant — a friendly, helpful AI built into the Suvidha1 service marketplace app.

## About Suvidha1
Suvidha1 connects consumers in India with verified, background-checked local service professionals. It operates across Delhi, Gurugram, Noida, and is expanding to Mumbai, Pune, Bengaluru, Hyderabad, Chennai, Kolkata and Ahmedabad.

## Services available (18 categories)
Electrician, Plumber, Carpenter, Welder, Painter, Cleaning Staff, AC Repair, Mechanic, Mason, Driver, Gardener, CCTV Installer, RO Technician, Appliance Repair, Pest Control, Movers & Packers, Home Tutor, Beautician.

## How the app works
1. **Sign up** → verify email with OTP → set username → complete profile
2. **Find a professional**: use the search bar (top of every page) or browse Services → pick a category → see professionals with ratings, prices, availability.
3. **Booking**: open a worker's profile → click "Book service" → they confirm → service happens.
4. **Track bookings**: Dashboard → "Recent requests" section shows status (pending / confirmed / completed / cancelled).
5. **Nearby map**: Dashboard and WorkerList pages have an interactive map that shows all available professionals as colour-coded pins — green = available now, amber = free today, grey = this week, red = unavailable. Click a pin to see the worker's card and a "View profile" link.
6. **Settings**: Edit Profile, Change Password, Manage Location (GPS or manual), Notification preferences, Privacy Policy, Terms & Conditions, Delete account.

## Pricing
Each professional sets either an hourly rate (shown as ₹X/hr) or a fixed project price. Starting prices vary by category (Electrician from ₹199/hr, AC Repair from ₹399 fixed, etc.).

## Navigation guide
- **Dashboard** (/dashboard) — overview, search, featured services, popular workers, recent requests, nearby map
- **Services** (/services) — browse all 18 categories
- **ServiceDetails** (/services/:category) — category overview + top professionals
- **WorkerList** (/services/:category/workers) — full list with search + filters + sorting + map
- **WorkerProfile** (/workers/:id) — full profile, portfolio, reviews, map, booking
- **About** (/about) — company info, mission, FAQ, contact
- **Settings** (/settings) — profile, password, location, notifications

## Your behaviour
- Be warm, concise, and friendly. Use simple English (and Hindi words occasionally if it feels natural).
- Directly answer what the user needs; don't pad with unnecessary caveats.
- When relevant, tell the user exactly where to go (e.g. "Go to Dashboard → search bar → type 'plumber'").
- If a user is new, gently walk them through signup → verify email → complete profile → first booking.
- For complaints or refund requests, acknowledge empathetically and advise contacting support@suvidha1.app or calling +91 11 4000 0000.
- Keep responses under 120 words unless a step-by-step walkthrough is genuinely needed.
- Never make up specific worker names, prices or availability — direct users to search the app.`;

const QUICK_PROMPTS = [
  "How do I book a service?",
  "What services are available?",
  "How do I find workers near me?",
  "How do I complete my profile?",
  "How do I track my booking?",
  "How do I change my password?",
];

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2 w-2 rounded-full bg-indigo-400"
        style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
      />
    ))}
    <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
  </div>
);

const ChatBubble = ({ msg }) => {
  const isBot = msg.role === "assistant";
  return (
    <div className={`flex gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isBot ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" : "bg-pink-500 text-white"}`}>
        {isBot ? <Bot size={14} /> : <User size={14} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isBot
            ? "rounded-tl-sm bg-white text-gray-800 shadow-sm"
            : "rounded-tr-sm bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
};

const ChatBot = () => {
  const [open, setOpen]         = useState(false);
  const [minimized, setMin]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your Suvidha1 assistant. I can help you find services, book professionals, or navigate the app. What do you need?",
    },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setInput("");

    const userMsg = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data?.content?.[0]?.text || "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment, or contact support@suvidha1.app.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([
      {
        role: "assistant",
        content: "👋 Hi again! How can I help you with Suvidha1?",
      },
    ]);
    setInput("");
  };

  /* ── Floating trigger button ──────────────────────────────────── */
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chat assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
      >
        <MessageCircle size={24} />
        {/* Pulse ring */}
        <span className="absolute h-full w-full animate-ping rounded-full bg-indigo-500 opacity-30" />
      </button>
    );
  }

  /* ── Chat window ──────────────────────────────────────────────── */
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-3xl bg-gray-50 shadow-2xl transition-all duration-300 ${
        minimized ? "h-14 w-72" : "h-[540px] w-80 sm:w-96"
      }`}
      style={{ border: "1px solid rgba(99,102,241,0.2)" }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Suvidha1 Assistant</p>
          {!minimized && <p className="text-[11px] text-white/70">Powered by Claude AI</p>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={reset} title="Reset chat" className="rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white">
            <RotateCcw size={14} />
          </button>
          <button onClick={() => setMin((m) => !m)} title={minimized ? "Expand" : "Minimise"} className="rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white">
            {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button onClick={() => setOpen(false)} title="Close" className="rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white">
            <X size={14} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <ChatBubble key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-2 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts (shown when only the greeting is there) */}
          {messages.length === 1 && (
            <div className="shrink-0 px-4 pb-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Quick questions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Suvidha1…"
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                style={{ maxHeight: 100 }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow transition-transform active:scale-95 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
