import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { T } from "./theme";

const QUICK = [
  "How do I accept a booking?",
  "How do I mark a job complete?",
  "How do I navigate to a customer?",
  "How do I update my profile?",
  "When will I get paid?",
  "How do I improve my rating?",
];

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0,1,2].map(i => (
      <span key={i} className="h-2 w-2 rounded-full"
        style={{ background: T.primary, animation: `swave 1.2s ease-in-out ${i*0.2}s infinite` }} />
    ))}
    <style>{`@keyframes swave{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
  </div>
);

function MsgText({ text }) {
  return (
    <span>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i}>{p.slice(2,-2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

const Bubble = ({ msg }) => {
  const isBot = msg.role === "assistant";
  return (
    <div className={`flex gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: isBot ? `linear-gradient(135deg,${T.primary},${T.secondary})` : T.info }}>
        {isBot ? <Bot size={13} /> : <User size={13} />}
      </div>
      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${isBot ? "rounded-tl-sm" : "rounded-tr-sm"}`}
        style={isBot
          ? { background: "rgba(255,255,255,0.07)", color: T.text, border: `1px solid ${T.cardBorder}` }
          : { background: `linear-gradient(135deg,${T.primary},${T.secondary})`, color: "#fff" }}>
        <MsgText text={msg.content} />
      </div>
    </div>
  );
};

export default function StaffChatBot() {
  const [open,    setOpen]    = useState(false);
  const [mini,    setMini]    = useState(false);
  const [msgs,    setMsgs]    = useState([{ role: "assistant", content: "👋 Hi! I'm your Suvidha1 AI assistant. I can help you manage bookings, navigate to customers, track earnings, and more. What do you need?" }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => { if (open && !mini) setTimeout(() => inputRef.current?.focus(), 120); }, [open, mini]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    const history = [...msgs, { role: "user", content: q }];
    setMsgs(history);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ai/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "AI error");
      setMsgs(p => [...p, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMsgs(p => [...p, { role: "assistant", content: `⚠️ ${err.message === "Failed to fetch" ? "Could not connect to server. Please make sure the backend is running." : err.message}` }]);
    } finally { setLoading(false); }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const reset = () => { setMsgs([{ role: "assistant", content: "👋 Hi again! How can I help you today?" }]); setInput(""); };

  if (!open) return (
    <button onClick={() => setOpen(true)} aria-label="Open assistant"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
      style={{ background: `linear-gradient(135deg,${T.primary},${T.secondary})` }}>
      <MessageCircle size={22} />
      <span className="absolute h-full w-full animate-ping rounded-full opacity-25" style={{ background: T.primary }} />
    </button>
  );

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 ${mini ? "h-14 w-72" : "h-[560px] w-80 sm:w-96"}`}
      style={{ background: "#0F172A", border: `1px solid ${T.cardBorder}` }}>

      <div className="flex shrink-0 items-center gap-3 px-4 py-3"
        style={{ background: `linear-gradient(135deg,${T.primary},${T.secondary})` }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Suvidha1 AI</p>
          {!mini && <p className="text-[11px] text-white/70">Professional Assistant · GPT-4o</p>}
        </div>
        <div className="flex gap-1">
          <button onClick={reset} title="Reset" className="rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white"><RotateCcw size={13} /></button>
          <button onClick={() => setMini(m => !m)} className="rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white">
            {mini ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white"><X size={13} /></button>
        </div>
      </div>

      {!mini && (
        <>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {msgs.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: `linear-gradient(135deg,${T.primary},${T.secondary})` }}>
                  <Bot size={13} />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-3.5 py-2"
                  style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${T.cardBorder}` }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {msgs.length === 1 && (
            <div className="shrink-0 px-4 pb-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: T.muted }}>Quick questions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK.map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${T.cardBorder}`, color: T.text }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="shrink-0 px-3 py-3" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
            <div className="flex items-end gap-2">
              <textarea ref={inputRef} rows={1} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                placeholder="Ask anything about your work…"
                className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2"
                style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${T.cardBorder}`, color: T.heading, maxHeight: 100 }} />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow transition active:scale-95 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg,${T.primary},${T.secondary})` }}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
