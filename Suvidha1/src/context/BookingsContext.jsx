import { createContext, useCallback, useContext, useMemo } from "react";
import { http } from "../services/http";
import { assetUrl } from "../config";
import { getRole, getToken } from "../routes/guards";
import useApiData from "../hooks/useApiData";

const BookingsContext = createContext(null);

const POLL_MS = 15000;

/** Maps a booking document onto the shape the consumer screens render. */
function normalise(b) {
  const staff = b.staff || {};
  return {
    id: b._id,
    workerId: staff._id || b.staff || null,
    workerName:
      b.workerName || `${staff.firstName || ""} ${staff.lastName || ""}`.trim() || "Professional",
    workerPhoto: b.workerPhoto || assetUrl(staff.avatar),
    workerPhone: b.workerPhone || staff.phone || "",
    service: b.service,
    category: b.category,
    date: b.date,
    time: b.time,
    address: b.address,
    description: b.description,
    price: b.price,
    status: b.status,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    rating: b.rating,
  };
}

export function BookingsProvider({ children }) {
  // Only consumers have a bookings list; staff and admins skip the request
  // entirely rather than firing a 403 every fifteen seconds.
  const enabled = Boolean(getToken()) && getRole() === "consumer";

  const fetchBookings = useCallback(async ({ signal }) => {
    const { data } = await http.get("/bookings/consumer", { signal });
    return data.success ? data.bookings.map(normalise) : [];
  }, []);

  const {
    data: bookings,
    loading,
    error,
    lastUpdated,
    setData: setBookings,
    reload,
  } = useApiData(fetchBookings, { initial: [], pollMs: POLL_MS, enabled });

  const updateStatus = useCallback(
    async (id, status) => {
      // Optimistic: the list updates immediately and the poll reconciles it.
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status,
                paymentStatus:
                  status === "Cancelled" && b.paymentStatus === "Paid" ? "Refunded" : b.paymentStatus,
              }
            : b
        )
      );

      const path =
        status === "Cancelled" ? "cancel" : status === "Completed" ? "complete" : null;
      if (!path) return;

      try {
        await http.patch(`/bookings/${id}/${path}`);
      } catch {
        // The next poll restores the server's view.
        reload();
      }
    },
    [setBookings, reload]
  );

  const submitRating = useCallback(
    async (id, rating) => {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, rating } : b)));
      try {
        await http.patch(`/bookings/${id}/rate`, { rating });
      } catch {
        reload();
      }
    },
    [setBookings, reload]
  );

  const cancelBooking = useCallback((id) => updateStatus(id, "Cancelled"), [updateStatus]);

  const addBooking = useCallback(
    (raw) => setBookings((prev) => [normalise(raw), ...prev]),
    [setBookings]
  );

  const value = useMemo(
    () => ({
      bookings: bookings || [],
      loading,
      error,
      lastUpdated,
      updateStatus,
      submitRating,
      cancelBooking,
      addBooking,
      reload,
    }),
    [bookings, loading, error, lastUpdated, updateStatus, submitRating, cancelBooking, addBooking, reload]
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export const useBookings = () => useContext(BookingsContext);
