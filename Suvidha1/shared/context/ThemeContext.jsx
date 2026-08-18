import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ────────────────────────────────────────────────────────────
// Theme
//
// Three settings: "light", "dark", or "system" (follow the OS). The choice is
// persisted; "system" keeps tracking the OS preference for as long as it is
// selected.
//
// The resolved theme is applied as a `dark` class on <html>, which is what the
// @custom-variant in index.css keys off.
// ────────────────────────────────────────────────────────────

const STORAGE_KEY = "suvidha1.theme";

const ThemeContext = createContext(null);

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const readStored = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch {
    return "system";
  }
};

/** Applies the resolved theme to <html> so CSS and the browser chrome follow. */
const applyTheme = (resolved) => {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
};

export function ThemeProvider({ children }) {
  // Read during the first render so there is no flash of the wrong theme.
  const [preference, setPreference] = useState(readStored);
  const [systemDark, setSystemDark] = useState(prefersDark);

  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  // Track the OS preference while "system" is selected.
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return undefined;

    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const setTheme = useCallback((next) => {
    setPreference(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode — the theme still applies for this session.
    }
  }, []);

  /** Flips between light and dark, leaving "system" behind. */
  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  const value = useMemo(
    () => ({ preference, theme: resolved, isDark: resolved === "dark", setTheme, toggle }),
    [preference, resolved, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider.");
  }
  return context;
}
