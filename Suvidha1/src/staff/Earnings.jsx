import { useState } from "react";
import { ArrowUpRight, History, Download, X, Check, IndianRupee, TrendingUp, Calendar, Clock } from "lucide-react";

/* ── consumer-identical primitives ──────────────────────────────────────────*/
const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none";

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-500">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ── data ────────────────────────────────────────────────────────────────── */
const BARS  = [55, 70, 45, 85, 60, 95, 75];
const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAILY = ["₹3,200", "₹4,100", "₹2,800", "₹5,300", "₹3,700", "₹5,950", "₹4,600"];

const WITHDRAWALS = [
  { id: "w1", date: "June 15", amount: "₹15,000", method: "UPI",  status: "Done",    upi: "prof@okaxis",  ref: "TXN2406151" },
  { id: "w2", date: "June 8",  amount: "₹12,500", method: "Bank", status: "Done",    bank: "SBI ••4821",  ref: "TXN2406081" },
  { id: "w3", date: "June 1",  amount: "₹10,000", method: "UPI",  status: "Done",    upi: "prof@okaxis",  ref: "TXN2406011" },
  { id: "w4", date: "May 24",  amount: "₹8,000",  method: "UPI",  status: "Pending", upi: "prof@okaxis",  ref: "TXN2405241" },
];

const STATS = [
  { label: "Today",      value: "₹4,280",  icon: Clock,        detail: "4 jobs completed today." },
  { label: "This Week",  value: "₹28,450", icon: TrendingUp,   detail: "18 jobs · highest on Saturday." },
  { label: "This Month", value: "₹96,200", icon: IndianRupee,  detail: "72 jobs · ↑ 14% vs last month." },
];

