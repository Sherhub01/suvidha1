import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { mockBookings } from "../data/mockData";

const BookingsContext = createContext(null);

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("suvidha1_bookings");
      return saved ? JSON.parse(saved) : mockBookings;
    } catch {
      return mockBookings;
    }
  });
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("suvidha1_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Poll for updates every 15s (simulates real-time — swap for WebSocket/SSE in production)
  useEffect(() => {
    const id = setInterval(() => setLastUpdated(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const updateStatus = useCallback((id, status) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              paymentStatus:
                status === "Cancelled" && b.paymentStatus === "Paid"
                  ? "Refunded"
                  : b.paymentStatus,
            }
          : b
      )
    );
  }, []);

  const submitRating = useCallback((id, rating) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, rating } : b))
    );
  }, []);

  const cancelBooking = useCallback((id) => updateStatus(id, "Cancelled"), [updateStatus]);

  return (
    <BookingsContext.Provider value={{ bookings, lastUpdated, updateStatus, submitRating, cancelBooking }}>
      {children}
    </BookingsContext.Provider>
  );
}

export const useBookings = () => useContext(BookingsContext);
