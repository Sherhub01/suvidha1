import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, Settings as SettingsIcon, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import SearchBar from "./SearchBar";
import ProfileAvatar from "./ProfileAvatar";
import { MOCK_USER, fetchNotifications } from "../../api";

const NOTIF_ICONS = {
  success: <CheckCircle2 size={16} className="text-emerald-500" />,
  warning: <AlertTriangle size={16} className="text-amber-500" />,
  info: <Info size={16} className="text-blue-500" />,
};

/**
 * Sticky top bar for the consumer dashboard. Shows a hamburger menu
 * on mobile (toggles the Sidebar drawer via `onMenuClick`), a
 * personalised greeting, the global SearchBar, notifications and
 * the profile menu.
 */
const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = MOCK_USER;
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications().then(setNotifications);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("suvidha1_token");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="hidden shrink-0 sm:block">
        <p className="text-base font-bold text-gray-900">
          Welcome, <span className="text-indigo-600">{user.firstName}</span>
        </p>
        <p className="text-xs text-gray-500">Let's get something done today</p>
      </div>

      <div className="flex-1">
        <SearchBar className="mx-auto max-w-xl" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            className="relative rounded-full p-2.5 text-gray-500 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              <p className="px-3 py-2 text-sm font-semibold text-gray-900">Notifications</p>
              <div className="flex flex-col gap-1">
                {notifications.map((n) => (
                  <div key={n.id} className="flex gap-2 rounded-xl px-3 py-2.5 hover:bg-gray-50">
                    <div className="mt-0.5">{NOTIF_ICONS[n.type] || NOTIF_ICONS.info}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-[11px] text-gray-400">{n.time}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="rounded-full ring-offset-2 transition hover:ring-2 hover:ring-indigo-200"
            aria-label="Account menu"
          >
            <ProfileAvatar user={user} showOnline />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <SettingsIcon size={16} /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-500 hover:bg-rose-50"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
