import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";
import ChatBot from "../componentsConsumer/ChatBot";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const stored = JSON.parse(localStorage.getItem("user")) || {};
  const user = {
    firstName: stored.firstName || "User",
    lastName:  stored.lastName  || "",
    avatar:    stored.avatar    || null,
    email:     stored.email     || "",
  };

  const handleSearch = (query) => {
    if (!query?.trim()) return;
    navigate(`/services?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div
        className={`flex flex-1 flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <TopBar
          user={user}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          onSearch={handleSearch}
        />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ChatBot />
    </div>
  );
}
