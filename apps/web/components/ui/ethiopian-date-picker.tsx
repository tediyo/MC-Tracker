"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Repeat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  ETHIOPIAN_MONTHS,
  getEthiopianDate,
  toGregorianDate,
  getDaysInEthiopianMonth,
} from "@mc-tracker/shared-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EthiopianDatePickerProps {
  label?: string;
  value: string; // Gregorian ISO string "YYYY-MM-DD"
  onChange: (isoDate: string) => void;
  required?: boolean;
  className?: string;
}

const GREGORIAN_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInGregorianMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EthiopianDatePicker({
  label = "Date",
  value,
  onChange,
  required = false,
  className,
}: EthiopianDatePickerProps) {
  const [useEthiopian, setUseEthiopian] = React.useState<boolean>(true);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [showYearPicker, setShowYearPicker] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Current today reference
  const todayGregIso = React.useMemo(() => formatLocalDate(new Date()), []);
  const todayEth = React.useMemo(() => getEthiopianDate(todayGregIso), [todayGregIso]);

  // Selected date state
  const selectedEth = React.useMemo(() => {
    if (!value) return todayEth;
    try {
      return getEthiopianDate(value);
    } catch {
      return todayEth;
    }
  }, [value, todayEth]);

  const selectedGreg = React.useMemo(() => {
    if (!value) return new Date();
    try {
      return new Date(value);
    } catch {
      return new Date();
    }
  }, [value]);

  // Calendar view state (which month/year is currently being viewed)
  const [viewYear, setViewYear] = React.useState<number>(selectedEth.year);
  const [viewMonth, setViewMonth] = React.useState<number>(selectedEth.month);

  // Sync viewing position when popover opens or value changes
  React.useEffect(() => {
    if (useEthiopian) {
      setViewYear(selectedEth.year);
      setViewMonth(selectedEth.month);
    } else {
      setViewYear(selectedGreg.getFullYear());
      setViewMonth(selectedGreg.getMonth() + 1);
    }
  }, [isOpen, useEthiopian, selectedEth.year, selectedEth.month, selectedGreg]);

  // Close popover when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearPicker(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calendar calculations
  const daysInMonth = React.useMemo(() => {
    return useEthiopian
      ? getDaysInEthiopianMonth(viewYear, viewMonth)
      : getDaysInGregorianMonth(viewYear, viewMonth);
  }, [useEthiopian, viewYear, viewMonth]);

  const firstDayWeekday = React.useMemo(() => {
    try {
      if (useEthiopian) {
        return toGregorianDate(viewYear, viewMonth, 1).getDay();
      }
      return new Date(viewYear, viewMonth - 1, 1).getDay();
    } catch {
      return 0;
    }
  }, [useEthiopian, viewYear, viewMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (useEthiopian) {
      if (viewMonth === 1) {
        setViewMonth(13);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else {
      if (viewMonth === 1) {
        setViewMonth(12);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (useEthiopian) {
      if (viewMonth === 13) {
        setViewMonth(1);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    } else {
      if (viewMonth === 12) {
        setViewMonth(1);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    }
  };

  // Day selection
  const handleSelectDay = (day: number) => {
    if (useEthiopian) {
      const greg = toGregorianDate(viewYear, viewMonth, day);
      onChange(formatLocalDate(greg));
    } else {
      const pad = (n: number) => String(n).padStart(2, "0");
      onChange(`${viewYear}-${pad(viewMonth)}-${pad(day)}`);
    }
  };

  // Quick jump to Today
  const handleSelectToday = () => {
    onChange(todayGregIso);
    if (useEthiopian) {
      setViewYear(todayEth.year);
      setViewMonth(todayEth.month);
    } else {
      const d = new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth() + 1);
    }
  };

  // Year options for fast year picker
  const yearOptions = React.useMemo(() => {
    const center = viewYear;
    return Array.from({ length: 15 }, (_, i) => center - 7 + i);
  }, [viewYear]);

  // View month name display
  const viewMonthName = React.useMemo(() => {
    if (useEthiopian) {
      return ETHIOPIAN_MONTHS[viewMonth - 1]?.nameEn || `Month ${viewMonth}`;
    }
    return GREGORIAN_MONTH_NAMES[viewMonth - 1] || "";
  }, [useEthiopian, viewMonth]);

  // Selected date title display
  const selectedHeaderTitle = React.useMemo(() => {
    if (useEthiopian) {
      const mName = ETHIOPIAN_MONTHS[selectedEth.month - 1]?.nameEn || `Month ${selectedEth.month}`;
      return `${mName} ${selectedEth.day}, ${selectedEth.year}`;
    }
    const mName = GREGORIAN_MONTH_NAMES[selectedGreg.getMonth()] || "";
    return `${mName} ${selectedGreg.getDate()}, ${selectedGreg.getFullYear()}`;
  }, [useEthiopian, selectedEth, selectedGreg]);

  // Trigger button label display
  const formattedDisplay = React.useMemo(() => {
    if (!value) return "Select Date";
    if (useEthiopian) {
      const mName = ETHIOPIAN_MONTHS[selectedEth.month - 1]?.nameEn || `Month ${selectedEth.month}`;
      return `${mName} ${selectedEth.day}, ${selectedEth.year} E.C.`;
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(selectedGreg.getMonth() + 1)}/${pad(selectedGreg.getDate())}/${selectedGreg.getFullYear()}`;
  }, [useEthiopian, selectedEth, selectedGreg, value]);

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1.5 w-full max-w-[240px]", className)}>
      {label ? (
        <Label className="text-xs font-semibold text-muted-foreground">
          {label} {required ? <span className="text-destructive">*</span> : null}
        </Label>
      ) : null}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowYearPicker(false);
        }}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-border/80 bg-card px-3 text-xs font-medium text-foreground hover:bg-accent/40 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="truncate">{formattedDisplay}</span>
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1 transition-transform duration-150", isOpen && "rotate-180")} />
      </button>

      {/* Calendar Grid Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-80 rounded-2xl border border-border bg-popover p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header Block: Title & Calendar System Switcher */}
          <div className="flex items-start justify-between pb-3 border-b border-border/60 mb-3">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Select date</p>
              <h3 className="text-lg font-bold text-foreground tracking-tight mt-0.5">{selectedHeaderTitle}</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setUseEthiopian(!useEthiopian);
                setShowYearPicker(false);
              }}
              className="h-7 px-2.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1.5 rounded-lg"
            >
              <Repeat className="h-3 w-3" />
              {useEthiopian ? "E.C." : "G.C."}
            </Button>
          </div>

          {/* Month & Year Navigation Toolbar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={() => setShowYearPicker((prev) => !prev)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-bold text-foreground hover:bg-accent/60 transition-colors"
            >
              <span>{viewMonthName} {viewYear}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", showYearPicker && "rotate-180")} />
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showYearPicker ? (
            /* Fast Year Selector */
            <div className="max-h-56 overflow-y-auto py-2 grid grid-cols-3 gap-2 border-y border-border/40 my-2 pr-1">
              {yearOptions.map((y) => {
                const isSelected = y === viewYear;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewYear(y);
                      setShowYearPicker(false);
                    }}
                    className={cn(
                      "py-2 px-1 rounded-xl text-xs font-semibold transition-all",
                      isSelected
                        ? "bg-emerald-600 text-white font-bold shadow-sm"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    {y} {useEthiopian ? "E.C." : ""}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Calendar Day Grid */
            <div>
              {/* Day of Week Row */}
              <div className="grid grid-cols-7 mb-1.5 text-center">
                {WEEKDAYS.map((w, idx) => (
                  <span key={idx} className="text-xs font-bold text-muted-foreground/80 py-1">
                    {w}
                  </span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Blank Offset Cells */}
                {Array.from({ length: firstDayWeekday }, (_, i) => (
                  <div key={`empty-${i}`} className="h-8 w-8" />
                ))}

                {/* Days in Month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isSelected = useEthiopian
                    ? day === selectedEth.day && viewMonth === selectedEth.month && viewYear === selectedEth.year
                    : day === selectedGreg.getDate() && viewMonth === (selectedGreg.getMonth() + 1) && viewYear === selectedGreg.getFullYear();

                  const isToday = useEthiopian
                    ? day === todayEth.day && viewMonth === todayEth.month && viewYear === todayEth.year
                    : day === new Date().getDate() && viewMonth === (new Date().getMonth() + 1) && viewYear === new Date().getFullYear();

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        "h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-all",
                        isSelected
                          ? "bg-emerald-600 text-white font-bold shadow-sm hover:bg-emerald-600"
                          : "text-foreground hover:bg-accent/80 hover:text-foreground",
                        !isSelected && isToday && "border border-emerald-500 font-bold text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-1 py-0.5"
            >
              Today
            </button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setShowYearPicker(false);
              }}
              className="h-7 px-3.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

