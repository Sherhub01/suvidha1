import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");

  const inputsRef = useRef([]);

  const handleCheckEmail = async () => {
    try {
      await API.post("/forgot-password", { email });

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otpCode);
      setStep(2);
      console.log("OTP:", otpCode);

      Swal.fire({
        title: "OTP Sent 📩",
        text: `OTP sent to ${email}`,
        icon: "success",
        confirmButtonColor: "#ec4899",
      });
    } catch (err) {
      Swal.fire({
        title: "User Not Found ❌",
        text: err.response?.data?.message || "No account found with this email",
        icon: "error",
        confirmButtonColor: "#ef4444",
      }).then(() => navigate("/signup"));
    }
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp === generatedOtp) {
      setStep(3);
      Swal.fire({
        title: "Verified ✅",
        text: "Now reset your password",
        icon: "success",
        confirmButtonColor: "#22c55e",
      });
    } else {
      Swal.fire({ title: "Invalid OTP ❌", text: "Enter correct OTP", icon: "error" });
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters", "error");
      return;
    }
    try {
      await API.post("/reset-password", {
        email,
        otp: otp.join(""),
        newPassword,
      });

      Swal.fire({
        title: "Success 🎉",
        text: "Password updated successfully",
        icon: "success",
        confirmButtonColor: "#22c55e",
      }).then(() => navigate("/login"));
    } catch (err) {
      Swal.fire({
        title: "Reset Failed",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 px-4">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl space-y-6 text-center">
        <h2 className="text-2xl font-bold text-white">Forgot Password</h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleCheckEmail}
              className="w-full py-2 rounded-xl bg-pink-500 text-white hover:scale-105 transition"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-white/70">Enter 6-digit OTP</p>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  maxLength="1"
                  ref={(el) => (inputsRef.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-xl rounded-lg bg-white/10 border border-white/20 text-white"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOtp}
              className="w-full py-2 bg-green-500 text-white rounded-xl"
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              onClick={handleResetPassword}
              className="w-full py-2 bg-blue-500 text-white rounded-xl"
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
