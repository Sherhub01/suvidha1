import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Star, Shield, Zap } from "lucide-react";
import { THEME, SERVICES } from "../api";

const FEATURES = [
  { icon: Shield, title: "Verified professionals", body: "Every pro is ID-checked and background-screened before listing." },
  { icon: Zap, title: "Instant booking", body: "Book in under 60 seconds. Professionals confirm in real time." },
  { icon: Star, title: "Transparent ratings", body: "Real reviews from real customers. No fake stars, ever." },
];

/**
 * Public marketing / landing page. Users who are already logged in
 * should be redirected to /dashboard by the router.
 */
const Home = () => {
  return (
    <div className={`${THEME.heroBg} flex flex-col`}>
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md">
            <Sparkles size={18} />
          </div>
          <span className="text-xl font-extrabold text-white">Suvidha1</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-white/80 hover:text-white">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow hover:bg-white/90"
          >
            Sign up free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
        <span className={`${THEME.glassChip} mb-4 px-4 py-1.5 text-xs font-semibold text-white/90`}>
          Trusted by 50,000+ households across India
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
          Find trusted home help,{" "}
          <span className="bg-gradient-to-r from-pink-400 to-cyan-300 bg-clip-text text-transparent">
            instantly
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-white/75">
          Electricians, plumbers, cleaners, tutors and more — verified, rated and available near
          you in minutes. No calls, no middlemen, no guesswork.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className={`${THEME.primaryBtn} text-base`}>
            Get started free <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-md hover:bg-white/20"
          >
            I already have an account
          </Link>
        </div>

        {/* Feature chips */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className={`${THEME.glassCard} p-5 text-left`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs text-white/70">{body}</p>
            </div>
          ))}
        </div>

        {/* Service category badges */}
        <div className="mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {SERVICES.slice(0, 10).map((s) => {
            const Icon = s.icon;
            return (
              <span
                key={s.slug}
                className={`${THEME.glassChip} flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90`}
              >
                <Icon size={13} /> {s.name}
              </span>
            );
          })}
          <span className={`${THEME.glassChip} px-3 py-1.5 text-xs font-medium text-white/70`}>
            +8 more
          </span>
        </div>
      </section>
    </div>
  );
};

export default Home;
