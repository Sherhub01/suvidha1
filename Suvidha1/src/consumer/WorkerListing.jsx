import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import WorkerCard from "../components/dashboard/WorkerCard";
import { services, popularWorkers } from "../data/mockData";

export default function WorkerListing() {
  const { category } = useParams();
  const service = services.find((s) => s.id === category);
  const [sortBy, setSortBy] = useState("rating");

  const workers = useMemo(() => {
    const list = [...popularWorkers];
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "price")
      list.sort((a, b) => parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, "")));
    return list;
  }, [sortBy]);

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft size={15} /> All services
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          {service ? service.name : "Professionals"}
        </h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        >
          <option value="rating">Sort by rating</option>
          <option value="price">Sort by price</option>
        </select>
      </div>

      {service && <p className="mt-1 text-sm text-slate-500">{service.description}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </div>
  );
}
