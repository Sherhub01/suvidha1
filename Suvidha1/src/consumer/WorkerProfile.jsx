import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  CalendarCheck,
  BadgeCheck,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import { THEME, fetchWorkerProfile, getCategoryBySlug, createBooking, MOCK_WORKERS } from "../api";
import WorkerMap from "./components/WorkerMap";

const AVAILABILITY_LABEL = {
  available_now: "Available now",
  today: "Free today",
  this_week: "Free this week",
  unavailable: "Currently unavailable",
};

const SAMPLE_REVIEWS = [
  { name: "Anjali Mehra", rating: 5, comment: "Punctual and did a really neat job. Would book again without hesitation." },
  { name: "Karan Malhotra", rating: 4, comment: "Good work overall, explained the issue clearly before starting." },
  { name: "Ritu Sharma", rating: 5, comment: "Very professional and reasonably priced. Highly recommend." },
];

const WorkerProfile = () => {
  const { workerId } = useParams();
  const [worker, setWorker] = useState(undefined);
  const [chatOpen, setChatOpen] = useState(false);
  const [bookingState, setBookingState] = useState("idle"); // idle | loading | success
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setWorker(undefined);
    fetchWorkerProfile(workerId).then(setWorker);
  }, [workerId]);

  if (worker === undefined) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${THEME.card} h-80 animate-pulse lg:col-span-1`} />
        <div className={`${THEME.card} h-80 animate-pulse lg:col-span-2`} />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-base font-semibold text-gray-900">Professional not found</p>
        <p className="mt-1 text-sm text-gray-500">This profile may have been removed.</p>
        <Link to="/services" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
          ← Back to services
        </Link>
      </div>
    );
  }

  const category = getCategoryBySlug(worker.category);

  const handleBook = () => {
    setBookingState("loading");
    createBooking({ workerId: worker.id, category: worker.category }).then(() => {
      setBookingState("success");
      setTimeout(() => setBookingState("idle"), 3000);
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: worker.name, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };


  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className={`${THEME.card} flex flex-col items-center p-6 text-center lg:col-span-1`}>
          <img
            src={worker.profilePhoto}
            alt={worker.name}
            className="h-32 w-32 rounded-3xl object-cover ring-4 ring-indigo-50"
          />
          <h1 className="mt-4 text-xl font-bold text-gray-900">{worker.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <BadgeCheck size={14} className="text-indigo-500" />
            {category?.name} · {worker.experience} yrs experience
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className={THEME.ratingBadge}>
              <Star size={16} className="fill-amber-400 text-amber-400" />
              {worker.rating.toFixed(1)}
              <span className="font-normal text-gray-400">({worker.reviewsCount} reviews)</span>
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className={THEME.locationTag}>
              <MapPin size={11} /> {worker.city}
            </span>
            <span className={THEME.priceTag}>
              <IndianRupee size={11} /> {worker.price}{worker.priceType === "hourly" ? "/hr" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {AVAILABILITY_LABEL[worker.availability]}
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid w-full grid-cols-2 gap-2">
            <a href={`tel:${worker.phone}`} className={`${THEME.outlineBtn} text-sm`}>
              <Phone size={15} /> Call
            </a>
            <button onClick={() => setChatOpen((o) => !o)} className={`${THEME.outlineBtn} text-sm`}>
              <MessageCircle size={15} /> Chat
            </button>
            <button onClick={handleBook} disabled={bookingState === "loading"} className={`${THEME.primaryBtn} col-span-2 text-sm`}>
              <CalendarCheck size={15} />
              {bookingState === "loading" ? "Booking..." : bookingState === "success" ? "Booked!" : "Book service"}
            </button>
            <button onClick={handleShare} className={`${THEME.secondaryBtn} col-span-2 text-sm`}>
              <Share2 size={15} /> {shareCopied ? "Link copied!" : "Share profile"}
            </button>
          </div>

          {bookingState === "success" && (
            <div className={`${THEME.successAlert} mt-3 flex w-full items-center gap-2`}>
              <CheckCircle2 size={16} /> Booking request sent! {worker.name} will confirm shortly.
            </div>
          )}

          {chatOpen && (
            <div className="mt-3 w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-left text-sm text-gray-600">
              <p className="font-medium text-gray-900">Chat with {worker.name.split(" ")[0]}</p>
              <p className="mt-1 text-xs text-gray-500">
                In-app chat is coming soon. For now, use Call to reach this professional directly.
              </p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Contact & address */}
          <div className={`${THEME.card} p-6`}>
            <h2 className="text-base font-bold text-gray-900">Contact & address</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Phone size={16} />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{worker.phone}</p>
                </div>
              </div>
              {worker.email && (
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Mail size={16} />
                  </span>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{worker.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 sm:col-span-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPin size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{worker.address}</p>
                </div>
              </div>
            </div>

            {/* Embedded interactive map */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Location on map</p>
              <WorkerMap
                workers={MOCK_WORKERS.filter((w) => w.city === worker.city).slice(0, 12)}
                center={(() => {
                  const [lng, lat] = worker.location?.coordinates || [77.2090, 28.6139];
                  return [lat, lng];
                })()}
                zoom={14}
                height="280px"
                showSearch={false}
              />
            </div>
          </div>

          {/* Skills & certificates */}
          <div className={`${THEME.card} p-6`}>
            <h2 className="text-base font-bold text-gray-900">Skills & certificates</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {skill}
                </span>
              ))}
            </div>
            {worker.certificates?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {worker.certificates.map((cert) => (
                  <span key={cert} className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <BadgeCheck size={12} /> {cert}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio */}
          {worker.portfolio?.length > 0 && (
            <div className={`${THEME.card} p-6`}>
              <h2 className="text-base font-bold text-gray-900">Portfolio</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {worker.portfolio.map((src, i) => (
                  <img key={i} src={src} alt={`${worker.name} work sample ${i + 1}`} className="h-28 w-full rounded-xl object-cover" loading="lazy" />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className={`${THEME.card} p-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Reviews</h2>
              <span className={THEME.ratingBadge}>
                <Star size={16} className="fill-amber-400 text-amber-400" />
                {worker.rating.toFixed(1)}
                <span className="font-normal text-gray-400">({worker.reviewsCount})</span>
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {SAMPLE_REVIEWS.map((review, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={13} className={idx < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
