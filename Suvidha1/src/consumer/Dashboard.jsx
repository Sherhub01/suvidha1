import React from "react";
import GreetingHero from "../components/dashboard/GreetingHero";
import SearchBar from "../components/dashboard/SearchBar";
import FeaturedServices from "../components/dashboard/FeaturedServices";
import PopularWorkers from "../components/dashboard/PopularWorkers";
import RecentRequests from "../components/dashboard/RecentRequests";
import NearbyProfessionals from "../components/dashboard/NearbyProfessionals";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <GreetingHero user={user} />
      <SearchBar />
      <FeaturedServices />
      <PopularWorkers />
      <RecentRequests />
      <NearbyProfessionals />
    </div>
  );
}
