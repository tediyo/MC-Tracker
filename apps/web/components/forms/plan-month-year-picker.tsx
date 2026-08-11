"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface PlanMonthYearPickerProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  /** (month, year) combos that already have a plan - disabled with a tooltip rather than silently accepted then rejected. */
  existingPeriods: ReadonlySet<string>;
}

function periodKey(month: number, year: number) {
  return `${year}-${month}`;
}

export function PlanMonthYearPicker({ month, year, onMonthChange, onYearChange, existingPeriods }: PlanMonthYearPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="plan-month">Month</Label>
        <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
          <SelectTrigger id="plan-month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, index) => {
              const monthNumber = index + 1;
              const disabled = existingPeriods.has(periodKey(monthNumber, year));
              return (
                <SelectItem key={monthNumber} value={String(monthNumber)} disabled={disabled}>
                  {name}
                  {disabled ? " (plan exists)" : ""}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="plan-year">Year</Label>
        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger id="plan-year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