/* ── Withdraw Modal ──────────────────────────────────────────────────────── */
function WithdrawModal({ balance, onClose }) {
  const [amount, setAmount]  = useState("");
  const [method, setMethod]  = useState("upi");
  const [done, setDone]      = useState(false);

  if (done) return (
    <Modal title="Withdrawal Requested" onClose={onClose}>
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <Check size={24} className="text-emerald-600" />
        </div>
        <p className="text-base font-bold text-slate-800">Request submitted!</p>
        <p className="text-sm text-slate-500">₹{amount} will be credited within 1–2 business days.</p>
        <button onClick={onClose} className="mt-2 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">Done</button>
      </div>
    </Modal>
  );

  return (
    <Modal title="Withdraw Funds" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Available balance</span>
          <span className="text-base font-bold text-slate-800">{balance}</span>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Amount to withdraw (₹)</label>
          <input className={inp} type="number" placeholder="e.g. 5000" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Withdraw to</label>
          <div className="flex gap-2">
            {[["upi", "UPI / GPay"], ["bank", "Bank Account"]].map(([val, lbl]) => (
              <button key={val} type="button" onClick={() => setMethod(val)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${method === val ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => amount && setDone(true)} disabled={!amount}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition disabled:opacity-50">
          <ArrowUpRight size={15} /> Request Withdrawal
        </button>
      </div>
    </Modal>
  );
}

/* ── History Modal ───────────────────────────────────────────────────────── */
function HistoryModal({ onClose }) {
  return (
    <Modal title="Earnings History" onClose={onClose}>
      <div className="space-y-2">
        {DAYS.map((day, i) => (
          <div key={day} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                <Calendar size={15} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{day}</p>
                <p className="text-xs text-slate-400">This week</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-800">{DAILY[i]}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ── Stat Detail Modal ───────────────────────────────────────────────────── */
function StatModal({ stat, onClose }) {
  const Icon = stat.icon;
  return (
    <Modal title={stat.label} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
          <Icon size={28} className="text-amber-600" />
        </div>
        <p className="text-4xl font-extrabold text-slate-900">{stat.value}</p>
        <p className="text-sm text-slate-500">{stat.detail}</p>
        <button onClick={onClose} className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Close</button>
      </div>
    </Modal>
  );
}

/* ── Withdrawal Detail Modal ─────────────────────────────────────────────── */
function WithdrawalModal({ w, onClose }) {
  return (
    <Modal title="Withdrawal Details" onClose={onClose}>
      <div className="space-y-3">
        {[
          ["Date",      w.date],
          ["Amount",    w.amount],
          ["Method",    w.method],
          ["Account",   w.upi || w.bank || "—"],
          ["Reference", w.ref],
          ["Status",    w.status],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
            <span className={`text-sm font-semibold ${label === "Status" ? (value === "Done" ? "text-emerald-600" : "text-amber-600") : "text-slate-800"}`}>{value}</span>
          </div>
        ))}
        <button onClick={onClose} className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Close</button>
      </div>
    </Modal>
  );
}

/* ── Statement Modal ─────────────────────────────────────────────────────── */
function StatementModal({ onClose }) {
  const [done, setDone] = useState(false);
  return (
    <Modal title="Download Statement" onClose={onClose}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <Check size={24} className="text-emerald-600" />
          </div>
          <p className="text-base font-bold text-slate-800">Statement ready!</p>
          <p className="text-sm text-slate-500">Your earnings statement has been generated.</p>
          <button onClick={onClose} className="mt-2 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">Done</button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Select a period for your earnings statement.</p>
          {[["This Month", "June 2026"], ["Last Month", "May 2026"], ["Last 3 Months", "Apr – Jun 2026"]].map(([lbl, sub]) => (
            <button key={lbl} onClick={() => setDone(true)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50 hover:border-slate-200 transition">
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">{lbl}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
              <Download size={15} className="text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ── Main Earnings page ──────────────────────────────────────────────────── */
export default function Earnings() {
  const [modal, setModal]       = useState(null); // "withdraw"|"history"|"statement"|{stat}|{withdrawal}
  const [activeBar, setActiveBar] = useState(null);

  return (
    <div className="mx-auto max-w-4xl pb-16">

      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="mt-1 text-sm text-slate-500">Track your income, payouts and withdrawal history.</p>
        </div>
        <button onClick={() => setModal("statement")}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition">
          <Download size={13} /> Statement
        </button>
      </div>

      {/* wallet card — same gradient as before but white-card styled */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-6"
        style={{ background: "linear-gradient(135deg,#0F172A 0%,#881337 50%,#EC4899 100%)" }}>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5" />
        <div className="absolute -right-2 bottom-0 h-20 w-20 rounded-full bg-white/5" />
        <p className="text-sm font-medium text-white/60 relative">Wallet Balance</p>
        <p className="text-4xl font-extrabold text-white relative mt-1 mb-5">₹12,840</p>
        <div className="flex gap-3 relative">
          <button onClick={() => setModal("withdraw")}
            className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition shadow-md">
            <ArrowUpRight size={15} /> Withdraw
          </button>
          <button onClick={() => setModal("history")}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition">
            <History size={15} /> History
          </button>
        </div>
      </div>

      {/* quick stat cards — clickable */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        {STATS.map(stat => {
          const Icon = stat.icon;
          return (
            <button key={stat.label} onClick={() => setModal({ type: "stat", stat })}
              className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm hover:shadow-md hover:border-amber-200 transition group cursor-pointer">
              <div className="flex items-center justify-center h-10 w-10 mx-auto mb-3 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition">
                <Icon size={18} className="text-amber-600" />
              </div>
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="mt-1.5 text-[11px] text-amber-500 font-medium opacity-0 group-hover:opacity-100 transition">Tap for details →</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* bar chart — clickable bars */}
        <Card>
          <h2 className="text-base font-semibold text-slate-800 mb-4">Weekly Earnings</h2>
          <div className="flex items-end gap-2 h-28 px-2">
            {BARS.map((h, i) => (
              <button key={i} onClick={() => setModal({ type: "bar", day: DAYS[i], amount: DAILY[i] })}
                className="flex-1 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                style={{ height: `${h}%`, background: activeBar === i ? "#f59e0b" : i === 5 ? "#EC4899" : "#EC489940" }}
                onMouseEnter={() => setActiveBar(i)} onMouseLeave={() => setActiveBar(null)}
                title={`${DAYS[i]}: ${DAILY[i]}`}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            {DAYS.map((d, i) => (
              <button key={d} onClick={() => setModal({ type: "bar", day: d, amount: DAILY[i] })}
                className="flex-1 text-center text-[10px] text-slate-400 hover:text-slate-700 transition">{d}</button>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-500">This week</span>
            <span className="text-base font-bold text-slate-900">₹28,450</span>
          </div>
        </Card>

        {/* withdrawal history — clickable rows */}
        <Card>
          <h2 className="text-base font-semibold text-slate-800 mb-4">Withdrawal History</h2>
          <div className="space-y-1">
            {/* table header */}
            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-slate-100">
              {["Date", "Amount", "Via", "Status"].map(h => (
                <p key={h} className="text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</p>
              ))}
            </div>
            {WITHDRAWALS.map(w => (
              <button key={w.id} onClick={() => setModal({ type: "withdrawal", w })}
                className="grid grid-cols-4 gap-2 w-full py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-xl px-1 transition group text-left">
                <span className="text-sm text-slate-600">{w.date}</span>
                <span className="text-sm font-semibold text-slate-800">{w.amount}</span>
                <span className="text-sm text-slate-500">{w.method}</span>
                <span className={`inline-flex items-center justify-self-start rounded-lg px-2.5 py-0.5 text-xs font-semibold ${
                  w.status === "Done" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                }`}>{w.status}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ── modals ── */}
      {modal === "withdraw"  && <WithdrawModal balance="₹12,840" onClose={() => setModal(null)} />}
      {modal === "history"   && <HistoryModal onClose={() => setModal(null)} />}
      {modal === "statement" && <StatementModal onClose={() => setModal(null)} />}
      {modal?.type === "stat" && <StatModal stat={modal.stat} onClose={() => setModal(null)} />}
      {modal?.type === "withdrawal" && <WithdrawalModal w={modal.w} onClose={() => setModal(null)} />}
      {modal?.type === "bar" && (
        <Modal title={`${modal.day} Earnings`} onClose={() => setModal(null)}>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
              <TrendingUp size={28} className="text-amber-600" />
            </div>
            <p className="text-4xl font-extrabold text-slate-900">{modal.amount}</p>
            <p className="text-sm text-slate-500">Total earnings on {modal.day}</p>
            <button onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
