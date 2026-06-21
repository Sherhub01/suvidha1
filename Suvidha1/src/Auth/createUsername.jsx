import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api";

const CreateUsername = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  const role = location.state?.role || sessionStorage.getItem("selectedRole");

  const validateUsername = () => {
    if (username.length < 6) return "Username must be at least 6 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Only letters, numbers and underscore allowed";
    return "";
  };

  const handleSubmit = async () => {
    const err = validateUsername();
    if (err) {
      setError(err);
      Swal.fire({ title: "Invalid Username", text: err, icon: "error", background: "#111827", color: "#fff" });
      return;
    }

    setLoading(true);
    try {
      await API.post("/complete-signup", { email, username, role });

      Swal.fire({
        title: "Username Set! 🎉",
        text: "Now sign in to get started.",
        icon: "success",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#22c55e",
        confirmButtonText: "Sign In →",
      }).then(() => navigate("/login", { state: { role } }));
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("taken") || msg.toLowerCase().includes("already")) {
        Swal.fire({
          title: "🦢 Username Taken!",
          html: `<p>This username is already in use.</p><p style="color:#fbbf24;font-size:13px;margin-top:6px">Please try a different username.</p>`,
          icon: "warning",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
          confirmButtonText: "Try Another",
        });
      } else {
        Swal.fire({
          title: "Failed",
          text: msg || "Could not save username",
          icon: "error",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600">
      <div className="w-[360px] p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center space-y-6">
        <h2 className="text-2xl font-bold text-white">Create Username</h2>
        <p className="text-white/70 text-sm">Choose a unique username</p>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-pink-400"
        />

        <p className="text-red-400 text-sm">{error}</p>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:scale-105 transition"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default CreateUsername;
