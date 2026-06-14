import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api";

const FIELD_CLASSES =
  "w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-pink-400 transition";

export default function CreateProfile() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({});

  // Pre-fill from login response stored in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const saved = JSON.parse(localStorage.getItem("user") || "{}");
    setForm((f) => ({
      ...f,
      firstName: saved.firstName || "",
      lastName: saved.lastName || "",
      email: saved.email || "",
      phone: saved.phone || "",
      address: saved.address || "",
      bio: saved.bio || "",
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, avatar: "Only image files allowed" }));
      return;
    }
    setForm((f) => ({ ...f, avatar: file }));
    setErrors((er) => ({ ...er, avatar: "" }));
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!form.email.trim())     e.email     = "Email is required";
    if (!form.phone.trim())     e.phone     = "Contact number is required";
    if (!form.address.trim())   e.address   = "Address is required";
    if (!form.avatar)           e.avatar    = "Profile picture is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      Swal.fire({ title: "Fill all fields", text: "All fields including profile picture are required.", icon: "warning", background: "#111827", color: "#fff", confirmButtonColor: "#ec4899" });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("firstName", form.firstName.trim());
      fd.append("lastName",  form.lastName.trim());
      fd.append("address",   form.address.trim());
      fd.append("bio",       form.bio.trim());
      if (form.avatar) fd.append("avatar", form.avatar);

      const { data } = await API.post("/create-profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("user", JSON.stringify(data.user));

      await Swal.fire({
        title: "Profile Complete! 🎊",
        text: `Welcome aboard, ${data.user.firstName}!`,
        icon: "success",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#22c55e",
        confirmButtonText: "Go to Dashboard →",
      });
      navigate("/dashboard");
    } catch (err) {
      Swal.fire({
        title: "Failed",
        text: err.response?.data?.message || "Could not save profile",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 py-10 px-4">
      <div className="pointer-events-none absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-0 left-0" />
      <div className="pointer-events-none absolute w-56 h-56 bg-pink-400/20 rounded-full blur-2xl bottom-0 right-0" />

      <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-white/60 text-sm mt-1">All fields are required to continue</p>
        </div>

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="relative w-24 h-24 rounded-full border-2 border-dashed border-pink-400 overflow-hidden hover:border-pink-300 transition group"
          >
            {preview ? (
              <img src={preview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-pink-300 group-hover:text-pink-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5v-9m-4.5 4.5h9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs mt-1">Add Photo</span>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {errors.avatar && <p className="text-red-400 text-xs">{errors.avatar}</p>}
          <p className="text-white/50 text-xs">Click to upload profile picture</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className={FIELD_CLASSES} />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className={FIELD_CLASSES} />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <input name="email" value={form.email} disabled placeholder="Email Address"
              className={`${FIELD_CLASSES} opacity-60 cursor-not-allowed`} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Contact Number" className={FIELD_CLASSES} />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full Address" rows={2}
              className={`${FIELD_CLASSES} resize-none`} />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Short bio (optional)" rows={2}
              className={`${FIELD_CLASSES} resize-none`} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 text-white font-semibold tracking-wide hover:scale-105 hover:shadow-xl transition duration-300 disabled:opacity-60"
          >
            {loading ? "Saving Profile…" : "Complete Profile →"}
          </button>
        </form>
      </div>
    </div>
  );
}
