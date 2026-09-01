"use client";

import * as React from "react";
import { Calendar, Repeat } from "lucide-react";
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

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label ? (
          <Label className="text-xs font-semibold text-muted-foreground">
            {label} {required ? <span className="text-destructive">*</span> : null}
          </Label>
        ) : <div />}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setUseEthiopian(!useEthiopian)}
          className="h-6 px-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10 gap-1"
        >
          <Repeat className="h-3 w-3" />
          {useEthiopian ? "Switch to Gregorian" : "Switch to Ethiopian"}
        </Button>
      </div>

      {useEthiopian ? (
        <div className="grid grid-cols-3 gap-2">
          {/* Year Select */}
          <Select
            value={String(year)}
            onValueChange={(val) => handleEthiopianChange(Number(val), month, day)}
          >
            <SelectTrigger className="h-9 rounded-xl text-xs font-medium border-border/60 bg-card">
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

          {/* Month Select */}
          <Select
            value={String(month)}
            onValueChange={(val) => handleEthiopianChange(year, Number(val), day)}
          >
            <SelectTrigger className="h-9 rounded-xl text-xs font-medium border-border/60 bg-card">
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

          {/* Day Select */}
          <Select
            value={String(day)}
            onValueChange={(val) => handleEthiopianChange(year, month, Number(val))}
          >
            <SelectTrigger className="h-9 rounded-xl text-xs font-medium border-border/60 bg-card">
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
      ) : (
        <div className="relative">
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 rounded-xl text-xs border-border/60 bg-card"
          />
        </div>
      )}

      {useEthiopian ? (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3 text-emerald-500" />
          <span>
            Selected: <strong className="text-foreground">{monthObj?.nameEn} {day}, {year} E.C.</strong> ({value})
          </span>
        </p>
      ) : null}
    </div>
  );
}
