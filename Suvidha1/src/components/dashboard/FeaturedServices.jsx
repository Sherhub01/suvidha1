import React from "react";
import { Link } from "react-router-dom";
import ServiceCard from "./ServiceCard";
import { services, featuredServiceIds } from "../../data/mockData";

export default function FeaturedServices() {
  const featured = featuredServiceIds
    .map((id) => services.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          Popular services
        </h2>
        <Link to="/services" className="text-sm font-medium text-rose-500 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto scrollbar-none pb-2">
        {featured.map((service) => (
          <ServiceCard key={service.id} service={service} compact />
        ))}
      </div>
    </section>
  );
}
