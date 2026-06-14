import React, { createContext, useContext, useState } from "react";

const INITIAL = [
  {
    id: 1,
    type: "booking",
    title: "Booking Confirmed",
    message: "Your plumber booking for tomorrow at 10:00 AM is confirmed.",
    time: "2 min ago",
    read: false,
    link: "/services/plumbing",
    icon: "🔧",
  },
  {
    id: 2,
    type: "alert",
    title: "New Review Received",
    message: "Ramesh Kumar left a 5-star review on your last service request.",
    time: "18 min ago",
    read: false,
    link: "/dashboard",
    icon: "⭐",
  },
  {
    id: 3,
    type: "promo",
    title: "20% Off Electrical Services",
    message: "Use code ELEC20 this weekend for 20% off all electrical bookings.",
    time: "1 hr ago",
    read: false,
    link: "/services/electrical",
    icon: "🎁",
  },
  {
    id: 4,
    type: "system",
    title: "Profile Incomplete",
    message: "Complete your profile to unlock all features and get better matches.",
    time: "3 hr ago",
    read: false,
    link: "/create-profile",
    icon: "👤",
  },
  {
    id: 5,
    type: "booking",
    title: "Service Completed",
    message: "Your AC repair service has been marked complete. Rate your experience!",
    time: "Yesterday",
    read: true,
    link: "/dashboard",
    icon: "✅",
  },
  {
    id: 6,
    type: "alert",
    title: "Worker Nearby",
    message: "3 verified electricians are available within 2 km of your location.",
    time: "Yesterday",
    read: true,
    link: "/services/electrical",
    icon: "📍",
  },
  {
    id: 7,
    type: "promo",
    title: "Weekend Special",
    message: "Book any cleaning service this weekend and get free pest control.",
    time: "2 days ago",
    read: true,
    link: "/services/cleaning",
    icon: "🧹",
  },
  {
    id: 8,
    type: "system",
    title: "App Update Available",
    message: "A new version of Suvidha1 is available with improved performance.",
    time: "3 days ago",
    read: true,
    link: "/settings",
    icon: "🔔",
  },
];

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearAll = () => setNotifications([]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
