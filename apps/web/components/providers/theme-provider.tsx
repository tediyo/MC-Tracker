"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";

/** Must match the key read by the inline anti-flash script in app/layout.tsx. */
export const THEME_STORAGE_KEY = "mc-tracker-theme";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  /** False until the post-mount effect has synced from localStorage. Theme-dependent
   * UI (icons, labels) should hold its SSR-matching appearance until this flips, or
   * it'll render a different value client-side than the server did and fail
   * hydration - see the comment below. */
  mounted: boolean;
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
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

/**
 * Toggles the `data-theme` attribute that app/globals.css keys off of.
 * "system" means no attribute at all, so the CSS's `prefers-color-scheme`
 * fallback takes over - see globals.css for the light/dark token pairs.
 *
 * `theme` always *starts* at "system" on both server and client, even when a
 * different choice is stored - reading localStorage during the initial
 * render would make the client's first render disagree with the
 * server-rendered HTML (server has no localStorage), which is a hydration
 * mismatch, not just a wrong-icon flash: React discards and re-renders the
 * mismatched tree from scratch, clobbering the `data-theme` attribute the
 * inline anti-flash script had already set. Reading the real value in an
 * effect instead makes that a normal post-hydration update.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeMode>("system");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = readStoredTheme();
    if (stored !== "system") {
      setThemeState(stored);
      applyTheme(stored); // defensive - the inline script in app/layout.tsx already did this
    }
    setMounted(true);
  }, []);

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

  return <ThemeContext.Provider value={{ theme, setTheme, mounted }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
