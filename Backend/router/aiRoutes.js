import express from "express";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function callAI(messages, systemPrompt) {
  const GROQ_KEY   = process.env.GROQ_API_KEY   || "";
  const OPENAI_KEY = process.env.OPENAI_API_KEY  || "";

  // Try Groq first (free & fast), fall back to OpenAI
  if (GROQ_KEY) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
  }

  if (OPENAI_KEY) {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
  }

  throw new Error("No AI API key configured. Add GROQ_API_KEY to Backend/.env");
}

const CONSUMER_SYSTEM = `You are Suvidha1 Assistant — a friendly, expert AI built into the Suvidha1 home services marketplace for consumers in India.

About Suvidha1: India's #1 platform for verified, background-checked home service professionals. Available in Delhi, Gurugram, Noida, Mumbai, Pune, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad.

16 service categories with starting prices:
Electrician (₹199/hr), Plumber (₹179), Carpenter (₹249), Welder (₹299), Painter (₹15/sqft), Cleaning Staff (₹149/hr), AC Repair (₹299), Mechanic (₹199), Mason (₹399), CCTV Installer (₹499), RO Technician (₹149), Appliance Repair (₹199), Pest Control (₹399), Movers & Packers (₹999), Home Tutor (₹299/hr), Beautician (₹249).

App pages: Dashboard (/dashboard), Services (/services), Bookings (/bookings), Map (/map), Settings (/settings), About (/about).

Booking flow: Browse Services → find professional → Book service → fill date/time/address → Scheduled → Confirmed → Completed → Rate.

Rules: Be warm and concise (max 120 words). Give exact navigation paths. For complaints: support@suvidha1.app or +91 11 4000 0000. Use friendly Hindi phrases naturally.`;

const STAFF_SYSTEM = `You are Suvidha1 Professional Assistant — an expert AI built into the Suvidha1 platform for service professionals in India.

Your role: Help professionals manage bookings, navigate to customers, track earnings, and grow their business on Suvidha1.

Platform knowledge:
- Dashboard (/staff/dashboard): Today's bookings, pending jobs, earnings summary
- Bookings (/staff/bookings): Accept/reject jobs, mark complete, view all status tabs
- Map (/staff/map): Navigate to customers, share your location
- Earnings (/staff/earnings): Daily/weekly/monthly earnings, withdrawal history
- Profile (/staff/profile): Update skills, experience, documents
- Settings (/staff/settings): Password, notifications, service areas
- Verification (/staff/verification): Upload Aadhaar, PAN for admin approval

Key workflows:
1. Accept booking → Bookings → Scheduled tab → tap job → Accept
2. Mark complete → Bookings → Confirmed job → Mark as Completed
3. Navigate to customer → Map → tap Navigate
4. Earnings payout → Min ₹500, processed every Friday via Bank/UPI

Rules: Be concise and professional (max 120 words). Give exact paths. For support: support@suvidha1.app or +91 11 4000 0000.`;

router.post("/consumer", protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ success: false, message: "Messages required" });
    const reply = await callAI(messages, CONSUMER_SYSTEM);
    res.json({ success: true, reply });
  } catch (err) {
    console.error("AI (consumer):", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/staff", protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ success: false, message: "Messages required" });
    const reply = await callAI(messages, STAFF_SYSTEM);
    res.json({ success: true, reply });
  } catch (err) {
    console.error("AI (staff):", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
