import { User } from "lucide-react";

/**
 * Circular user avatar. Falls back to initials (or a generic user
 * icon) on a pink background when no photo is available, and can
 * show a green "online" indicator dot.
 */
const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const ProfileAvatar = ({ user, size = "md", showOnline = false, className = "" }) => {
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  const sizeClasses = SIZES[size] || SIZES.md;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {user?.profilePhoto ? (
        <img
          src={user.profilePhoto}
          alt={`${user?.firstName || "User"} avatar`}
          className={`${sizeClasses} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <span
          className={`${sizeClasses} flex items-center justify-center rounded-full bg-pink-500 font-bold text-white ring-2 ring-white`}
        >
          {initials || <User size={18} />}
        </span>
      )}
      {showOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </div>
  );
};

export default ProfileAvatar;
