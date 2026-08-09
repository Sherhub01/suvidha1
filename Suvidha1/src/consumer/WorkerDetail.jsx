import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, MessageCircle, Share2, Star,
  MapPin, BadgeCheck, Calendar, Clock, X, Check,
} from "lucide-react";
import { popularWorkers, nearbyProfessionals } from "../data/mockData";

const TIMES = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

function BookingForm({ worker, onClose, onConfirm }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time || !address.trim()) { setError("Please fill all required fields."); return; }
    onConfirm({ date, time, address, description: desc });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-slate-200 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-navy">Book {worker.profession}</h2>
            <p className="text-xs text-slate">with {worker.name}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-1.5 hover:bg-slate-200 transition"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Worker summary */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <img src={worker.photo} alt={worker.name} className="h-12 w-12 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-navy text-sm">{worker.name}</p>
              <p className="text-xs text-slate">{worker.price} · {worker.experience} experience</p>
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <Star size={11} className="fill-amber-400" />{worker.rating}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-navy/70">
              <Calendar size={13} /> Date <span className="text-rose">*</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-navy focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
            />
          </div>

          {/* Time */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-navy/70">
              <Clock size={13} /> Time Slot <span className="text-rose">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIMES.map((t) => (
                <button
                  key={t} type="button"
                  onClick={() => setTime(t)}
                  className={`rounded-xl border py-2 text-xs font-medium transition ${time === t ? "border-navy bg-navy text-white" : "border-slate-200 bg-slate-50 text-slate hover:border-navy/30"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-navy/70">
              <MapPin size={13} /> Address <span className="text-rose">*</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-navy placeholder:text-slate/60 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 text-xs font-semibold text-navy/70 block">Work Description (optional)</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the work needed…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-navy placeholder:text-slate/60 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-rose font-medium">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-navy py-3 text-sm font-bold text-white transition hover:bg-navy-light active:scale-95">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}

function ConfirmedModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Check size={32} className="text-emerald-500" strokeWidth={3} />
        </div>
        <h2 className="text-xl font-bold text-navy">Booking Confirmed!</h2>
        <p className="mt-2 text-sm text-slate">Your booking has been placed successfully. The professional will contact you shortly.</p>
        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-navy py-3 text-sm font-bold text-white hover:bg-navy-light transition">
          Done
        </button>
      </div>
    </div>
  );
}

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);

  const worker =
    popularWorkers.find((w) => w.id === id) ||
    nearbyProfessionals.find((w) => w.id === id);

  if (!worker) {
    return (
      <div className="mx-auto max-w-3xl pb-10">
        <p className="text-sm text-slate">Professional not found.</p>
        <Link to="/dashboard" className="mt-2 inline-block text-sm font-medium text-rose hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  const handleCall = () => window.location.href = `tel:+919876543210`;
  const handleChat = () => window.open(`https://wa.me/919876543210`, "_blank");
  const handleShare = () => navigator.share?.({ title: worker.name, url: window.location.href });

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-navy transition">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
        {/* Cover photo */}
        <div className="relative h-56 sm:h-72">
          <img src={worker.photo} alt={worker.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
          {/* Availability pill */}
          <span className={`absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${worker.available ? "bg-emerald-500/90 text-white" : "bg-slate-500/80 text-white"
            }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${worker.available ? "bg-white" : "bg-slate-300"}`} />
            {worker.available ? "Available today" : "Currently busy"}
          </span>
          {/* Rating badge */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-amber-600 backdrop-blur-sm">
            <Star size={14} className="fill-amber-400" />{worker.rating}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Name + profession */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-navy">
                {worker.name}
                <BadgeCheck size={20} className="text-emerald-500" />
              </h1>
              <p className="text-sm text-slate">{worker.profession}</p>
            </div>
            <p className="text-lg font-bold text-navy">{worker.price}</p>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Experience", value: worker.experience },
              { label: "Reviews", value: `${worker.reviews}+` },
              { label: "Distance", value: worker.distance },
              { label: "Rating", value: `${worker.rating}/5` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate">{label}</p>
                <p className="mt-0.5 text-sm font-bold text-navy">{value}</p>
              </div>
            ))}
          </div>
          <Gallery
            mode="staff"
            staffId={staffId}
            editable={false}
            title="Past Work"
          />
          {/* About */}
          <p className="mt-5 text-sm leading-relaxed text-slate">
            Skilled and background-verified professional available for doorstep service in your area.
            Carries standard tools and offers a service guarantee on all completed jobs.
          </p>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleCall}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-95"
            >
              <Phone size={16} /> Call Now
            </button>
            <button
              onClick={handleChat}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition hover:bg-[#20bd5a] active:scale-95"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button
              onClick={() => setShowBooking(true)}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-sm font-bold text-white transition hover:bg-navy-light active:scale-95"
            >
              <Calendar size={16} /> Book Service
            </button>
            <button
              onClick={handleShare}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate transition hover:border-navy/20 hover:text-navy"
            >
              <Share2 size={15} /> Share Profile
            </button>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingForm
          worker={worker}
          onClose={() => setShowBooking(false)}
          onConfirm={() => { setShowBooking(false); setShowConfirmed(true); }}
        />
      )}
      {showConfirmed && <ConfirmedModal onClose={() => { setShowConfirmed(false); navigate("/bookings"); }} />}
    </div>
  );
}
