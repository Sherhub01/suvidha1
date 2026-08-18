import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { IconButton } from "./Button";
import { cx, FOCUS_RING } from "./tokens";

/**
 * Light / dark switch.
 *
 * `variant="icon"` is a single button for the top bar; `variant="segmented"`
 * shows all three options and belongs on the Settings screens, where "follow
 * system" needs to be reachable.
 */
export default function ThemeToggle({ variant = "icon", className = "" }) {
  const { preference, isDark, setTheme, toggle } = useTheme();

  if (variant === "icon") {
    return (
      <IconButton
        icon={isDark ? Sun : Moon}
        label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        onClick={toggle}
        className={className}
      />
    );
  }

  const OPTIONS = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cx(
        "inline-flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800",
        className
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
              FOCUS_RING
            )}
          >
            <Icon size={13} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
