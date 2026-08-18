import mongoose from "mongoose";

import Booking, { BOOKING_STATUS } from "../models/booking.js";
import Payout, { MIN_PAYOUT_PAISE } from "../models/payout.js";
import StaffProfile from "../models/staffProfile.js";
import StaffAlert from "../models/staffAlert.js";
import { toPaise, formatPaise } from "../utils/pricing.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// ────────────────────────────────────────────────────────────
// Earnings
//
// The staff Earnings screen previously rendered a hardcoded ₹96,200 and a fake
// withdrawal history. Everything below is derived from completed, paid bookings.
// ────────────────────────────────────────────────────────────

/** Sums `pricing.staffEarning` over completed and paid bookings. */
async function earningsSince(staffId, since) {
  const match = {
    staff: new mongoose.Types.ObjectId(String(staffId)),
    status: BOOKING_STATUS.COMPLETED,
    paymentStatus: "Paid",
  };
  if (since) match.completedAt = { $gte: since };

  const [agg] = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        gross: { $sum: "$pricing.total" },
        commission: { $sum: "$pricing.platformCommission" },
        net: { $sum: "$pricing.staffEarning" },
        jobs: { $sum: 1 },
      },
    },
  ]);

  return agg || { gross: 0, commission: 0, net: 0, jobs: 0 };
}

const startOfTodayIST = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + 330 * 60000);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - 330 * 60000);
};

export const getEarningsSummary = async (req, res) => {
  try {
    const staffId = req.userId;

    const today = startOfTodayIST();
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const monthAgo = new Date(Date.now() - 30 * 86400000);

    const [allTime, todayAgg, weekAgg, monthAgg, claimed] = await Promise.all([
      earningsSince(staffId, null),
      earningsSince(staffId, today),
      earningsSince(staffId, weekAgo),
      earningsSince(staffId, monthAgo),
      Payout.claimedTotal(staffId),
    ]);

    // Available = everything earned, minus anything already requested or paid.
    const available = Math.max(0, allTime.net - claimed);

    // Last seven days, for the bar chart.
    const daily = await Booking.aggregate([
      {
        $match: {
          staff: new mongoose.Types.ObjectId(String(staffId)),
          status: BOOKING_STATUS.COMPLETED,
          paymentStatus: "Paid",
          completedAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt", timezone: "Asia/Kolkata" } },
          net: { $sum: "$pricing.staffEarning" },
          jobs: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      earnings: {
        today: todayAgg.net / 100,
        week: weekAgg.net / 100,
        month: monthAgg.net / 100,
        allTime: allTime.net / 100,
        gross: allTime.gross / 100,
        commission: allTime.commission / 100,
        available: available / 100,
        withdrawn: claimed / 100,
        jobs: { today: todayAgg.jobs, week: weekAgg.jobs, month: monthAgg.jobs, allTime: allTime.jobs },
      },
      daily: daily.map((d) => ({ date: d._id, net: d.net / 100, jobs: d.jobs })),
      minWithdrawal: MIN_PAYOUT_PAISE / 100,
    });
  } catch (err) {
    console.error("getEarningsSummary error:", err);
    fail(res, 500, "Server error");
  }
};

/** Completed, paid jobs — the line items behind the totals above. */
export const getEarningsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.validatedQuery || req.query;

    const filter = {
      staff: req.userId,
      status: BOOKING_STATUS.COMPLETED,
      paymentStatus: "Paid",
    };

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("consumer", "firstName lastName")
        .select("service category completedAt pricing paymentMethod")
        .sort({ completedAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      jobs: bookings.map((b) => ({
        id: b._id,
        service: b.service,
        category: b.category,
        completedAt: b.completedAt,
        customer: `${b.consumer?.firstName || ""} ${b.consumer?.lastName || ""}`.trim() || "Customer",
        gross: (b.pricing?.total || 0) / 100,
        commission: (b.pricing?.platformCommission || 0) / 100,
        net: (b.pricing?.staffEarning || 0) / 100,
        paymentMethod: b.paymentMethod,
      })),
    });
  } catch (err) {
    console.error("getEarningsHistory error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Payouts
// ────────────────────────────────────────────────────────────

export const requestPayout = async (req, res) => {
  try {
    const amountPaise = toPaise(req.body.amount);

    if (amountPaise < MIN_PAYOUT_PAISE) {
      return fail(res, 400, `The minimum withdrawal is ${formatPaise(MIN_PAYOUT_PAISE)}.`);
    }

    const profile = await StaffProfile.findOne({ user: req.userId });
    if (!profile) return fail(res, 404, "Complete your profile before withdrawing.");
    if (profile.status !== "approved") {
      return fail(res, 403, "Your profile must be approved before you can withdraw.");
    }

    const [allTime, claimed] = await Promise.all([
      earningsSince(req.userId, null),
      Payout.claimedTotal(req.userId),
    ]);

    const available = allTime.net - claimed;
    if (amountPaise > available) {
      return fail(res, 400, `You can withdraw up to ${formatPaise(Math.max(0, available))} right now.`);
    }

    const method = req.body.method;

    if (method === "upi" && !profile.upiId) {
      return fail(res, 400, "Add a UPI ID in your profile first.");
    }
    if (method === "bank" && !(profile.accountNumber && profile.ifscCode)) {
      return fail(res, 400, "Add your bank account details in your profile first.");
    }

    const payout = await Payout.create({
      staff: req.userId,
      staffProfile: profile._id,
      amount: amountPaise,
      method,
      // Snapshot: a later profile edit must not redirect a pending payout, and
      // only the last four digits of the account are retained.
      destination: {
        accountHolder: profile.accountHolder || "",
        accountLast4: (profile.accountNumber || "").slice(-4),
        ifscCode: profile.ifscCode || "",
        bankName: profile.bankName || "",
        upiId: method === "upi" ? profile.upiId || "" : "",
      },
    });

    res.status(201).json({
      success: true,
      payout: { ...payout.toObject(), amount: payout.amount / 100 },
      message: `Withdrawal of ${formatPaise(amountPaise)} requested. Payouts are processed within 1–2 business days.`,
    });
  } catch (err) {
    console.error("requestPayout error:", err);
    fail(res, 500, "Server error");
  }
};

export const getMyPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ staff: req.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      payouts: payouts.map((p) => ({ ...p, amount: p.amount / 100 })),
    });
  } catch (err) {
    console.error("getMyPayouts error:", err);
    fail(res, 500, "Server error");
  }
};

