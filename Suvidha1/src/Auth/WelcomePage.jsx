import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const firstName = location.state?.firstName || "there";

  useEffect(() => {
    if (!email) navigate("/signup");
  }, [email, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 px-4">
      {/* Background orbs */}
      <div className="pointer-events-none absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-0 left-0" />
      <div className="pointer-events-none absolute w-56 h-56 bg-pink-400/20 rounded-full blur-2xl bottom-0 right-0" />

      <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-center space-y-6">
        {/* Animated checkmark */}
        <div className="mx-auto w-20 h-20 rounded-full bg-green-400/20 border-2 border-green-400 flex items-center justify-center animate-bounce">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {firstName}! 🎉</h1>
          <p className="mt-2 text-white/70 text-sm leading-relaxed">
            Your account has been created. Please verify your email to continue.
          </p>
          <p className="mt-3 inline-block bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-medium text-sm">
            {email}
          </p>
        </div>

        <div className="space-y-2 text-left">
          {[
            { step: "1", text: "Verify your email via OTP" },
            { step: "2", text: "Choose a unique username" },
            { step: "3", text: "Complete your profile" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </span>
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/otp", { state: { email, role: location.state?.role } })}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 text-white font-semibold tracking-wide hover:scale-105 hover:shadow-xl transition duration-300"
        >
          Verify Email →
        </button>
      </div>
    </div>
  );
}
