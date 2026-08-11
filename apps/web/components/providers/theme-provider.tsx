"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";

/** Must match the key read by the inline anti-flash script in app/layout.tsx. */
export const THEME_STORAGE_KEY = "mc-tracker-theme";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

/**
 * Toggles the `data-theme` attribute that app/globals.css keys off of.
 * "system" means no attribute at all, so the CSS's `prefers-color-scheme`
 * fallback takes over - see globals.css for the light/dark token pairs.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeMode>(readStoredTheme);

  const setTheme = React.useCallback((next: ThemeMode) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage can throw in private-browsing/blocked-storage contexts - the
      // in-memory state above still drives the current session correctly.
    }
    applyTheme(next);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
