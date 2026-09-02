"use client";

import * as React from "react";

export const LIVE_MODE_STORAGE_KEY = "mc-tracker-live-mode-enabled";

type LiveModeContextValue = {
  isLiveMode: boolean;
  setIsLiveMode: (enabled: boolean) => void;
  mounted: boolean;
};

const LiveModeContext = React.createContext<LiveModeContextValue | null>(null);

function readStoredLiveMode(): boolean {
  try {
    const stored = window.localStorage.getItem(LIVE_MODE_STORAGE_KEY);
    return stored === "true";
  } catch {
    return false;
  }
}

export function LiveModeProvider({ children }: { children: React.ReactNode }) {
  const [isLiveMode, setIsLiveModeState] = React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = readStoredLiveMode();
    setIsLiveModeState(stored);
    setMounted(true);
  }, []);

  const setIsLiveMode = React.useCallback((enabled: boolean) => {
    setIsLiveModeState(enabled);
    try {
      window.localStorage.setItem(LIVE_MODE_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <LiveModeContext.Provider value={{ isLiveMode, setIsLiveMode, mounted }}>
      {children}
    </LiveModeContext.Provider>
  );
}

export function useLiveModePreference() {
  const ctx = React.useContext(LiveModeContext);
  if (!ctx) {
    throw new Error("useLiveModePreference must be used within a LiveModeProvider");
  }
  return ctx;
}
