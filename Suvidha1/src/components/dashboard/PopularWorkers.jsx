import React from "react";
import WorkerCard from "./WorkerCard";
import { popularWorkers } from "../../data/mockData";

export default function PopularWorkers() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-slate-800">
        Popular professionals near you
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {popularWorkers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </section>
  );
}
