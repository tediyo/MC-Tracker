"use client";

import * as React from "react";
import { Calendar as CalendarIcon, Repeat, ChevronDown } from "lucide-react";
import {
  ETHIOPIAN_MONTHS,
  getEthiopianDate,
  toGregorianDate,
  getDaysInEthiopianMonth,
} from "@mc-tracker/shared-types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EthiopianDatePickerProps {
  label?: string;
  value: string; // Gregorian ISO string "YYYY-MM-DD"
  onChange: (isoDate: string) => void;
  required?: boolean;
}

export function EthiopianDatePicker({
  label = "Date",
  value,
  onChange,
  required = false,
}: EthiopianDatePickerProps) {
  const [useEthiopian, setUseEthiopian] = React.useState<boolean>(true);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parse current Gregorian value to Ethiopian
  const ethDate = React.useMemo(() => {
    if (!value) return getEthiopianDate(new Date());
    return getEthiopianDate(value);
  }, [value]);

  const [year, setYear] = React.useState<number>(ethDate.year);
  const [month, setMonth] = React.useState<number>(ethDate.month);
  const [day, setDay] = React.useState<number>(ethDate.day);

  // Sync internal state when external value changes
  React.useEffect(() => {
    setYear(ethDate.year);
    setMonth(ethDate.month);
    setDay(ethDate.day);
  }, [ethDate.year, ethDate.month, ethDate.day]);

  // Close popover when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const daysInCurrentMonth = React.useMemo(() => {
    return getDaysInEthiopianMonth(year, month);
  }, [year, month]);

  const handleEthiopianChange = (newYear: number, newMonth: number, newDay: number) => {
    const maxDays = getDaysInEthiopianMonth(newYear, newMonth);
    const validDay = Math.min(newDay, maxDays);
    setYear(newYear);
    setMonth(newMonth);
    setDay(validDay);

    const greg = toGregorianDate(newYear, newMonth, validDay);
    const iso = greg.toISOString().slice(0, 10);
    onChange(iso);
  };

  const years = React.useMemo(() => {
    const currentEthYear = getEthiopianDate(new Date()).year;
    return Array.from({ length: 11 }, (_, i) => currentEthYear - 5 + i);
  }, []);

  const monthObj = ETHIOPIAN_MONTHS.find((m) => m.number === month) || ETHIOPIAN_MONTHS[0];

  const formattedDisplay = React.useMemo(() => {
    if (useEthiopian) {
      return `${monthObj?.nameEn} ${day}, ${year} E.C.`;
    }
    return value || "Select Date";
  }, [useEthiopian, monthObj?.nameEn, day, year, value]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5 w-full">
      {label ? (
        <Label className="text-xs font-semibold text-muted-foreground">
          {label} {required ? <span className="text-destructive">*</span> : null}
        </Label>
      ) : null}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-border/80 bg-card px-3 text-xs font-medium text-foreground hover:bg-accent/40 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="truncate">{formattedDisplay}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-72 rounded-xl border border-border bg-popover p-3.5 shadow-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
            <span className="text-xs font-bold text-foreground">Date Selector</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUseEthiopian(!useEthiopian)}
              className="h-6 px-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
            >
              <Repeat className="h-3 w-3" />
              {useEthiopian ? "Gregorian" : "Ethiopian"}
            </Button>
          </div>

          {useEthiopian ? (
            <div className="flex flex-col gap-3">
              {/* Year Select */}
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Year</Label>
                <Select
                  value={String(year)}
                  onValueChange={(val) => handleEthiopianChange(Number(val), month, day)}
                >
                  <SelectTrigger className="h-9 rounded-lg text-xs border-border/60 bg-card">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs">
                        {y} E.C.
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month Select */}
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Month</Label>
                <Select
                  value={String(month)}
                  onValueChange={(val) => handleEthiopianChange(year, Number(val), day)}
                >
                  <SelectTrigger className="h-9 rounded-lg text-xs border-border/60 bg-card">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {ETHIOPIAN_MONTHS.map((m) => (
                      <SelectItem key={m.number} value={String(m.number)} className="text-xs">
                        {m.nameEn} ({m.nameAm})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day Select */}
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Day</Label>
                <Select
                  value={String(day)}
                  onValueChange={(val) => handleEthiopianChange(year, month, Number(val))}
                >
                  <SelectTrigger className="h-9 rounded-lg text-xs border-border/60 bg-card">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)} className="text-xs">
                        Day {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground truncate">
                  ISO: <strong className="text-foreground">{value}</strong>
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-7 px-3 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 rounded-lg text-xs border-border/60 bg-card"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 px-3 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium self-end"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
