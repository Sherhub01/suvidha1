import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, Share2, Star, MapPin, BadgeCheck } from "lucide-react";
import { popularWorkers, nearbyProfessionals } from "../data/mockData";

export default function WorkerDetail() {
  const { id } = useParams();
  const worker =
    popularWorkers.find((w) => w.id === id) ||
    nearbyProfessionals.find((w) => w.id === id);

  if (!worker) {
    return (
      <div className="mx-auto max-w-3xl pb-10">
        <p className="text-sm text-stone-muted">Professional not found.</p>
        <Link to="/dashboard" className="mt-2 inline-block text-sm font-medium text-rust hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-muted hover:text-ink">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mt-3 overflow-hidden rounded-xl2 bg-white shadow-card ring-1 ring-ink/5">
        <img src={worker.photo} alt={worker.name} className="h-56 w-full object-cover sm:h-72" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
                {worker.name}
                <BadgeCheck size={20} className="text-teal" />
              </h1>
              <p className="text-sm text-stone-muted">{worker.profession}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-marigold-light px-3 py-1 text-sm font-semibold text-marigold-dark">
              <Star size={14} className="fill-marigold-dark" />
              {worker.rating}
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-stone-muted">Experience</dt>
              <dd className="font-semibold text-ink">{worker.experience ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-muted">Price</dt>
              <dd className="font-semibold text-ink">{worker.price ?? "On request"}</dd>
            </div>
            <div className="flex items-start gap-1">
              <MapPin size={14} className="mt-0.5 text-stone-muted" />
              <div>
                <dt className="text-stone-muted">Distance</dt>
                <dd className="font-semibold text-ink">{worker.distance}</dd>
              </div>
            </div>
            <div>
              <dt className="text-stone-muted">Status</dt>
              <dd className={`font-semibold ${worker.available ? "text-teal" : "text-rust"}`}>
                {worker.available ? "Available today" : "Busy"}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-stone-muted">
            Skilled and background-verified professional, available for
            doorstep service in your area. Carries standard tools and
            offers a service guarantee on all completed jobs.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className="flex items-center gap-2 rounded-xl2 bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-light">
              <Phone size={15} /> Call
            </button>
            <button className="flex items-center gap-2 rounded-xl2 border border-ink/10 px-4 py-2.5 text-sm font-semibold text-ink hover:border-marigold">
              <MessageCircle size={15} /> Chat
            </button>
            <button className="flex items-center gap-2 rounded-xl2 bg-marigold px-4 py-2.5 text-sm font-semibold text-ink hover:bg-marigold-dark hover:text-white">
              Book service
            </button>
            <button className="flex items-center gap-2 rounded-xl2 border border-ink/10 px-4 py-2.5 text-sm font-semibold text-ink hover:border-marigold">
              <Share2 size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
