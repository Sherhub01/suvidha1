import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { THEME } from "../api";

const STEPS = [
  "Verify your email ✓",
  "Complete your profile",
  "Book your first service",
];

/**
 * Brief "you're in!" screen shown after a user verifies their OTP
 * but before they've filled in their full profile. The router should
 * send users here when `isEmailVerified && !isProfileComplete`.
 */
const Welcome = () => (
  <div className={`${THEME.heroBg} flex min-h-screen flex-col items-center justify-center px-6 py-12`}>
    <div className={`${THEME.glassCard} w-full max-w-md p-8 text-center`}>
      <div className="flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 shadow-lg">
          <Sparkles size={32} className="text-white" />
        </span>
      </div>

      <h1 className="mt-5 text-2xl font-extrabold text-white">Welcome to Suvidha1!</h1>
      <p className="mt-2 text-sm text-white/75">
        Your email is verified. Complete your profile to start booking trusted professionals near
        you.
      </p>

      <div className="mt-6 flex flex-col gap-2.5 text-left">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i === 0
                  ? "bg-emerald-500 text-white"
                  : "border border-white/30 text-white/60"
              }`}
            >
              {i === 0 ? <CheckCircle2 size={15} /> : i + 1}
            </span>
            <span className={`text-sm ${i === 0 ? "font-semibold text-white" : "text-white/60"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      <Link to="/create-profile" className={`${THEME.primaryBtn} mt-8 w-full justify-center`}>
        Complete my profile <ArrowRight size={16} />
      </Link>

      <Link
        to="/dashboard"
        className="mt-3 block text-sm font-medium text-white/60 hover:text-white"
      >
        Skip for now →
      </Link>
    </div>
  </div>
);

export default Welcome;