// ── Admin ──────────────────────────────────────────────────

export const adminListPayouts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.validatedQuery || req.query;
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const [payouts, total, pending] = await Promise.all([
      Payout.find(filter)
        .populate("staff", "firstName lastName email phone")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Payout.countDocuments(filter),
      Payout.aggregate([
        { $match: { status: { $in: ["requested", "approved", "processing"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      success: true,
      total,
      pendingTotal: (pending[0]?.total || 0) / 100,
      payouts: payouts.map((p) => ({ ...p, amount: p.amount / 100 })),
    });
  } catch (err) {
    console.error("adminListPayouts error:", err);
    fail(res, 500, "Server error");
  }
};

export const adminProcessPayout = async (req, res) => {
  try {
    const { status, reference, rejectionReason } = req.body;

    const payout = await Payout.findById(req.params.id);
    if (!payout) return fail(res, 404, "Payout not found");
    if (["paid", "rejected"].includes(payout.status)) {
      return fail(res, 409, `This payout is already ${payout.status}.`);
    }
    if (status === "rejected" && !rejectionReason) {
      return fail(res, 400, "A rejection reason is required.");
    }

    payout.status = status;
    payout.reference = reference || payout.reference;
    payout.rejectionReason = status === "rejected" ? rejectionReason : null;
    payout.processedBy = req.adminId;
    payout.processedAt = new Date();
    await payout.save();

    const messages = {
      approved: `Your withdrawal of ${formatPaise(payout.amount)} was approved and is being processed.`,
      processing: `Your withdrawal of ${formatPaise(payout.amount)} is on its way.`,
      paid: `${formatPaise(payout.amount)} has been paid out${reference ? ` (ref ${reference})` : ""}.`,
      rejected: `Your withdrawal request was rejected: ${rejectionReason}`,
    };

    await StaffAlert.create({
      staff: payout.staff,
      type: "general",
      title: status === "rejected" ? "Withdrawal rejected" : "Withdrawal update",
      message: messages[status],
    }).catch((e) => console.error("StaffAlert error:", e.message));

    res.json({ success: true, payout: { ...payout.toObject(), amount: payout.amount / 100 } });
  } catch (err) {
    console.error("adminProcessPayout error:", err);
    fail(res, 500, "Server error");
  }
};
