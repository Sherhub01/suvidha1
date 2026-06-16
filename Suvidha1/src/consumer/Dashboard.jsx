import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  MapPin,
  ClipboardList,
  Compass,
  ArrowRight,
  Loader2,
} from "lucide-react";
import ServiceCard from "./components/ServiceCard";
import WorkerCard from "./components/WorkerCard";
import {
  THEME,
  SERVICES,
  MOCK_WORKERS,
  fetchWorkers,
  fetchNearbyWorkers,
} from "../api";
import API from "../api";
import { useBookings } from "../context/BookingsContext";
import WorkerMap from "./components/WorkerMap";

const STATUS_STYLES = {
  Scheduled: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-rose-50 text-rose-600",
  pending:   "bg-amber-50 text-amber-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-600",
};

/** Live-updating "current date & time" used in the dashboard greeting */
const useClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Dashboard = () => {
  const now = useClock();
  const { bookings: liveBookings } = useBookings();
  const [popularWorkers, setPopularWorkers] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [nearby, setNearby] = useState(null);
  const [locating, setLocating] = useState(false);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );

  useEffect(() => {
    fetchWorkers({ sort: "rating" }).then((data) => setPopularWorkers(data.slice(0, 4)));
    setBookings(liveBookings.slice(0, 3));
    fetchNearbyWorkers().then(setNearby);
    API.get("/me").then((r) => setCurrentUser(r.data.user)).catch(() => {});
  }, []);

  // Keep recent bookings in sync with live context
  useEffect(() => {
    setBookings(liveBookings.slice(0, 3));
  }, [liveBookings]);

  const handleDetectLocation = () => {
    setLocating(true);
    // Mock geolocation lookup - in production this calls navigator.geolocation
    // and then GET /api/workers/nearby?lat=..&lng=..
    setTimeout(() => {
      fetchNearbyWorkers().then((data) => {
        setNearby(data);
        setLocating(false);
      });
    }, 700);
  };

  const formattedDate = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Greeting hero */}
      <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0F172A_0%,#1E3A5F_40%,#1E40AF_70%,#0EA5E9_100%)] p-6 sm:p-8">
        <p className="text-sm font-medium text-white/60">{formattedDate} · {formattedTime}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
          Welcome back, {currentUser.firstName || "there"} 👋
        </h1>
        <p className="mt-1 max-w-xl text-sm text-white/70">
          Find trusted electricians, plumbers, cleaners and more — verified, rated and ready near{" "}
          {currentUser.address?.city || currentUser.city || "your city"}.
        </p>
      </section>

      {/* Featured services */}
      <section>
        <SectionHeader
          title="Featured services"
          subtitle="Tap a category to find verified professionals near you"
          action={
            <Link to="/services" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICES.slice(0, 10).map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      {/* Popular workers */}
      <section>
        <SectionHeader title="Popular professionals" subtitle="Highly rated by people near you" />
        {!popularWorkers ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${THEME.card} h-48 animate-pulse p-4`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent requests */}
        <section>
          <SectionHeader title="Recent requests" subtitle="Your latest bookings and their status" />
          {!bookings ? (
            <div className={`${THEME.card} h-48 animate-pulse`} />
          ) : bookings.length === 0 ? (
            <div className={`${THEME.card} flex flex-col items-center justify-center px-6 py-12 text-center`}>
              <ClipboardList size={28} className="mb-3 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">No bookings yet</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Once you book a professional, your requests will show up here.
              </p>
              <Link to="/services" className="mt-4 text-sm font-semibold text-indigo-600 hover:underline">
                Browse services
              </Link>
            </div>
          ) : (
            <div className={`${THEME.card} divide-y divide-gray-100 p-2`}>
              {bookings.map((b) => {
                return (
                  <div key={b.id} className="flex items-center gap-3 px-3 py-3">
                    <img
                      src={b.workerPhoto}
                      alt={b.workerName}
                      className="h-10 w-10 rounded-full border border-gray-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{b.workerName}</p>
                      <p className="text-xs text-gray-500">
                        {b.service} · {b.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-gray-900">{b.price}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[b.status?.toLowerCase()]}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Nearby professionals — full interactive map */}
        <section className="lg:col-span-2">
          <SectionHeader
            title="Nearby professionals"
            subtitle="Tap any pin to see availability, price and book — no need to leave this page"
            action={
              <button
                onClick={handleDetectLocation}
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline"
              >
                {locating ? <Loader2 size={14} className="animate-spin" /> : <Compass size={14} />}
                {locating ? "Locating..." : "Use my location"}
              </button>
            }
          />
          <WorkerMap
            workers={MOCK_WORKERS}
            height="420px"
            showSearch={true}
          />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
