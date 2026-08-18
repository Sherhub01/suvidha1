import { useCallback, useState } from "react";
import {
  ArrowUpRight, History, IndianRupee, TrendingUp, Clock, Wallet, Info,
} from "lucide-react";
import {
  Card, Button, Modal, Input, Select, Alert, Badge, SectionHeader,
  StatCard, EmptyState, LoadingState, Table, TR, TD,
} from "../../../shared/ui/index";
import { earningsApi } from "../../../shared/services/api";
import { errorMessage } from "../../../shared/services/http";
import useApiData from "../../../shared/hooks/useApiData";

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Seven-day bar chart built from the API's daily aggregate. */
function EarningsChart({ daily = [] }) {
  if (!daily.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No completed jobs in the last 7 days.
      </p>
    );
  }

  const max = Math.max(...daily.map((d) => d.net), 1);

  return (
    <div className="flex h-40 items-end justify-between gap-2 pt-2">
      {daily.map((d) => {
        const day = new Date(`${d.date}T00:00:00`);
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold tabular-nums text-slate-500">
              {d.net > 0 ? inr(d.net) : ""}
            </span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-500"
              style={{ height: `${Math.max(4, (d.net / max) * 100)}%` }}
              title={`${d.jobs} job${d.jobs === 1 ? "" : "s"} · ${inr(d.net)}`}
            />
            <span className="text-[10px] text-slate-400">{DAY_LABELS[day.getDay()]}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Withdrawal request. The available balance is enforced server-side too. */
function WithdrawDialog({ open, available, minimum, onClose, onDone }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const value = Number(amount);
    if (!value || value < minimum) {
      setError(`The minimum withdrawal is ${inr(minimum)}.`);
      return;
    }
    if (value > available) {
      setError(`You can withdraw up to ${inr(available)} right now.`);
      return;
    }

    setSaving(true);
    try {
      const result = await earningsApi.requestPayout({ amount: value, method });
      setMessage(result.message);
      onDone?.();
    } catch (err) {
      setError(errorMessage(err, "Could not request the withdrawal."));
    } finally {
      setSaving(false);
    }
  };

  const close = () => {
    setAmount("");
    setError("");
    setMessage("");
    onClose?.();
  };

  if (message) {
    return (
      <Modal open={open} onClose={close} size="sm" title="Withdrawal requested">
        <Alert tone="success">{message}</Alert>
        <Button fullWidth className="mt-4" onClick={close}>
          Done
        </Button>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} size="sm" title="Withdraw earnings">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-500">Available</span>
          <span className="text-lg font-bold text-slate-900">{inr(available)}</span>
        </div>

        <Input
          label="Amount"
          type="number"
          min={minimum}
          max={available}
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={String(minimum)}
          hint={`Minimum ${inr(minimum)}. Payouts are processed within 1–2 business days.`}
          required
        />

        <Select
          label="Pay out to"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={[
            { value: "upi", label: "UPI" },
            { value: "bank", label: "Bank account" },
          ]}
          hint="Add or change these details in Settings."
        />

        <Button type="submit" fullWidth loading={saving} disabled={available < minimum}>
          Request withdrawal
        </Button>
      </form>
    </Modal>
  );
}

export default function Earnings() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const fetchSummary = useCallback(({ signal }) => earningsApi.summary({ signal }), []);
  const fetchHistory = useCallback(({ signal }) => earningsApi.history({ limit: 20 }, { signal }), []);
  const fetchPayouts = useCallback(({ signal }) => earningsApi.payouts({ signal }), []);

  const summary = useApiData(fetchSummary, { initial: null });
  const history = useApiData(fetchHistory, { initial: null });
  const payouts = useApiData(fetchPayouts, { initial: null });

  const refreshAll = () => {
    summary.reload();
    history.reload();
    payouts.reload();
  };

  if (summary.loading && !summary.data) return <LoadingState label="Loading your earnings…" />;
  if (summary.error) return <Alert tone="error">{summary.error}</Alert>;

  const e = summary.data?.earnings;
  const minimum = summary.data?.minWithdrawal || 500;

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Earnings"
        subtitle="Calculated from your completed, paid jobs"
        action={
          <Button
            icon={ArrowUpRight}
            onClick={() => setWithdrawOpen(true)}
            disabled={!e || e.available < minimum}
          >
            Withdraw
          </Button>
        }
      />

      {/* Balance */}
      <Card className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
        <p className="text-xs font-medium text-white/70">Available to withdraw</p>
        <p className="mt-1 text-3xl font-bold">{inr(e?.available)}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">
          <span>
            Lifetime earned <b className="text-white">{inr(e?.allTime)}</b>
          </span>
          <span>
            Already withdrawn <b className="text-white">{inr(e?.withdrawn)}</b>
          </span>
          <span>
            Jobs completed <b className="text-white">{e?.jobs?.allTime || 0}</b>
          </span>
        </div>
        {e?.available < minimum && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/60">
            <Info size={12} aria-hidden="true" />
            You need at least {inr(minimum)} to withdraw.
          </p>
        )}
      </Card>

      {/* Period totals */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="Today" value={inr(e?.today)} hint={`${e?.jobs?.today || 0} jobs`} tone="blue" />
        <StatCard icon={TrendingUp} label="This week" value={inr(e?.week)} hint={`${e?.jobs?.week || 0} jobs`} tone="indigo" />
        <StatCard icon={IndianRupee} label="This month" value={inr(e?.month)} hint={`${e?.jobs?.month || 0} jobs`} tone="emerald" />
        <StatCard icon={Wallet} label="Platform fee paid" value={inr(e?.commission)} hint="Lifetime" tone="slate" />
      </div>

      {/* Chart */}
      <Card>
        <h2 className="text-sm font-bold text-slate-800">Last 7 days</h2>
        <EarningsChart daily={summary.data?.daily || []} />
      </Card>

      {/* Job history */}
      <Card padded={false}>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-800">Completed jobs</h2>
          <p className="text-xs text-slate-400">Your share after the platform fee</p>
        </div>

        {history.loading && !history.data ? (
          <LoadingState />
        ) : !history.data?.jobs?.length ? (
          <EmptyState
            icon={History}
            title="No completed jobs yet"
            description="Finish your first booking and your earnings will appear here."
          />
        ) : (
          <Table headers={["Date", "Service", "Customer", "Total", "Fee", "You earn"]}>
            {history.data.jobs.map((job) => (
              <TR key={job.id}>
                <TD className="whitespace-nowrap text-slate-500">{formatDate(job.completedAt)}</TD>
                <TD className="font-medium text-slate-800">{job.service}</TD>
                <TD className="text-slate-500">{job.customer}</TD>
                <TD className="tabular-nums">{inr(job.gross)}</TD>
                <TD className="tabular-nums text-rose-600">−{inr(job.commission)}</TD>
                <TD className="tabular-nums font-semibold text-emerald-700">{inr(job.net)}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      {/* Withdrawals */}
      <Card padded={false}>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-800">Withdrawals</h2>
        </div>

        {payouts.loading && !payouts.data ? (
          <LoadingState />
        ) : !payouts.data?.payouts?.length ? (
          <EmptyState icon={Wallet} title="No withdrawals yet" />
        ) : (
          <Table headers={["Requested", "Amount", "Method", "Status", "Reference"]}>
            {payouts.data.payouts.map((p) => (
              <TR key={p._id}>
                <TD className="whitespace-nowrap text-slate-500">{formatDate(p.createdAt)}</TD>
                <TD className="tabular-nums font-semibold">{inr(p.amount)}</TD>
                <TD className="uppercase text-slate-500">
                  {p.method === "upi" ? p.destination?.upiId || "UPI" : `••${p.destination?.accountLast4 || ""}`}
                </TD>
                <TD>
                  <Badge status={p.status === "paid" ? "completed" : p.status === "rejected" ? "rejected" : "pending"}>
                    {p.status}
                  </Badge>
                </TD>
                <TD className="text-xs text-slate-400">
                  {p.reference || p.rejectionReason || "—"}
                </TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      <WithdrawDialog
        open={withdrawOpen}
        available={e?.available || 0}
        minimum={minimum}
        onClose={() => setWithdrawOpen(false)}
        onDone={refreshAll}
      />
    </div>
  );
}
