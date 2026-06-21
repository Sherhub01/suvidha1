import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Sparkles, RotateCcw, Loader2 } from "lucide-react";

const QUICK = [
  "How do I book a service?",
  "What services are available?",
  "How do I cancel a booking?",
  "How do I rate a professional?",
  "Find electricians near me",
  "What is the pricing?",
];

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0,1,2].map(i => (
      <span key={i} className="h-2 w-2 rounded-full bg-indigo-400"
        style={{ animation: `cwave 1.2s ease-in-out ${i*0.2}s infinite` }} />
    ))}
    <style>{`@keyframes cwave{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
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
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isBot ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-pink-500"} text-white`}>
        {isBot ? <Bot size={13} /> : <User size={13} />}
      </div>
      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${isBot ? "rounded-tl-sm bg-white text-gray-800 shadow-sm" : "rounded-tr-sm bg-gradient-to-br from-indigo-600 to-purple-600 text-white"}`}>
        <MsgText text={msg.content} />
      </div>
    </div>
  );
};

export default function ChatBot() {
  const [open,    setOpen]    = useState(false);
  const [mini,    setMini]    = useState(false);
  const [msgs,    setMsgs]    = useState([{ role: "assistant", content: "👋 Hi! I'm your Suvidha1 AI assistant. I can help you find services, book professionals, track bookings, or answer any question. What do you need?" }]);
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
      const res = await fetch("http://localhost:5000/api/ai/consumer", {
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
  const reset = () => { setMsgs([{ role: "assistant", content: "👋 Hi again! How can I help you with Suvidha1?" }]); setInput(""); };

  if (!open) return (
    <button onClick={() => setOpen(true)} aria-label="Open AI assistant"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95">
      <MessageCircle size={22} />
      <span className="absolute h-full w-full animate-ping rounded-full bg-indigo-500 opacity-25" />
    </button>
  );

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-3xl bg-gray-50 shadow-2xl transition-all duration-300 ${mini ? "h-14 w-72" : "h-[560px] w-80 sm:w-96"}`}
      style={{ border: "1px solid rgba(99,102,241,0.2)" }}>

      <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Suvidha1 AI</p>
          {!mini && <p className="text-[11px] text-white/70">Consumer Assistant · GPT-4o</p>}
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
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <Bot size={13} />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-2 shadow-sm"><TypingDots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {msgs.length === 1 && (
            <div className="shrink-0 px-4 pb-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Quick questions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK.map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea ref={inputRef} rows={1} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                placeholder="Ask me anything about Suvidha1…"
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                style={{ maxHeight: 100 }} />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow transition active:scale-95 disabled:opacity-40">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
