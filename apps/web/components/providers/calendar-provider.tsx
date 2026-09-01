"use client";

import * as React from "react";

export type CalendarMode = "ethiopian" | "gregorian";

export const CALENDAR_STORAGE_KEY = "mc-tracker-calendar-mode";

type CalendarContextValue = {
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
  mounted: boolean;
};

const CalendarContext = React.createContext<CalendarContextValue | null>(null);

function readStoredCalendarMode(): CalendarMode {
  try {
    const stored = window.localStorage.getItem(CALENDAR_STORAGE_KEY);
    return stored === "gregorian" ? "gregorian" : "ethiopian";
  } catch {
    return "ethiopian";
  }
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [calendarMode, setCalendarModeState] = React.useState<CalendarMode>("ethiopian");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = readStoredCalendarMode();
    setCalendarModeState(stored);
    setMounted(true);
  }, []);

  const setCalendarMode = React.useCallback((next: CalendarMode) => {
    setCalendarModeState(next);
    try {
      window.localStorage.setItem(CALENDAR_STORAGE_KEY, next);
    } catch {
      // Ignore local storage write errors in private contexts
    }
  }, []);

  return (
    <CalendarContext.Provider value={{ calendarMode, setCalendarMode, mounted }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarPreference() {
  const ctx = React.useContext(CalendarContext);
  if (!ctx) {
    throw new Error("useCalendarPreference must be used within a CalendarProvider");
  }
  return ctx;
}
