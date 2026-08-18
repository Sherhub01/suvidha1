import { createContext, useCallback, useContext, useMemo } from "react";
import { http } from "../../../shared/services/http";
import { assetUrl } from "../../../shared/config";
import { getRole, getToken } from "../../../app/guards";
import useApiData from "../../../shared/hooks/useApiData";

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
    price: b.priceLabel || b.price || "",
    pricing: b.pricing || null,
    slotLabel: b.slotLabel || "",
    scheduledAt: b.scheduledAt || null,
    status: b.status,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    rating: b.review?.rating ?? null,
    reviewId: b.review?._id ?? null,
    staffProfile: b.staffProfile || null,
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

  /**
   * Cancels a booking and returns the server's refund decision so the caller
   * can tell the customer what they will get back.
   *
   * Completion is no longer a consumer action — only the professional can mark
   * a job done, and ratings moved to the reviews endpoint.
   */
  const cancelBooking = useCallback(
    async (id, reason = "") => {
      // Optimistic; the next poll reconciles with the server.
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
      );

      try {
        const { data } = await http.patch(`/bookings/${id}/cancel`, { reason });
        reload();
        return data.refund || null;
      } catch (err) {
        reload();
        throw err;
      }
    },
    [setBookings, reload]
  );

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
      cancelBooking,
      addBooking,
      reload,
    }),
    [bookings, loading, error, lastUpdated, cancelBooking, addBooking, reload]
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export const useBookings = () => useContext(BookingsContext);
