import { Link } from "react-router-dom";

const ServiceCard = ({ service }) => {
  const Icon = service.icon;

  return (
    <Link
      to={`/services/${service.slug}`}
      className="group relative flex h-44 flex-col overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.30)]"
    >
      {/* Full image — 100% visible, covers entire card */}
      <img
        src={service.bg}
        alt={service.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Top-to-bottom dark gradient — icon readable at top, text readable at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.72) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        {/* Icon — white circle with blur backdrop */}
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/30 text-white backdrop-blur-md ring-1 ring-white/40">
          <Icon size={22} strokeWidth={2} className="drop-shadow-md" />
        </span>

        {/* Name + price */}
        <div>
          <h3
            className="text-sm font-extrabold text-white"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9), 0 0px 2px rgba(0,0,0,1)" }}
          >
            {service.name}
          </h3>
          {service.startingPrice && (
            <p
              className="mt-0.5 text-[11px] font-semibold text-white"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
            >
              From ₹{service.startingPrice}
              {service.priceType === "hourly" ? "/hr" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
