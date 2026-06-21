import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const BookingsContext = createContext(null);

const API = axios.create({ baseURL: "http://localhost:5000/api" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await API.get("/bookings/consumer");
      if (data.success) setBookings(data.bookings.map(normalise));
    } catch { /* offline / not logged in */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll every 15s
  useEffect(() => {
    const id = setInterval(() => { load(); setLastUpdated(Date.now()); }, 15000);
    return () => clearInterval(id);
  }, [load]);

  const updateStatus = useCallback(async (id, status) => {
    if (status === "Cancelled") {
      try { await API.patch(`/bookings/${id}/cancel`); } catch { /* optimistic */ }
    } else if (status === "Completed") {
      try { await API.patch(`/bookings/${id}/complete`); } catch { /* optimistic */ }
    }
    setBookings((prev) => prev.map((b) =>
      b.id === id
        ? { ...b, status, paymentStatus: status === "Cancelled" && b.paymentStatus === "Paid" ? "Refunded" : b.paymentStatus }
        : b
    ));
  }, []);

  const submitRating = useCallback(async (id, rating) => {
    try { await API.patch(`/bookings/${id}/rate`, { rating }); } catch { /* optimistic */ }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, rating } : b)));
  }, []);

  const cancelBooking = useCallback((id) => updateStatus(id, "Cancelled"), [updateStatus]);

  const addBooking = useCallback((raw) => {
    setBookings((prev) => [normalise(raw), ...prev]);
  }, []);

  return (
    <BookingsContext.Provider value={{ bookings, loading, lastUpdated, updateStatus, submitRating, cancelBooking, addBooking, reload: load }}>
      {children}
    </BookingsContext.Provider>
  );
}

export const useBookings = () => useContext(BookingsContext);

// Normalise MongoDB booking → UI shape
function normalise(b) {
  const staff = b.staff || {};
  return {
    id:            b._id,
    workerId:      staff._id || b.staff || null,
    workerName:    b.workerName || `${staff.firstName || ""} ${staff.lastName || ""}`.trim() || "Professional",
    workerPhoto:   b.workerPhoto || (staff.avatar ? `http://localhost:5000${staff.avatar}` : null),
    workerPhone:   b.workerPhone || staff.phone || "",
    service:       b.service,
    category:      b.category,
    date:          b.date,
    time:          b.time,
    address:       b.address,
    description:   b.description,
    price:         b.price,
    status:        b.status,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    rating:        b.rating,
  };
}
